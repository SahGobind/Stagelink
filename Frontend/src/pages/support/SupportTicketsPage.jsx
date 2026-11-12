import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  RefreshCw,
  Flame,
  ArrowUpRight,
  Shield,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const SupportTicketsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect which view mode based on path
  const path = location.pathname;
  const isMyTickets = path.includes('/my-tickets');
  const isAssigned = path.includes('/assigned');
  const isEscalations = path.includes('/escalations');

  const role = user?.role || 'support_agent';
  const isAgent = role === 'support_agent';
  const isLead = role === 'support_lead' || role === 'super_admin' || role === 'admin';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(isEscalations ? 'escalated' : 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load URL search param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, [location.search]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await supportService.getTickets({
        role,
        userId: user?.id,
        status: isEscalations ? 'escalated' : statusFilter,
        search,
        category: categoryFilter,
      });
      let results = data.results || [];

      // Client-side additional filters if needed
      if (priorityFilter && priorityFilter !== 'all') {
        results = results.filter((t) => (t.priority || '').toLowerCase() === priorityFilter.toLowerCase());
      }
      if (isAssigned) {
        results = results.filter((t) => t.status !== 'resolved' && t.status !== 'closed');
      }

      setTickets(results);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [role, user?.id, path, statusFilter, priorityFilter, categoryFilter, search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Open</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>;
      case 'waiting_user':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Waiting for User</span>;
      case 'escalated':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1"><Flame className="w-3 h-3 text-red-500" />Escalated</span>;
      case 'resolved':
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Resolved</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">Urgent</span>;
      case 'high':
        return <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">High</span>;
      case 'low':
        return <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Low</span>;
      default:
        return <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Normal</span>;
    }
  };

  const pageTitle = isEscalations
    ? 'Escalated Inquiries Queue'
    : isMyTickets
    ? 'My Assigned Support Tickets'
    : isAssigned
    ? 'Active Assigned Workload'
    : 'All Platform Support Tickets';

  const pageSubtitle = isEscalations
    ? 'Critical and unresolved inquiries escalated for Level 2 supervisor attention.'
    : isAgent
    ? 'Principle of Least Privilege: Showing inquiries specifically assigned to your agent account.'
    : 'Global repository of all submitted member support requests.';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {pageTitle}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              {tickets.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">{pageSubtitle}</p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Least Privilege Notice for Agent viewing general tickets route */}
      {isAgent && !isMyTickets && (
        <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-3 text-sky-900 text-xs leading-relaxed">
          <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Least Privilege Protection Active:</span> As a Level 1 Support Agent, your access is strictly isolated to tickets assigned to you. Unassigned platform tickets are managed by the Support Lead.
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by ticket #, user, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            />
          </div>

          {/* Status Filter */}
          {!isEscalations && (
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_user">Waiting for User</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
            >
              <option value="all">All Categories</option>
              <option value="Profile Verification">Profile Verification</option>
              <option value="Casting Applications">Casting Applications</option>
              <option value="Payments & Billing">Payments & Billing</option>
              <option value="Technical Issues">Technical Issues</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No tickets found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No tickets matched the current filter criteria or scope.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-5">Ticket #</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Subject & Category</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Assigned Agent</th>
                  <th className="py-3 px-5">Created</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-50/70 transition cursor-pointer"
                    onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {ticket.ticketNumber || ticket.id}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{ticket.userName || 'Member'}</div>
                      <div className="text-[11px] text-slate-400">{ticket.userEmail || ticket.userRole}</div>
                    </td>
                    <td className="py-3.5 px-5 max-w-sm truncate">
                      <span className="font-semibold text-slate-900">{ticket.subject}</span>
                      <div className="text-[11px] text-slate-400">{ticket.category}</div>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap font-medium text-slate-700">
                      {ticket.assignedTo || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap text-slate-400 text-[11px]">
                      {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Recently'}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/support/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 transition"
                      >
                        <span>Manage</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsPage;

