/**
 * StageLink Help & Support System — Frontend Service
 *
 * Provides API communication with Django REST Framework backend with graceful
 * fallback to local in-memory storage for high-fidelity offline development.
 */

import {
  CANDIDATE_CATEGORIES,
  RECRUITER_CATEGORIES,
  getStoredSupportTickets,
  saveStoredSupportTickets,
  getNextTicketNumber,
} from '../data/mockSupportTickets';
import { addStoredNotification } from '../data/mockNotifications';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/support`
  : '/api/support';

const fetchWithTimeout = async (url, options = {}, timeoutMs = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
};

export const normalizeTicket = (t) => {
  if (!t) return t;
  return {
    ...t,
    id: t.id || t.ticket_number || t.ticketNumber,
    ticketNumber: t.ticketNumber || t.ticket_number || t.id,
    userId: t.userId || t.user_id,
    userName: t.userName || t.user_name,
    userEmail: t.userEmail || t.user_email,
    userRole: t.userRole || t.user_role,
    companyName: t.companyName || t.company_name || '',
    assignedTo: t.assignedTo || t.assigned_to,
    assignedStaffId: t.assignedStaffId || t.assigned_staff_id,
    createdAt: t.createdAt || t.created_at,
    lastReplyAt: t.lastReplyAt || t.last_reply_at,
    lastReplyBy: t.lastReplyBy || t.last_reply_by,
    lastReplyRole: t.lastReplyRole || t.last_reply_role,
    unreadForUser: t.unreadForUser !== undefined ? t.unreadForUser : t.unread_for_user,
    unreadForStaff: t.unreadForStaff !== undefined ? t.unreadForStaff : t.unread_for_staff,
    messages: (t.messages || []).map((m) => ({
      ...m,
      senderId: m.senderId || m.sender_id,
      senderName: m.senderName || m.sender_name,
      senderRole: m.senderRole || m.sender_role,
      timestamp: m.timestamp || m.created_at,
    })),
    notes: (t.notes || []).map((n) => ({
      ...n,
      authorId: n.authorId || n.author_id,
      authorName: n.authorName || n.author_name,
      timestamp: n.timestamp || n.created_at,
    })),
  };
};

export const supportService = {
  /**
   * Returns categories tailored to the user's role.
   */
  getCategories: (role = 'candidate') => {
    return role === 'recruiter' || role === 'admin'
      ? RECRUITER_CATEGORIES
      : CANDIDATE_CATEGORIES;
  },

  /**
   * Lists tickets according to user role and filters.
   */
  getTickets: async ({
    role = 'candidate',
    userId = '',
    status = 'all',
    userType = 'all',
    search = '',
    category = 'all',
  } = {}) => {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (userId) params.append('user_id', userId);
      if (status && status !== 'all') params.append('status', status);
      if (userType && userType !== 'all') params.append('user_type', userType);
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);

      const res = await fetchWithTimeout(`${API_BASE_URL}/tickets/?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const rawResults = data.results || [];
        return {
          results: rawResults.map(normalizeTicket),
          count: data.count || rawResults.length,
          source: 'backend-drf',
        };
      }
    } catch {
      // Graceful offline fallback
    }

    // Client-side fallback from localStorage
    const all = getStoredSupportTickets();
    let filtered = [...all];

    if (role in { candidate: 1 }) {
      filtered = filtered.filter(
        (t) => t.userRole === 'candidate' && (!userId || t.userId === userId)
      );
    } else if (role in { recruiter: 1 }) {
      filtered = filtered.filter(
        (t) =>
          (t.userRole === 'recruiter' || t.userRole === 'admin') &&
          (!userId || t.userId === userId)
      );
    } // operations / admin sees all

    if (userType && userType !== 'all') {
      if (userType === 'candidate' || userType === 'candidates') {
        filtered = filtered.filter((t) => t.userRole === 'candidate');
      } else if (
        userType === 'recruiter' ||
        userType === 'recruiters' ||
        userType === 'production'
      ) {
        filtered = filtered.filter((t) => t.userRole === 'recruiter' || t.userRole === 'admin');
      }
    }

    if (status && status !== 'all') {
      if (status === 'new') {
        filtered = filtered.filter((t) => t.status === 'open' && t.unreadForStaff);
      } else {
        filtered = filtered.filter((t) => t.status === status);
      }
    }

    if (category && category !== 'all') {
      filtered = filtered.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.ticketNumber || '').toLowerCase().includes(q) ||
          (t.subject || '').toLowerCase().includes(q) ||
          (t.userName || '').toLowerCase().includes(q) ||
          (t.companyName || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.lastReplyAt || b.createdAt) - new Date(a.lastReplyAt || a.createdAt));

    // Strip internal notes if viewing as candidate or recruiter
    const sanitized = filtered.map((t) => {
      if (role !== 'operations' && role !== 'admin') {
        return { ...t, notes: [] };
      }
      return t;
    });

    return { results: sanitized, count: sanitized.length, source: 'local-store' };
  },

  /**
   * Retrieves single ticket conversation by ID.
   */
  getTicketById: async (ticketId, { role = 'candidate', userId = '' } = {}) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/tickets/${ticketId}/?role=${role}&user_id=${userId}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return normalizeTicket(data);
      }
    } catch {
      // Fallback
    }

    const all = getStoredSupportTickets();
    const found = all.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!found) return null;

    // Permissions check
    if (role !== 'operations' && role !== 'admin') {
      if (userId && found.userId !== userId) {
        throw new Error('Unauthorized: You cannot access this support ticket.');
      }
    }

    // Mark as read in local store
    const updated = all.map((t) => {
      if (t.id === found.id) {
        return {
          ...t,
          ...(role === 'operations' || role === 'admin'
            ? { unreadForStaff: false }
            : { unreadForUser: false }),
        };
      }
      return t;
    });
    saveStoredSupportTickets(updated);

    const ticketCopy = { ...found };
    if (role !== 'operations' && role !== 'admin') {
      ticketCopy.notes = [];
      ticketCopy.unreadForUser = false;
    } else {
      ticketCopy.unreadForStaff = false;
    }
    return ticketCopy;
  },

  /**
   * Creates a new support ticket.
   */
  createTicket: async ({
    category,
    subject,
    message,
    attachment = null,
    user,
  }) => {
    const role = user?.role || 'candidate';
    const userId = user?.id || 'usr-1';
    const userName = user?.fullName || 'StageLink Member';
    const userEmail = user?.email || 'user@stagelink.com';
    const companyName = user?.companyName || '';

    const payload = {
      category,
      subject,
      message,
      attachment,
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      user_role: role,
      company_name: companyName,
    };

    let createdTicket = null;

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/tickets/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        createdTicket = json.ticket;
      }
    } catch {
      // Fallback to local store
    }

    if (!createdTicket) {
      const all = getStoredSupportTickets();
      const ticketNumber = getNextTicketNumber(all);
      const nowIso = new Date().toISOString();

      const newTicket = {
        id: ticketNumber,
        ticketNumber,
        userId,
        userName,
        userEmail,
        userRole: role,
        companyName,
        category,
        subject,
        priority: 'normal',
        status: 'open',
        assignedTo: 'Unassigned',
        assignedStaffId: '',
        createdAt: nowIso,
        lastReplyAt: nowIso,
        lastReplyBy: userName,
        lastReplyRole: role,
        unreadForUser: false,
        unreadForStaff: true,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: userId,
            senderName: userName,
            senderRole: role,
            content: message,
            timestamp: nowIso,
            attachment,
          },
        ],
        notes: [],
        history: [{ event: 'Ticket created', timestamp: nowIso, actor: userName }],
      };

      saveStoredSupportTickets([newTicket, ...all]);
      createdTicket = newTicket;
    }

    // Trigger in-app notification for the user
    addStoredNotification({
      title: 'Support Ticket Created',
      message: `Your support ticket ${createdTicket.ticketNumber || createdTicket.id} has been submitted to the Operation Team.`,
      type: 'support',
      category: 'support',
      link: role === 'recruiter' || role === 'admin'
        ? `/admin/support/${createdTicket.id}`
        : `/candidate/support/${createdTicket.id}`,
      actionLabel: 'View Ticket',
    });

    return createdTicket;
  },

  /**
   * Sends a reply to an ongoing ticket conversation.
   */
  replyToTicket: async (
    ticketId,
    { content, attachment = null, sender }
  ) => {
    const senderRole = sender?.role || 'candidate';
    const senderId = sender?.id || 'usr-1';
    const senderName = sender?.fullName || 'StageLink Member';

    const payload = {
      content,
      attachment,
      sender_id: senderId,
      sender_name: senderName,
      sender_role: senderRole,
    };

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/tickets/${ticketId}/reply/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        // If staff replied, trigger user notification
        if (senderRole === 'operations' || senderRole === 'admin') {
          addStoredNotification({
            title: 'New Reply from Support Desk',
            message: `StageLink Operations Team replied to ticket ${ticketId}: "${content.slice(0, 70)}..."`,
            type: 'support_reply',
            category: 'support',
            link: `/candidate/support/${ticketId}`,
            actionLabel: 'View Reply',
          });
        }
        return json.ticket;
      }
    } catch {
      // Fallback
    }

    const all = getStoredSupportTickets();
    const found = all.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!found) throw new Error('Ticket not found');

    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: nowIso,
      attachment,
    };

    const isStaff = senderRole === 'operations' || senderRole === 'admin';
    const updatedTicket = {
      ...found,
      lastReplyAt: nowIso,
      lastReplyBy: senderName,
      lastReplyRole: senderRole,
      unreadForUser: isStaff ? true : false,
      unreadForStaff: isStaff ? false : true,
      status:
        !isStaff && (found.status === 'waiting_user' || found.status === 'resolved')
          ? 'in_progress'
          : found.status === 'open' && isStaff
          ? 'in_progress'
          : found.status,
      messages: [...(found.messages || []), newMsg],
    };

    const updatedList = all.map((t) => (t.id === found.id ? updatedTicket : t));
    saveStoredSupportTickets(updatedList);

    // In-app notification
    if (isStaff) {
      addStoredNotification({
        title: 'New Reply from Support Desk',
        message: `StageLink Operations Team replied to ticket ${ticketId}: "${content.slice(0, 70)}..."`,
        type: 'support_reply',
        category: 'support',
        link: found.userRole === 'candidate'
          ? `/candidate/support/${ticketId}`
          : `/admin/support/${ticketId}`,
        actionLabel: 'View Reply',
      });
    }

    return updatedTicket;
  },

  /**
   * Adds an internal staff note (Staff Only).
   */
  addInternalNote: async (ticketId, { note, author }) => {
    const payload = {
      note,
      author_id: author?.id || 'admin-1',
      author_name: author?.fullName || 'Operation Staff',
      operator_role: 'operations',
    };

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/tickets/${ticketId}/note/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return json.ticket;
      }
    } catch {
      // Fallback
    }

    const all = getStoredSupportTickets();
    const found = all.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!found) throw new Error('Ticket not found');

    const nowIso = new Date().toISOString();
    const noteEntry = {
      id: `note-${Date.now()}`,
      authorId: author?.id || 'admin-1',
      authorName: author?.fullName || 'Operation Staff',
      note,
      timestamp: nowIso,
    };

    const updated = {
      ...found,
      notes: [...(found.notes || []), noteEntry],
      history: [
        ...(found.history || []),
        { event: 'Private internal note added', timestamp: nowIso, actor: author?.fullName || 'Staff' },
      ],
    };

    saveStoredSupportTickets(all.map((t) => (t.id === found.id ? updated : t)));
    return updated;
  },

  /**
   * Updates ticket status, priority, or assignment (Staff Only).
   */
  updateTicket: async (ticketId, { status, priority, assignedTo, operator }) => {
    const payload = {
      status,
      priority,
      assigned_to: assignedTo,
      operator_name: operator?.fullName || 'Operation Staff',
      operator_role: 'operations',
    };

    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/tickets/${ticketId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        if (status === 'resolved') {
          addStoredNotification({
            title: 'Support Ticket Resolved',
            message: `Ticket ${ticketId} has been marked as resolved by our Operations Team.`,
            type: 'support_resolved',
            category: 'support',
            link: `/candidate/support/${ticketId}`,
            actionLabel: 'View Ticket',
          });
        }
        return json.ticket;
      }
    } catch {
      // Fallback
    }

    const all = getStoredSupportTickets();
    const found = all.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!found) throw new Error('Ticket not found');

    const nowIso = new Date().toISOString();
    const updated = {
      ...found,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assignedTo !== undefined ? { assignedTo } : {}),
      unreadForUser: status === 'resolved' || status === 'closed' ? true : found.unreadForUser,
      history: [
        ...(found.history || []),
        ...(status && status !== found.status
          ? [{ event: `Status changed from ${found.status} to ${status}`, timestamp: nowIso, actor: operator?.fullName || 'Staff' }]
          : []),
        ...(priority && priority !== found.priority
          ? [{ event: `Priority set to ${priority}`, timestamp: nowIso, actor: operator?.fullName || 'Staff' }]
          : []),
        ...(assignedTo && assignedTo !== found.assignedTo
          ? [{ event: `Assigned to ${assignedTo}`, timestamp: nowIso, actor: operator?.fullName || 'Staff' }]
          : []),
      ],
    };

    saveStoredSupportTickets(all.map((t) => (t.id === found.id ? updated : t)));

    if (status === 'resolved') {
      addStoredNotification({
        title: 'Support Ticket Resolved',
        message: `Ticket ${ticketId} has been marked as resolved by our Operations Team.`,
        type: 'support_resolved',
        category: 'support',
        link: found.userRole === 'candidate' ? `/candidate/support/${ticketId}` : `/admin/support/${ticketId}`,
        actionLabel: 'View Ticket',
      });
    }

    return updated;
  },

  /**
   * Allows user or staff to reopen a resolved ticket.
   */
  reopenTicket: async (ticketId, { user }) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/tickets/${ticketId}/reopen/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          role: user?.role,
          actor_name: user?.fullName || 'User',
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.ticket;
      }
    } catch {
      // Fallback
    }

    const all = getStoredSupportTickets();
    const found = all.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!found) throw new Error('Ticket not found');

    const nowIso = new Date().toISOString();
    const updated = {
      ...found,
      status: 'in_progress',
      unreadForStaff: true,
      history: [
        ...(found.history || []),
        { event: `Ticket reopened by ${user?.fullName || 'User'}`, timestamp: nowIso, actor: user?.fullName || 'User' },
      ],
    };

    saveStoredSupportTickets(all.map((t) => (t.id === found.id ? updated : t)));

    addStoredNotification({
      title: 'Ticket Reopened',
      message: `Ticket ${ticketId} was reopened and queued for Operations Team review.`,
      type: 'support',
      category: 'support',
      link: found.userRole === 'candidate' ? `/candidate/support/${ticketId}` : `/admin/support/${ticketId}`,
    });

    return updated;
  },

  /**
   * Retrieves summary metrics for the Operation Team dashboard.
   */
  getMetrics: async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE_URL}/metrics/?role=operations`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const all = getStoredSupportTickets();
    return {
      new_tickets: all.filter((t) => t.status === 'open' && t.unreadForStaff).length,
      open_tickets: all.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
      waiting_for_user: all.filter((t) => t.status === 'waiting_user').length,
      resolved_tickets: all.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
      total_tickets: all.length,
      candidates_count: all.filter((t) => t.userRole === 'candidate').length,
      recruiters_count: all.filter((t) => t.userRole === 'recruiter' || t.userRole === 'admin').length,
    };
  },
};
