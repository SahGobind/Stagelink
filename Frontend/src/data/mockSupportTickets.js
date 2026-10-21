/**
 * StageLink Help & Support System — Mock Data & In-Memory Client Repository
 *
 * Isolated mock data for development.
 * Automatically synchronizes with localStorage and dispatches change events.
 */

export const CANDIDATE_CATEGORIES = [
  'Account & Login',
  'Profile & Verification',
  'Casting Applications',
  'Auditions',
  'Messages',
  'Technical Problem',
  'Report a Listing',
  'Other',
];

export const RECRUITER_CATEGORIES = [
  'Account & Login',
  'Company Verification',
  'Job / Casting Call Posting',
  'Listing Fees & Payments',
  'Job Publishing',
  'Applications & Candidate Ranking',
  'Shortlisting & Auditions',
  'Messages',
  'Technical Problem',
  'Other',
];

export const SUPPORT_STATUSES = {
  open: { label: 'Open', color: 'blue' },
  in_progress: { label: 'In Progress', color: 'amber' },
  waiting_user: { label: 'Waiting for User', color: 'purple' },
  resolved: { label: 'Resolved', color: 'emerald' },
  closed: { label: 'Closed', color: 'gray' },
};

export const SUPPORT_PRIORITIES = {
  low: { label: 'Low', color: 'gray' },
  normal: { label: 'Normal', color: 'blue' },
  high: { label: 'High', color: 'amber' },
  urgent: { label: 'Urgent', color: 'rose' },
};

