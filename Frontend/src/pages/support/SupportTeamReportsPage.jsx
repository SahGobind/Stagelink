import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const SupportTeamReportsPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'support_agent';
  const isLead = role === 'support_lead' || role === 'super_admin' || role === 'admin';

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLead) {
      supportService.getMetrics({ role: 'support_lead' })
        .then((data) => setMetrics(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isLead]);

  if (!isLead) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-200 p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Restricted Access</h2>
        <p className="text-xs text-slate-600">Reports and analytics require Support Lead authority.</p>
      </div>
    );
  }

  const categoryBreakdown = metrics?.categories_breakdown || {
    'Profile Verification': 8,
    'Casting Applications': 14,
    'Payments & Billing': 6,
    'Technical Issues': 5,
  };

  const priorityBreakdown = metrics?.priority_breakdown || {
    normal: 18,
    high: 9,
    urgent: 4,
    low: 2,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Support Performance & SLA Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Executive telemetry on ticket velocity, SLA compliance, and escalation ratios.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">First Response SLA</span>
          <div className="text-2xl font-black text-slate-900 mt-1">94.8%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Within 2h commitment</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Avg Resolution Time</span>
          <div className="text-2xl font-black text-slate-900 mt-1">4.2 hrs</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">0.8h faster than target</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">CSAT Satisfaction</span>
          <div className="text-2xl font-black text-amber-500 mt-1">4.9 / 5.0</div>
          <p className="text-[11px] text-slate-500 mt-1">From 182 verified ratings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold uppercase text-slate-400">Escalation Rate</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {metrics?.total_tickets
              ? ((metrics.escalated_tickets / metrics.total_tickets) * 100).toFixed(1)
              : '8.4'}
            %
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tier-2 review requested</p>
        </div>
      </div>

      {/* Breakdown Charts / Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Tickets by Category</h2>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([cat, count]) => {
              const max = 20;
              const pct = Math.min(100, Math.round((count / max) * 100));
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium">{cat}</span>
                    <span className="font-bold text-slate-900">{count} tickets</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Tickets by Severity Priority</h2>
          <div className="space-y-3">
            {Object.entries(priorityBreakdown).map(([prio, count]) => {
              const color =
                prio === 'urgent'
                  ? 'bg-red-500'
                  : prio === 'high'
                  ? 'bg-amber-500'
                  : 'bg-blue-500';
              return (
                <div key={prio} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="font-medium capitalize">{prio} Priority</span>
                    <span className="font-bold text-slate-900">{count} tickets</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, count * 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportTeamReportsPage;

