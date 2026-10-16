import React from 'react';
import { ShieldCheck, Lock, Check } from 'lucide-react';

const PrivacyControlsCard = ({ privacySettings = {}, onUpdatePrivacy }) => {
  const settings = {
    showEmailPublicly: false,
    showPhonePublicly: false,
    showExactDob: false,
    profileVisibility: 'public',
    ...privacySettings,
  };

  const handleToggle = (key) => {
    const updated = {
      ...settings,
      [key]: !settings[key],
    };
    onUpdatePrivacy?.(updated);
  };

  const handleVisibilityChange = (visibility) => {
    const updated = {
      ...settings,
      profileVisibility: visibility,
    };
    onUpdatePrivacy?.(updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-navy" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">
              Privacy & Contact Information Controls
            </h2>
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Configure how your contact details appear to verified casting directors and the public
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Protection</span>
        </span>
      </div>

      <div className="space-y-4">
        {/* Email Privacy Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-navy">Primary Email Address</span>
              {!settings.showEmailPublicly && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Verified Studios Only
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {settings.showEmailPublicly
                ? 'Visible publicly on your composite card'
                : 'Masked from anonymous visitors; revealed only to verified casting directors'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('showEmailPublicly')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.showEmailPublicly ? 'bg-brand-navy' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={settings.showEmailPublicly}
            aria-label="Toggle public email visibility"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.showEmailPublicly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Phone Privacy Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-navy">Mobile Phone Number</span>
              {!settings.showPhonePublicly && (
                <span className="text-[10px] font-bold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  Hidden / On Request
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {settings.showPhonePublicly
                ? 'Direct phone number visible to all casting personnel'
                : 'Direct phone number hidden; casting directors request access via direct message'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('showPhonePublicly')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.showPhonePublicly ? 'bg-brand-navy' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={settings.showPhonePublicly}
            aria-label="Toggle public phone visibility"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.showPhonePublicly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* DOB vs Playing Age Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-navy">Date of Birth vs Playing Age</span>
              {!settings.showExactDob && (
                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                  Recommended for Actors
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {settings.showExactDob
                ? 'Displays your exact calendar date of birth'
                : 'Displays your flexible playing age bracket (e.g. 22–30 yrs) to avoid algorithmic age bias'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('showExactDob')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.showExactDob ? 'bg-brand-navy' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={settings.showExactDob}
            aria-label="Toggle exact date of birth display"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                settings.showExactDob ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Profile Search Discovery */}
        <div className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100 space-y-2">
          <span className="text-xs font-bold text-brand-navy">Performer Directory Visibility</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleVisibilityChange('public')}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.profileVisibility === 'public'
                  ? 'border-brand-navy bg-white shadow-xs ring-1 ring-brand-navy'
                  : 'border-gray-200 hover:border-gray-300 bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-navy">Public Directory</span>
                {settings.profileVisibility === 'public' && (
                  <Check className="w-3.5 h-3.5 text-brand-navy stroke-[3]" />
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Discoverable by all production houses and independent casting directors.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleVisibilityChange('verified_only')}
              className={`p-3 rounded-xl border text-left transition-all ${
                settings.profileVisibility === 'verified_only'
                  ? 'border-brand-navy bg-white shadow-xs ring-1 ring-brand-navy'
                  : 'border-gray-200 hover:border-gray-300 bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-navy">Verified Studios Only</span>
                {settings.profileVisibility === 'verified_only' && (
                  <Check className="w-3.5 h-3.5 text-brand-navy stroke-[3]" />
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Visible only to vetted SAG/Equity franchise casting agents and direct job invites.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyControlsCard;
