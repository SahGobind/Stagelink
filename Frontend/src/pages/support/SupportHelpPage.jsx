import React from 'react';
import {
  HelpCircle,
  Shield,
  ShieldAlert,
  Clock,
  AlertTriangle,
  Lock,
  CheckCircle2,
  FileText,
  UserX,
  CreditCard,
} from 'lucide-react';

const SupportHelpPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Support Personnel Operating Guidelines
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Standard Operating Procedures (SOP), resolution SLAs, and security protocol compliance.
        </p>
      </div>

      {/* Security Principles Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-6 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
          <Shield className="w-5 h-5 text-amber-600" />
          <span>Core Directive: Principle of Least Privilege (PoLP)</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          StageLink operates under strict security governance. Support personnel are granted only the minimum permissions required to resolve customer inquiries. You must never ask users for raw passwords, credit card numbers, or cryptographic tokens.
        </p>
      </div>

      {/* SLA Tiers Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Service Level Agreements (SLAs)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-red-600 uppercase">Urgent Priority</span>
            <div className="text-lg font-black text-slate-900">&lt; 1 Hour</div>
            <p className="text-[11px] text-slate-500">Payment duplicate debits, security lockouts, active production audition disputes.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-amber-600 uppercase">High Priority</span>
            <div className="text-lg font-black text-slate-900">&lt; 4 Hours</div>
            <p className="text-[11px] text-slate-500">Document verification requests, application deadline extension inquiries.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase">Normal Priority</span>
            <div className="text-lg font-black text-slate-900">&lt; 24 Hours</div>
            <p className="text-[11px] text-slate-500">General portfolio inquiries, platform tips, profile edits, feedback.</p>
          </div>
        </div>
      </div>

      {/* Escalation Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>When to Escalate to Support Lead (Tier 2)</span>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Duplicate Billing & Payment Disputes:</strong> When a recruiter or talent reports unauthorized card charges or duplicate gateway processing.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Suspected Impersonation or Fraud:</strong> When a casting call listing or talent identity appears fraudulent or violates StageLink trust rules.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>Legal or Compliance Inquiries:</strong> Any requests mentioning subpoena, intellectual property infringement, or legal representation.
            </div>
          </div>
        </div>
      </div>

      {/* Strictly Forbidden Actions */}
      <div className="bg-red-50/60 rounded-2xl border border-red-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <UserX className="w-4 h-4 text-red-600" />
          <span>Strictly Prohibited Staff Actions</span>
        </div>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-red-800 leading-relaxed">
          <li>Never issue cash or gateway refunds without Support Lead and Billing Admin authorization.</li>
          <li>Never disclose personal member contact details, email addresses, or phone numbers to external third parties.</li>
          <li>Never attempt to bypass object-level access controls to inspect tickets not assigned to you.</li>
          <li>Never share your support session tokens or credentials. All administrative activity is cryptographically logged.</li>
        </ul>
      </div>
    </div>
  );
};

export default SupportHelpPage;

