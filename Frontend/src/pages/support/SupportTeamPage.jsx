import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  Inbox,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const SupportTeamPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'support_agent';
  const isLead = role === 'support_lead' || role === 'super_admin' || role === 'admin';

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await supportService.getTeam();
      setTeam(data);
    } catch (err) {
      setError(err.message || 'Failed to load team roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLead) {
      fetchTeam();
    }
  }, [isLead]);

  if (!isLead) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Restricted to Support Leads</h2>
        <p className="text-xs text-slate-600 mb-4">
          Team workload management and agent supervision requires Level 2 Support Lead credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Support Team Workload & Roster
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {team.length} Members
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor real-time ticket distribution, individual agent queues, and resolution capacity.
          </p>
        </div>

        <button
          onClick={fetchTeam}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Workload</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
          Loading team roster...
        </div>
      ) : error ? (
        <div className="p-8 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => {
            const isMemberLead = member.role === 'support_lead' || member.role === 'admin';
            const activeTickets = member.active_tickets_count || 0;
            const resolvedTickets = member.resolved_tickets_count || 0;

            const workloadBadge =
              activeTickets >= 8 ? (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                  Heavy Load ({activeTickets})
                </span>
              ) : activeTickets >= 4 ? (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Moderate ({activeTickets})
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Optimal ({activeTickets})
                </span>
              );

            return (
              <div
                key={member.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      member.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={member.fullName || member.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {member.fullName || member.full_name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{member.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isMemberLead ? (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                          Lead
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-sky-100 text-sky-700">
                          Tier 1 Agent
                        </span>
                      )}
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Current Workload:</span>
                  {workloadBadge}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-base font-black text-slate-900">{activeTickets}</div>
                    <div className="text-[10px] text-slate-400">Active In Queue</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-base font-black text-emerald-600">{resolvedTickets}</div>
                    <div className="text-[10px] text-slate-400">Total Closed</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupportTeamPage;

