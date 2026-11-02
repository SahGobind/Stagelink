import React from 'react';
import { Check, X, Shield, ShieldCheck, AlertCircle } from 'lucide-react';
import { calculatePasswordStrength } from '../../utils/cryptoUtils';

const PasswordStrengthIndicator = ({ password = '', userInfo = {} }) => {
  if (!password) return null;

  const { score, label, color, textColor, checks, containsPersonalInfo, personalInfoError } =
    calculatePasswordStrength(password, userInfo);

  const requirements = [
    { key: 'length', text: 'At least 8 characters', met: checks.length },
    { key: 'uppercase', text: 'Uppercase letter (A-Z)', met: checks.uppercase },
    { key: 'lowercase', text: 'Lowercase letter (a-z)', met: checks.lowercase },
    { key: 'number', text: 'Number (0-9)', met: checks.number },
    { key: 'special', text: 'Special symbol (!@#$%^&*)', met: checks.special },
  ];

  return (
    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-left">
      {/* Strength Bar */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-slate-600 flex items-center gap-1">
          {score === 5 && !containsPersonalInfo ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Shield className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>Password Strength:</span>
        </span>
        <span className={`font-bold ${textColor}`}>{label}</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`h-full transition-all duration-300 rounded-full ${
              lvl <= score ? color : 'bg-transparent'
            }`}
          />
        ))}
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 pt-1">
        {requirements.map((req) => (
          <div
            key={req.key}
            className={`flex items-center gap-1.5 text-[10px] transition-colors ${
              req.met ? 'text-emerald-700 font-medium' : 'text-slate-400'
            }`}
          >
            {req.met ? (
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
              </span>
            ) : (
              <span className="w-3.5 h-3.5 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                <X className="w-2.5 h-2.5 text-slate-400 stroke-[2]" />
              </span>
            )}
            <span>{req.text}</span>
          </div>
        ))}
      </div>

      {/* Personal Info Warning */}
      {containsPersonalInfo && (
        <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
          <span>{personalInfoError || 'Password cannot contain your name or email.'}</span>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;

