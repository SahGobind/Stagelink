import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  Headphones,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const SupportDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role || 'support_agent';
  const isAgent = role === 'support_agent';
  const isLead = role === 'support_lead' || role === 'super_admin' || role === 'admin';

  const fetchData = async () => {
    try {
      const [metricsData, ticketsData] = await Promise.all([
        supportService.getMetrics({ role, userId: user?.id }),
        supportService.getTickets({
          role,
          userId: user?.id,
          status: 'all',
        }),
      ]);
      setMetrics(metricsData);
      setTickets(ticketsData?.results || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role, user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Status badge helper
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

  // Priority badge helper
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isAgent ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Level 1 Support Specialist
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Level 2 Support Lead & Governance
              </span>
            )}
            <span className="text-xs text-slate-400">• MongoDB Atlas Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Agent'}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            {isAgent
              ? 'Here is your active workload queue. Under Principle of Least Privilege, you have full authority to resolve and escalate your assigned customer tickets.'
              : 'Support operations command desk. Monitor global resolution SLAs, review escalated inquiries, and coordinate team workload distribution.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition border border-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live Queue</span>
          </button>
          <Link
            to="/support/my-tickets"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition shadow-sm"
          >
            <Inbox className="w-4 h-4" />
            <span>Open Queue</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: My / Total Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAgent ? 'My Assigned' : 'Total Tickets'}
            </span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isAgent ? metrics?.my_total ?? tickets.length : metrics?.total_tickets ?? tickets.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across all categories</p>
        </div>

        {/* Metric 2: Open Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Inquiries</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {isAgent ? metrics?.my_open ?? 0 : metrics?.open_tickets ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting staff response</p>
        </div>

        {/* Metric 3: In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <RefreshCw className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">
            {isAgent ? metrics?.my_in_progress ?? 0 : metrics?.in_progress ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Under investigation</p>
        </div>

        {/* Metric 4: Escalations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Escalated</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-600">
            {isAgent ? metrics?.my_escalated ?? 0 : metrics?.escalated_tickets ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires supervisor action</p>
        </div>

        {/* Metric 5: Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-700">
            {isAgent ? metrics?.my_resolved ?? 0 : metrics?.resolved_tickets ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully closed</p>
        </div>
      </div>

      {/* Role-Specific Workload Banner */}
      {isLead && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-purple-900">Support Lead Workload Control</h3>
              <p className="text-xs text-purple-700">
                You have administrative authority to assign tickets, re-route escalations, and manage team SLAs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/support/escalations"
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition"
            >
              Review Escalations ({metrics?.escalated_tickets || 0})
            </Link>
            <Link
              to="/support/team"
              className="px-3 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-800 text-xs font-semibold hover:bg-purple-100/50 transition"
            >
              View Team Workload
            </Link>
          </div>
        </div>
      )}

      {/* Recent Tickets Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isAgent ? 'Your Active Tickets Queue' : 'Recent Support Inquiries'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAgent
                ? 'Only showing tickets assigned to your agent account.'
                : 'All customer queries across candidates and production recruiters.'}
            </p>
          </div>
          <Link
            to={isAgent ? '/support/my-tickets' : '/support/tickets'}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition"
          >
            <span>View Full Queue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
            Loading support queue...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Your queue is clear!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no pending tickets requiring your attention right now.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-5">Ticket #</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Priority</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Assigned To</th>
                  <th className="py-3 px-5">Last Activity</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {tickets.slice(0, 8).map((ticket) => (
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
                    <td className="py-3.5 px-5 max-w-xs truncate">
                      <span className="font-medium text-slate-800">{ticket.subject}</span>
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
                      {ticket.lastReplyAt
                        ? new Date(ticket.lastReplyAt).toLocaleDateString()
                        : 'Recently'}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/support/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                      >
                        <span>Open</span>
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

export default SupportDashboardPage;

