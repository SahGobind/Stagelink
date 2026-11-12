import React, { useState } from 'react';
import {
  Sliders,
  Shield,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Mail,
  Save,
  Bell,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SupportTeamSettingsPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'support_agent';
  const isLead = role === 'support_lead' || role === 'super_admin' || role === 'admin';

  const [autoAssign, setAutoAssign] = useState(true);
  const [slaUrgentHours, setSlaUrgentHours] = useState('1');
  const [slaHighHours, setSlaHighHours] = useState('4');
  const [slaNormalHours, setSlaNormalHours] = useState('24');
  const [escalationEmail, setEscalationEmail] = useState('lead@stagelink.com');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isLead) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-200 p-8 text-center">
        <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-1">Restricted Access</h2>
        <p className="text-xs text-slate-600">Settings require Support Lead authority.</p>
      </div>
    );
  }

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Support Operations Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure automated ticket routing, SLA threshold timers, and supervisor escalation alerts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Support configuration preferences successfully saved and applied.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Ticket Routing */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Ticket Routing & Workload Distribution</span>
          </h2>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-900">Auto-Assign Tickets (Round-Robin)</div>
              <p className="text-[11px] text-slate-500">
                Automatically distribute new candidate and recruiter tickets evenly among active Tier-1 agents.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* SLA Timers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Service Level Agreement (SLA) Thresholds</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgent Response (Hours)
              </label>
              <input
                type="number"
                value={slaUrgentHours}
                onChange={(e) => setSlaUrgentHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                High Priority (Hours)
              </label>
              <input
                type="number"
                value={slaHighHours}
                onChange={(e) => setSlaHighHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Normal Inquiries (Hours)
              </label>
              <input
                type="number"
                value={slaNormalHours}
                onChange={(e) => setSlaNormalHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Escalation Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-500" />
            <span>Supervisor Escalation Routing</span>
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Escalations Dispatch Email
            </label>
            <input
              type="email"
              value={escalationEmail}
              onChange={(e) => setEscalationEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Immediate alert dispatched when an agent submits a Tier-2 escalation request.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save Support Configuration</span>
        </button>
      </form>
    </div>
  );
};

export default SupportTeamSettingsPage;

