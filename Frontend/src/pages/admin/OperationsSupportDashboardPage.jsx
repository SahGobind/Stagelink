import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  UserCheck,
  Send,
  Lock,
  ChevronRight,
  RefreshCw,
  FileText,
  RotateCcw,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SupportStatusBadge from '../../components/support/SupportStatusBadge';
import SupportPriorityBadge from '../../components/support/SupportPriorityBadge';
import SupportChatInterface from '../../components/support/SupportChatInterface';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { supportService } from '../../services/supportService';
import { formatDate } from '../../utils/formatters';

const STAFF_MEMBERS = [
  'Sarah Jenkins',
  'David Chen',
  'Alex Rivera',
  'Audrey Miller (Admin)',
  'Unassigned',
];

const OperationsSupportDashboardPage = () => {
  const { user, role, setOperationsSession } = useAuth();
  const isAuthorized =
    role === 'operations' ||
    role === 'admin' ||
    user?.role === 'operations' ||
    user?.role === 'admin';

  useEffect(() => {
    if (!isAuthorized) {
      if (typeof setOperationsSession === 'function') {
        setOperationsSession();
      } else {
        authService.ensureOperationsSession();
      }
    }
  }, [isAuthorized, setOperationsSession]);

  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({
    new_tickets: 0,
    open_tickets: 0,
    waiting_for_user: 0,
    resolved_tickets: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [userTypeFilter, setUserTypeFilter] = useState('all'); // 'all', 'candidate', 'recruiter'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Selected Ticket for Modal / Drawer
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isUpdatingProps, setIsUpdatingProps] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, metricsRes] = await Promise.all([
        supportService.getTickets({
          role: 'operations',
          status: statusFilter,
          userType: userTypeFilter,
          search: searchQuery,
        }),
        supportService.getMetrics(),
      ]);

      let results = ticketsRes.results || [];
      if (priorityFilter && priorityFilter !== 'all') {
        results = results.filter((t) => t.priority === priorityFilter);
      }

      setTickets(results);
      if (metricsRes) setMetrics(metricsRes);

      // Refresh selectedTicket if it is open
      if (selectedTicket) {
        const updated = results.find(
          (t) => t.id === selectedTicket.id || t.ticketNumber === selectedTicket.id
        );
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      console.warn('Error loading operations support dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userTypeFilter, statusFilter, searchQuery, priorityFilter]);

  useEffect(() => {
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener('starcast_support_updated', handleUpdate);
    return () => window.removeEventListener('starcast_support_updated', handleUpdate);
  }, []);

  const handleOpenTicket = async (t) => {
    try {
      const full = await supportService.getTicketById(t.id || t.ticketNumber, {
        role: 'operations',
      });
      setSelectedTicket(full || t);
    } catch {
      setSelectedTicket(t);
    }
  };

  const handleSendStaffReply = async (replyData) => {
    if (!selectedTicket) return;
    const updated = await supportService.replyToTicket(
      selectedTicket.id || selectedTicket.ticketNumber,
      {
        ...replyData,
        sender: {
          id: user?.id || 'admin-1',
          fullName: user?.fullName || 'Operation Staff',
          role: 'operations',
        },
      }
    );
    setSelectedTicket(updated);
    fetchDashboardData();
  };

  const handleAddInternalNote = async (noteData) => {
    if (!selectedTicket) return;
    const updated = await supportService.addInternalNote(
      selectedTicket.id || selectedTicket.ticketNumber,
      {
        ...noteData,
        author: user,
      }
    );
    setSelectedTicket(updated);
    fetchDashboardData();
  };

  const handleQuickStatusChange = async (newStatus) => {
    if (!selectedTicket) return;
    setIsUpdatingProps(true);
    try {
      const updated = await supportService.updateTicket(
        selectedTicket.id || selectedTicket.ticketNumber,
        {
          status: newStatus,
          operator: user,
        }
      );
      setSelectedTicket(updated);
      fetchDashboardData();
    } finally {
      setIsUpdatingProps(false);
    }
  };

  const handleQuickPriorityChange = async (newPriority) => {
    if (!selectedTicket) return;
    setIsUpdatingProps(true);
    try {
      const updated = await supportService.updateTicket(
        selectedTicket.id || selectedTicket.ticketNumber,
        {
          priority: newPriority,
          operator: user,
        }
      );
      setSelectedTicket(updated);
      fetchDashboardData();
    } finally {
      setIsUpdatingProps(false);
    }
  };

  const handleQuickAssign = async (newAssignee) => {
    if (!selectedTicket) return;
    setIsUpdatingProps(true);
    try {
      const updated = await supportService.updateTicket(
        selectedTicket.id || selectedTicket.ticketNumber,
        {
          assignedTo: newAssignee,
          operator: user,
        }
      );
      setSelectedTicket(updated);
      fetchDashboardData();
    } finally {
      setIsUpdatingProps(false);
    }
  };

  if (!isAuthorized) {
    return (
      <PageContainer maxWidth="4xl" className="py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-gray-200 shadow-sm max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-brand-navy">Access Restricted</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            The Operation Team Support Dashboard is accessible only to authorized StageLink Operations and Admin personnel.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (typeof setOperationsSession === 'function') {
                  setOperationsSession();
                } else {
                  authService.ensureOperationsSession();
                  window.location.reload();
                }
              }}
              className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-neutral-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Authorize as Operations Staff (1-Click Demo)</span>
            </button>
            <Link
              to="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl" className="space-y-8 text-left pb-16">
      {/* 1. TOP HEADER & NOTICE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-navy text-white text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-pink" />
              <span>Operations &amp; Support HQ</span>
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-neutral-100 text-gray-600 border border-gray-200">
              Unified Multirole Inbox
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
            Operation Team Support Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Triage, assign, resolve, and reply to candidate artists and recruiter studio accounts from one unified command console.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
            title="Refresh inbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRIC CARDS (4 Required cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Card 1: New Tickets */}
        <div
          onClick={() => setStatusFilter('new')}
          className={`p-5 bg-white rounded-3xl border transition-all cursor-pointer shadow-2xs space-y-1 hover:border-brand-pink ${
            statusFilter === 'new' ? 'border-brand-pink ring-2 ring-pink-100' : 'border-gray-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            New Tickets
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-brand-pink">
            {metrics.new_tickets || 0}
          </p>
          <span className="text-[11px] text-gray-400 block">Needs staff response</span>
        </div>

        {/* Card 2: Open Tickets */}
        <div
          onClick={() => setStatusFilter('open')}
          className={`p-5 bg-white rounded-3xl border transition-all cursor-pointer shadow-2xs space-y-1 hover:border-blue-400 ${
            statusFilter === 'open' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Open Tickets
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-blue-600">
            {metrics.open_tickets || 0}
          </p>
          <span className="text-[11px] text-gray-400 block">Under active investigation</span>
        </div>

        {/* Card 3: Waiting for User */}
        <div
          onClick={() => setStatusFilter('waiting_user')}
          className={`p-5 bg-white rounded-3xl border transition-all cursor-pointer shadow-2xs space-y-1 hover:border-purple-400 ${
            statusFilter === 'waiting_user'
              ? 'border-purple-500 ring-2 ring-purple-100'
              : 'border-gray-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Waiting for User
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-purple-600">
            {metrics.waiting_for_user || 0}
          </p>
          <span className="text-[11px] text-gray-400 block">Awaiting customer reply</span>
        </div>

        {/* Card 4: Resolved Tickets */}
        <div
          onClick={() => setStatusFilter('resolved')}
          className={`p-5 bg-white rounded-3xl border transition-all cursor-pointer shadow-2xs space-y-1 hover:border-emerald-400 ${
            statusFilter === 'resolved'
              ? 'border-emerald-500 ring-2 ring-emerald-100'
              : 'border-gray-200'
          }`}
        >
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Resolved Tickets
          </span>
          <p className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600">
            {metrics.resolved_tickets || 0}
          </p>
          <span className="text-[11px] text-gray-400 block">Successfully resolved</span>
        </div>
      </div>

      {/* 3. SHARED INBOX FILTERS & SEARCH */}
      <div className="bg-white rounded-3xl border border-brand-border p-5 shadow-card space-y-4">
        {/* User Type Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-navy mr-1">User Scope:</span>
            <button
              type="button"
              onClick={() => setUserTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                userTypeFilter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Tickets ({metrics.total_tickets || tickets.length})
            </button>
            <button
              type="button"
              onClick={() => setUserTypeFilter('candidate')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                userTypeFilter === 'candidate'
                  ? 'bg-brand-pink text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Candidates</span>
            </button>
            <button
              type="button"
              onClick={() => setUserTypeFilter('recruiter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                userTypeFilter === 'recruiter'
                  ? 'bg-brand-navy text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Recruiters &amp; Studios</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticket #, subject, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-pink focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Status & Priority Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'new', label: 'New' },
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'waiting_user', label: 'Waiting for User' },
              { id: 'resolved', label: 'Resolved' },
              { id: 'closed', label: 'Closed' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === s.id
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* 4. TICKETS TABLE */}
        {loading ? (
          <div className="py-12">
            <LoadingSpinner message="Loading operations inbox..." />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Inbox className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-brand-navy">No tickets match your filters</h3>
            <p className="text-xs text-gray-400">Try clearing filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Ticket #</th>
                  <th className="py-3 px-3">User &amp; Type</th>
                  <th className="py-3 px-3">Subject &amp; Category</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Assigned Staff</th>
                  <th className="py-3 px-3">Created / Last Reply</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {tickets.map((t) => {
                  const isCandidate = t.userRole === 'candidate';
                  const isUnreadStaff = Boolean(t.unreadForStaff);

                  return (
                    <tr
                      key={t.id || t.ticketNumber}
                      onClick={() => handleOpenTicket(t)}
                      className={`hover:bg-pink-50/20 transition-colors cursor-pointer group ${
                        isUnreadStaff ? 'bg-amber-50/30 font-semibold' : ''
                      }`}
                    >
                      {/* Ticket # */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isUnreadStaff && (
                            <span
                              className="w-2 h-2 rounded-full bg-brand-pink shrink-0"
                              title="Unread for staff"
                            />
                          )}
                          <span className="font-mono font-bold text-brand-pink bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                            {t.ticketNumber || t.id}
                          </span>
                        </div>
                      </td>

                      {/* User Type & Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isCandidate
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isCandidate ? (
                              <User className="w-3.5 h-3.5" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-brand-navy truncate">{t.userName}</p>
                            <p className="text-[10px] text-gray-400 truncate">
                              {t.companyName || t.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Subject & Category */}
                      <td className="py-3.5 px-3 max-w-xs">
                        <p className="font-bold text-brand-navy truncate group-hover:text-brand-pink transition-colors">
                          {t.subject}
                        </p>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {t.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <SupportPriorityBadge priority={t.priority} size="xs" />
                      </td>

                      {/* Assigned Staff */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-gray-600 font-medium">
                        {t.assignedTo || 'Unassigned'}
                      </td>

                      {/* Created / Last Reply */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-gray-400">
                        <p className="text-gray-600 font-medium">{formatDate(t.lastReplyAt)}</p>
                        <span className="text-[10px]">Opened: {formatDate(t.createdAt)}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <SupportStatusBadge status={t.status} size="xs" />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTicket(t);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-brand-pink hover:text-white rounded-xl text-xs font-bold transition-all text-gray-700 cursor-pointer"
                        >
                          Manage Ticket
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. TICKET MANAGEMENT DRAWER / MODAL FOR STAFF */}
      {selectedTicket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col text-left">
            {/* Staff Quick Action Bar */}
            <div className="p-4 sm:p-5 bg-neutral-900 text-white rounded-t-3xl flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold bg-brand-pink text-white px-2.5 py-1 rounded-lg">
                  {selectedTicket.ticketNumber || selectedTicket.id}
                </span>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold truncate max-w-sm sm:max-w-md">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-[10px] text-neutral-400">
                    User: {selectedTicket.userName} ({selectedTicket.userRole})
                  </p>
                </div>
              </div>

              {/* Staff Controls: Assign, Priority, Status */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Assign Dropdown */}
                <select
                  disabled={isUpdatingProps}
                  value={selectedTicket.assignedTo || 'Unassigned'}
                  onChange={(e) => handleQuickAssign(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-xl cursor-pointer focus:outline-none"
                  title="Assign to staff"
                >
                  {STAFF_MEMBERS.map((staff) => (
                    <option key={staff} value={staff}>
                      {staff}
                    </option>
                  ))}
                </select>

                {/* Priority Dropdown */}
                <select
                  disabled={isUpdatingProps}
                  value={selectedTicket.priority || 'normal'}
                  onChange={(e) => handleQuickPriorityChange(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-xl cursor-pointer focus:outline-none"
                  title="Change priority"
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent Priority</option>
                </select>

                {/* Status Dropdown */}
                <select
                  disabled={isUpdatingProps}
                  value={selectedTicket.status || 'open'}
                  onChange={(e) => handleQuickStatusChange(e.target.value)}
                  className="bg-neutral-800 border border-neutral-700 text-white text-xs px-2.5 py-1.5 rounded-xl cursor-pointer focus:outline-none font-bold text-pink-400"
                  title="Change ticket status"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_user">Waiting for User</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                {/* Close Drawer Button */}
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer ml-2"
                  title="Close ticket drawer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Embedded Support Chat Interface */}
            <div className="flex-1 p-2 sm:p-4">
              <SupportChatInterface
                ticket={selectedTicket}
                currentUser={user}
                onSendReply={handleSendStaffReply}
                onReopenTicket={() => handleQuickStatusChange('in_progress')}
                onAddInternalNote={handleAddInternalNote}
                backLink="#"
                backLabel="Close Panel"
                isStaff={true}
              />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};

export default OperationsSupportDashboardPage;
