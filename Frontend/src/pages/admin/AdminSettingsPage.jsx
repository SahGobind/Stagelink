import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Globe,
  Palette,
  Mail,
  CreditCard,
  ShieldCheck,
  Cpu,
  FileVideo,
  Search,
  AlertTriangle,
  Save,
  CheckCircle2,
  Lock,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminSettingsPage = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSensitiveKeys, setShowSensitiveKeys] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await apiRequest('/api/users/admin/settings/');
      if (res.ok) {
        const json = await res.json();
        setSettings(json);
      }
    } catch (err) {
      console.warn('Failed to load platform settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest('/api/users/admin/settings/', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSuccessMsg('Platform settings successfully saved and persisted to MongoDB Atlas.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save settings.');
      }
    } catch (err) {
      alert('Save operation failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (section, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Retrieving platform configuration from MongoDB Atlas..." />
      </div>
    );
  }

  const sections = [
    { key: 'general', label: 'General Configuration', icon: Globe },
    { key: 'branding', label: 'Branding & Theme', icon: Palette },
    { key: 'email', label: 'Email Configuration', icon: Mail },
    { key: 'payments', label: 'Payment Integrations', icon: CreditCard },
    { key: 'security', label: 'Security & Access', icon: ShieldCheck },
    { key: 'api', label: 'API Integrations', icon: Cpu },
    { key: 'file_media', label: 'File & Media Limits', icon: FileVideo },
    { key: 'seo', label: 'SEO & Search Meta', icon: Search },
    { key: 'maintenance', label: 'Maintenance Mode', icon: AlertTriangle },
  ];

  const gen = settings?.general || {};
  const brand = settings?.branding || {};
  const mail = settings?.email || {};
  const pay = settings?.payments || {};
  const sec = settings?.security || {};
  const api = settings?.api || {};
  const media = settings?.file_media || {};
  const seo = settings?.seo || {};
  const maint = settings?.maintenance || {};

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage system-wide configuration, security parameters, payment gateways, and branding assets.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Persisting...' : 'Save All Settings'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Main Settings Body: Left Navigation + Right Detail Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Vertical Section Switcher */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs space-y-1 h-fit">
          {sections.map((s) => {
            const Icon = s.icon;
            const isSelected = activeSection === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#FA5A36] text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Container */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5 text-xs">
            {/* 1. GENERAL CONFIGURATION */}
            {activeSection === 'general' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">General Website Configuration</h2>
                  <p className="text-slate-400 mt-0.5">Primary platform identifiers, timezone, and support channels.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Platform Name</label>
                    <input
                      type="text"
                      value={gen.platform_name || ''}
                      onChange={(e) => updateField('general', 'platform_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tagline</label>
                    <input
                      type="text"
                      value={gen.tagline || ''}
                      onChange={(e) => updateField('general', 'tagline', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Support Email</label>
                    <input
                      type="email"
                      value={gen.contact_email || ''}
                      onChange={(e) => updateField('general', 'contact_email', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={gen.contact_phone || ''}
                      onChange={(e) => updateField('general', 'contact_phone', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Default Base Currency</label>
                    <select
                      value={gen.default_currency || 'INR'}
                      onChange={(e) => updateField('general', 'default_currency', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36]"
                    >
                      <option value="INR">INR (₹ Indian Rupee)</option>
                      <option value="USD">USD ($ United States Dollar)</option>
                      <option value="GBP">GBP (£ British Pound)</option>
                      <option value="EUR">EUR (€ Euro)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Platform Timezone</label>
                    <input
                      type="text"
                      value={gen.timezone || 'Asia/Kolkata (IST)'}
                      onChange={(e) => updateField('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. BRANDING */}
            {activeSection === 'branding' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Branding & Color Palettes</h2>
                  <p className="text-slate-400 mt-0.5">Brand assets, primary accent colors, and logos.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Brand Accent Color (Hex)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={brand.accent_color || '#FA5A36'}
                        onChange={(e) => updateField('branding', 'accent_color', e.target.value)}
                        className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={brand.accent_color || '#FA5A36'}
                        onChange={(e) => updateField('branding', 'accent_color', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Navy Typography Hex</label>
                    <input
                      type="text"
                      value={brand.dark_navy || '#0B1120'}
                      onChange={(e) => updateField('branding', 'dark_navy', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Header Logo URL</label>
                    <input
                      type="text"
                      value={brand.logo_url || '/assets/stagelink-logo.png'}
                      onChange={(e) => updateField('branding', 'logo_url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Favicon URL</label>
                    <input
                      type="text"
                      value={brand.favicon_url || '/favicon.ico'}
                      onChange={(e) => updateField('branding', 'favicon_url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. EMAIL CONFIGURATION */}
            {activeSection === 'email' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Email SMTP Gateway Configuration</h2>
                  <p className="text-slate-400 mt-0.5">Parameters for automated notifications and transactional dispatch.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SMTP Host</label>
                    <input
                      type="text"
                      value={mail.smtp_host || 'smtp.sendgrid.net'}
                      onChange={(e) => updateField('email', 'smtp_host', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SMTP Port</label>
                    <input
                      type="text"
                      value={mail.smtp_port || '587'}
                      onChange={(e) => updateField('email', 'smtp_port', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sender Display Name</label>
                    <input
                      type="text"
                      value={mail.sender_name || 'StageLink Notifications'}
                      onChange={(e) => updateField('email', 'sender_name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sender Email Address</label>
                    <input
                      type="email"
                      value={mail.sender_email || 'no-reply@stagelink.com'}
                      onChange={(e) => updateField('email', 'sender_email', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. PAYMENT INTEGRATIONS */}
            {activeSection === 'payments' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Payment Gateways & Escrow Rules</h2>
                    <p className="text-slate-400 mt-0.5">Encrypted gateway settings. Secret keys are never exposed in UI.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSensitiveKeys(!showSensitiveKeys)}
                    className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-[11px]"
                  >
                    {showSensitiveKeys ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSensitiveKeys ? 'Hide' : 'Show Masked'}</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Razorpay Gateway (Domestic UPI & Netbanking)</p>
                      <p className="text-slate-400 text-[11px]">Primary payment processor for auditions in India.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pay.razorpay_enabled ?? true}
                        onChange={(e) => updateField('payments', 'razorpay_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FA5A36]"></div>
                    </label>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Stripe Gateway (International Cards & Wire)</p>
                      <p className="text-slate-400 text-[11px]">Enables international transactions in USD, EUR, and GBP.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pay.stripe_enabled ?? true}
                        onChange={(e) => updateField('payments', 'stripe_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FA5A36]"></div>
                    </label>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Escrow Security Hold for Casting Fees</p>
                      <p className="text-slate-400 text-[11px]">Holds performer booking funds securely until final cast wrap.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pay.escrow_enabled ?? true}
                        onChange={(e) => updateField('payments', 'escrow_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FA5A36]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SECURITY & ACCESS */}
            {activeSection === 'security' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Security Policies & Authentication Rules</h2>
                  <p className="text-slate-400 mt-0.5">Session controls, cryptographic token validation, and password policies.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Session Inactivity Timeout (Minutes)</label>
                    <input
                      type="number"
                      value={sec.session_timeout_minutes || 120}
                      onChange={(e) => updateField('security', 'session_timeout_minutes', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Minimum Password Length</label>
                    <input
                      type="number"
                      value={sec.password_min_length || 8}
                      onChange={(e) => updateField('security', 'password_min_length', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Cryptographically signed HMAC-SHA256 session tokens and PBKDF2 password hashing are active server-side.
                  </span>
                </div>
              </div>
            )}

            {/* 6. API INTEGRATIONS */}
            {activeSection === 'api' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Third-Party API Integrations</h2>
                  <p className="text-slate-400 mt-0.5">Endpoints for storage buckets, webhooks, and maps.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Webhook Dispatch Endpoint</label>
                    <input
                      type="url"
                      value={api.webhook_url || 'https://api.stagelink.com/v1/webhooks/'}
                      onChange={(e) => updateField('api', 'webhook_url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cloud Storage Media CDN Endpoint</label>
                    <input
                      type="url"
                      value={api.storage_cdn_url || 'https://cdn.stagelink.com/media/'}
                      onChange={(e) => updateField('api', 'storage_cdn_url', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. FILE & MEDIA LIMITS */}
            {activeSection === 'file_media' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">File & Media Upload Governance</h2>
                  <p className="text-slate-400 mt-0.5">Constrain audition reel sizes, headshot dimensions, and filetypes.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Video Audition File Size (MB)</label>
                    <input
                      type="number"
                      value={media.max_video_size_mb || 100}
                      onChange={(e) => updateField('file_media', 'max_video_size_mb', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Headshot Photo Size (MB)</label>
                    <input
                      type="number"
                      value={media.max_image_size_mb || 10}
                      onChange={(e) => updateField('file_media', 'max_image_size_mb', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Supported Video Formats</label>
                    <input
                      type="text"
                      value={media.supported_video_formats || 'mp4, mov, webm'}
                      onChange={(e) => updateField('file_media', 'supported_video_formats', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 8. SEO & META */}
            {activeSection === 'seo' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">SEO & Metadata Configuration</h2>
                  <p className="text-slate-400 mt-0.5">Control indexing tags and OpenGraph cards for casting calls.</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Global Meta Title</label>
                    <input
                      type="text"
                      value={seo.meta_title || 'StageLink | Premier Casting & Talent Audition Suite'}
                      onChange={(e) => updateField('seo', 'meta_title', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Global Meta Description</label>
                    <textarea
                      rows={3}
                      value={seo.meta_description || 'Connect verified actors, models, and voice artists with top production houses.'}
                      onChange={(e) => updateField('seo', 'meta_description', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 9. MAINTENANCE MODE */}
            {activeSection === 'maintenance' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Maintenance Mode Emergency Override</h2>
                  <p className="text-slate-400 mt-0.5">Direct all non-admin traffic to scheduled maintenance landing screen.</p>
                </div>
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-rose-900">Enable Maintenance Lockout</p>
                      <p className="text-rose-700 text-[11px]">When enabled, only Super Admin accounts can access the platform.</p>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maint.maintenance_mode || false}
                        onChange={(e) => updateField('maintenance', 'maintenance_mode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Custom Maintenance Notice Message</label>
                    <textarea
                      rows={3}
                      value={maint.maintenance_message || 'StageLink is undergoing scheduled platform enhancements. We will be back shortly.'}
                      onChange={(e) => updateField('maintenance', 'maintenance_message', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Save trigger button at bottom of every panel */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Persisting to MongoDB...' : 'Persist Settings Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