export const INITIAL_SUPPORT_TICKETS = [
  {
    id: 'STG-1001',
    ticketNumber: 'STG-1001',
    userId: 'cand-aanya',
    userName: 'Aanya Sharma',
    userEmail: 'aanya@stagelink.com',
    userRole: 'candidate',
    companyName: '',
    category: 'Casting Applications',
    subject: 'Inquiry about self-tape upload format for Cyber Noir',
    priority: 'normal',
    status: 'in_progress',
    assignedTo: 'Sarah Jenkins',
    assignedStaffId: 'staff-sarah',
    createdAt: '2026-10-18T10:30:00Z',
    lastReplyAt: '2026-10-19T14:15:00Z',
    lastReplyBy: 'Sarah Jenkins',
    lastReplyRole: 'operations',
    unreadForUser: true,
    unreadForStaff: false,
    messages: [
      {
        id: 'msg-101',
        senderId: 'cand-aanya',
        senderName: 'Aanya Sharma',
        senderRole: 'candidate',
        content:
          'Hello StageLink Support! I am preparing my callback audition self-tape for the Cyber Noir series. Could you please confirm if 4K ProRes files are accepted or if I should compress to 1080p MP4? Thank you!',
        timestamp: '2026-10-18T10:30:00Z',
        attachment: {
          name: 'tape_specs_preview.png',
          size: '2.4 MB',
          type: 'image/png',
        },
      },
      {
        id: 'msg-102',
        senderId: 'staff-sarah',
        senderName: 'Sarah Jenkins',
        senderRole: 'operations',
        content:
          'Hi Aanya, thank you for reaching out! For optimal review speeds on production studio monitors, we strongly recommend 1080p H.264/MP4 format under 500MB. This guarantees seamless streaming for the casting directors.',
        timestamp: '2026-10-19T14:15:00Z',
        attachment: null,
      },
    ],
    notes: [
      {
        id: 'note-1',
        authorId: 'staff-sarah',
        authorName: 'Sarah Jenkins',
        note: 'Verified candidate profile is in good standing. Handled within 4h SLA.',
        timestamp: '2026-10-19T14:16:00Z',
      },
    ],
    history: [
      { event: 'Ticket created', timestamp: '2026-10-18T10:30:00Z', actor: 'Aanya Sharma' },
      { event: 'Assigned to Sarah Jenkins', timestamp: '2026-10-18T11:00:00Z', actor: 'System' },
      { event: 'Status changed to In Progress', timestamp: '2026-10-19T14:15:00Z', actor: 'Sarah Jenkins' },
    ],
  },
  {
    id: 'STG-1002',
    ticketNumber: 'STG-1002',
    userId: 'rec-marcus',
    userName: 'Marcus Sterling',
    userEmail: 'recruiter@stagelink.com',
    userRole: 'recruiter',
    companyName: 'Apex Vision Studios',
    category: 'Listing Fees & Payments',
    subject: 'Juspay verification receipt confirmation for Apex Vision',
    priority: 'high',
    status: 'resolved',
    assignedTo: 'David Chen',
    assignedStaffId: 'staff-david',
    createdAt: '2026-10-17T09:15:00Z',
    lastReplyAt: '2026-10-18T16:00:00Z',
    lastReplyBy: 'David Chen',
    lastReplyRole: 'operations',
    unreadForUser: false,
    unreadForStaff: false,
    messages: [
      {
        id: 'msg-201',
        senderId: 'rec-marcus',
        senderName: 'Marcus Sterling',
        senderRole: 'recruiter',
        content:
          'Hi Team, we completed the $199 feature listing transaction via Juspay for "Echoes of the Crown". We require an itemized VAT invoice for studio accounting records.',
        timestamp: '2026-10-17T09:15:00Z',
        attachment: {
          name: 'juspay_order_receipt.pdf',
          size: '450 KB',
          type: 'application/pdf',
        },
      },
      {
        id: 'msg-202',
        senderId: 'staff-david',
        senderName: 'David Chen',
        senderRole: 'operations',
        content:
          'Hello Marcus, the itemized studio invoice (Ref: INV-2026-STG89) has been generated and dispatched to your billing email. Your listing is verified and active on the marketplace.',
        timestamp: '2026-10-18T16:00:00Z',
        attachment: null,
      },
    ],
    notes: [
      {
        id: 'note-2',
        authorId: 'staff-david',
        authorName: 'David Chen',
        note: 'Verified Juspay order ID: order_stagelink_82910. Invoice copy archived.',
        timestamp: '2026-10-18T15:58:00Z',
      },
    ],
    history: [
      { event: 'Ticket created', timestamp: '2026-10-17T09:15:00Z', actor: 'Marcus Sterling' },
      { event: 'Priority set to High', timestamp: '2026-10-17T09:20:00Z', actor: 'System' },
      { event: 'Assigned to David Chen', timestamp: '2026-10-17T09:30:00Z', actor: 'Admin' },
      { event: 'Status changed to Resolved', timestamp: '2026-10-18T16:00:00Z', actor: 'David Chen' },
    ],
  },
  {
    id: 'STG-1003',
    ticketNumber: 'STG-1003',
    userId: 'cand-sophia',
    userName: 'Sophia Bennett',
    userEmail: 'sarah@stagelink.com',
    userRole: 'candidate',
    companyName: '',
    category: 'Profile & Verification',
    subject: 'Updating British Equity / CINTAA union card verification',
    priority: 'normal',
    status: 'waiting_user',
    assignedTo: 'Sarah Jenkins',
    assignedStaffId: 'staff-sarah',
    createdAt: '2026-10-16T12:00:00Z',
    lastReplyAt: '2026-10-17T11:20:00Z',
    lastReplyBy: 'Sarah Jenkins',
    lastReplyRole: 'operations',
    unreadForUser: true,
    unreadForStaff: false,
    messages: [
      {
        id: 'msg-301',
        senderId: 'cand-sophia',
        senderName: 'Sophia Bennett',
        senderRole: 'candidate',
        content:
          'Hi there, I recently renewed my Equity membership and would like to update my verified badge on my composite profile.',
        timestamp: '2026-10-16T12:00:00Z',
        attachment: null,
      },
      {
        id: 'msg-302',
        senderId: 'staff-sarah',
        senderName: 'Sarah Jenkins',
        senderRole: 'operations',
        content:
          'Hi Sophia, please upload a clear scan or PDF of your 2026 renewal card in this thread so our verification desk can approve the badge update.',
        timestamp: '2026-10-17T11:20:00Z',
        attachment: null,
      },
    ],
    notes: [],
    history: [
      { event: 'Ticket created', timestamp: '2026-10-16T12:00:00Z', actor: 'Sophia Bennett' },
      { event: 'Status changed to Waiting for User', timestamp: '2026-10-17T11:20:00Z', actor: 'Sarah Jenkins' },
    ],
  },
  {
    id: 'STG-1004',
    ticketNumber: 'STG-1004',
    userId: 'rec-marcus',
    userName: 'Marcus Sterling',
    userEmail: 'recruiter@stagelink.com',
    userRole: 'recruiter',
    companyName: 'Apex Vision Studios',
    category: 'Job Publishing',
    subject: 'Request to feature urgent casting call for Lead Stunt Performer',
    priority: 'urgent',
    status: 'open',
    assignedTo: 'Unassigned',
    assignedStaffId: '',
    createdAt: '2026-10-20T08:45:00Z',
    lastReplyAt: '2026-10-20T08:45:00Z',
    lastReplyBy: 'Marcus Sterling',
    lastReplyRole: 'recruiter',
    unreadForUser: false,
    unreadForStaff: true,
    messages: [
      {
        id: 'msg-401',
        senderId: 'rec-marcus',
        senderName: 'Marcus Sterling',
        senderRole: 'recruiter',
        content:
          'We have an urgent filming deadline starting in two weeks and need this casting call featured on top of the discover feed. Please let us know the expedited review turnaround.',
        timestamp: '2026-10-20T08:45:00Z',
        attachment: null,
      },
    ],
    notes: [],
    history: [
      { event: 'Ticket created', timestamp: '2026-10-20T08:45:00Z', actor: 'Marcus Sterling' },
      { event: 'Priority marked Urgent', timestamp: '2026-10-20T08:45:00Z', actor: 'System' },
    ],
  },
];

const STORAGE_KEY = 'starcast_support_tickets';

export const getStoredSupportTickets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed reading support tickets from storage', e);
  }
  return INITIAL_SUPPORT_TICKETS;
};

export const saveStoredSupportTickets = (tickets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new CustomEvent('starcast_support_updated'));
  } catch (e) {
    console.warn('Failed saving support tickets', e);
  }
};

export const getNextTicketNumber = (tickets) => {
  const existingNums = tickets
    .map((t) => {
      const match = (t.ticketNumber || t.id || '').match(/STG-(\d+)/);
      return match ? parseInt(match[1], 10) : 1000;
    })
    .filter((n) => !isNaN(n));
  const max = existingNums.length > 0 ? Math.max(...existingNums) : 1004;
  return `STG-${max + 1}`;
};
