import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
  Megaphone,
  Globe,
  PlusCircle,
  Trash2,
  Edit2,
  RefreshCw,
  Mail,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NotificationsCMSPage = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAllAsRead, addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('broadcasts'); // 'broadcasts' | 'banner' | 'faqs' | 'emails'
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Broadcast modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'system',
    targetRole: 'all',
  });

  // FAQ modal
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [faqForm, setFaqForm] = useState({ q: '', a: '' });
  const [editingFaqIndex, setEditingFaqIndex] = useState(null);

  const fetchCMS = useCallback(async () => {
    try {
      const res = await apiRequest('/api/users/admin/cms/');
      if (res.ok) {
        const json = await res.json();
        setCmsData(json);
      }
    } catch (err) {
      console.warn('Failed to load CMS content:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCMS();
  }, [fetchCMS]);

  // Dispatch Broadcast Notification
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;

    addNotification({
      title: broadcastForm.title,
      message: broadcastForm.message,
      type: broadcastForm.type,
      time: 'Just now',
      read: false,
      sender: user?.fullName || 'StageLink Administration',
    });

    setIsBroadcastModalOpen(false);
    setBroadcastForm({ title: '', message: '', type: 'system', targetRole: 'all' });
    setActionSuccessMsg('Broadcast alert successfully dispatched to platform users.');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Save Website Banner & CMS Settings to Backend
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiRequest('/api/users/admin/cms/', {
        method: 'POST',
        body: JSON.stringify(cmsData),
      });
      if (res.ok) {
        setActionSuccessMsg('Website announcement banner & settings persisted to MongoDB Atlas.');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Add/Edit FAQ
  const handleSaveFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.q.trim() || !faqForm.a.trim()) return;

    const currentFaqs = cmsData?.faqs ? [...cmsData.faqs] : [];
    if (editingFaqIndex !== null) {
      currentFaqs[editingFaqIndex] = faqForm;
    } else {
      currentFaqs.push(faqForm);
    }

    const updated = { ...cmsData, faqs: currentFaqs };
    setCmsData(updated);
    setIsFaqModalOpen(false);
    setFaqForm({ q: '', a: '' });
    setEditingFaqIndex(null);

    await apiRequest('/api/users/admin/cms/', {
      method: 'POST',
      body: JSON.stringify(updated),
    });
    setActionSuccessMsg('FAQ list updated successfully.');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  // Delete FAQ
  const handleDeleteFaq = async (index) => {
    const currentFaqs = [...(cmsData?.faqs || [])];
    currentFaqs.splice(index, 1);
    const updated = { ...cmsData, faqs: currentFaqs };
    setCmsData(updated);
    await apiRequest('/api/users/admin/cms/', {
      method: 'POST',
      body: JSON.stringify(updated),
    });
    setActionSuccessMsg('FAQ deleted.');
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Loading notification and CMS manager..." />
      </div>
    );
  }

  const banner = cmsData?.banner || {
    enabled: true,
    text: 'Auditions open for Feature Film: Lead & Supporting Characters (Mumbai & Delhi).',
    link: '/admin/casting-calls',
    badge: 'Hot Notice',
    theme: 'orange',
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Notifications & CMS Content Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage platform announcements, live website banners, FAQ entries, and automated notification templates.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>New Broadcast Notice</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-2 text-xs">
        {[
          { key: 'broadcasts', label: 'Broadcast Alerts & In-App', icon: Bell },
          { key: 'banner', label: 'Website Announcement Banner', icon: Megaphone },
          { key: 'faqs', label: 'Platform FAQs', icon: HelpCircle },
          { key: 'emails', label: 'Email Notification Templates', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BROADCAST ALERTS & IN-APP NOTIFICATIONS */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Recent Platform Notifications</h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#FA5A36] hover:underline cursor-pointer"
                >
                  Mark All Read
                </button>
              )}
            </div>

            <div className="space-y-3">
              {(notifications || []).map((notif, idx) => (
                <div
                  key={notif.id || idx}
                  className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FA5A36] flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                        <span>{notif.time || 'Recent'}</span>
                        <span>•</span>
                        <span>By {notif.sender || 'System'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                    {notif.type || 'system'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE ANNOUNCEMENT BANNER */}
      {activeTab === 'banner' && (
        <form onSubmit={handleSaveBanner} className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Homepage Top Marquee Banner</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publish a global announcement bar displayed to all visitors on the StageLink website.
                </p>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={banner.enabled}
                  onChange={(e) =>
                    setCmsData({
                      ...cmsData,
                      banner: { ...banner, enabled: e.target.checked },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FA5A36]"></div>
              </label>
            </div>

            {/* Live Preview */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Live Preview</span>
              <div
                className={`p-3 rounded-xl flex items-center justify-between text-xs font-medium ${
                  banner.theme === 'navy'
                    ? 'bg-slate-900 text-white'
                    : banner.theme === 'emerald'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#FA5A36] text-white'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/20 uppercase tracking-wider">
                    {banner.badge || 'Announcement'}
                  </span>
                  <span className="truncate">{banner.text}</span>
                </div>
                <span className="font-bold underline text-[11px] shrink-0 ml-4">Learn More →</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Tag Badge</label>
                <input
                  type="text"
                  value={banner.badge || ''}
                  onChange={(e) =>
                    setCmsData({
                      ...cmsData,
                      banner: { ...banner, badge: e.target.value },
                    })
                  }
                  placeholder="e.g. Hot Notice"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Theme Color</label>
                <select
                  value={banner.theme || 'orange'}
                  onChange={(e) =>
                    setCmsData({
                      ...cmsData,
                      banner: { ...banner, theme: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36]"
                >
                  <option value="orange">StageLink Brand Orange (#FA5A36)</option>
                  <option value="navy">Midnight Navy (#0F172A)</option>
                  <option value="emerald">Emerald Green (#059669)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Announcement Text</label>
                <input
                  type="text"
                  value={banner.text || ''}
                  onChange={(e) =>
                    setCmsData({
                      ...cmsData,
                      banner: { ...banner, text: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Destination URL / Route</label>
                <input
                  type="text"
                  value={banner.link || ''}
                  onChange={(e) =>
                    setCmsData({
                      ...cmsData,
                      banner: { ...banner, link: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Persist Website Banner Changes'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: PLATFORM FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage questions shown in the candidate & casting director help center.
                </p>
              </div>
              <button
                onClick={() => {
                  setFaqForm({ q: '', a: '' });
                  setEditingFaqIndex(null);
                  setIsFaqModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {(cmsData?.faqs || []).map((faq, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#FA5A36]" />
                      <span>{faq.q}</span>
                    </h3>
                    <p className="text-xs text-slate-600 pl-5 leading-relaxed">{faq.a}</p>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => {
                        setFaqForm(faq);
                        setEditingFaqIndex(idx);
                        setIsFaqModalOpen(true);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(idx)}
                      className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMAIL TEMPLATES */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Email Notification Templates</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and configure transactional automated notification emails sent via SendGrid / SMTP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Welcome & Email Verification</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
              </div>
              <p className="text-slate-500 text-[11px]">Dispatched instantly upon registration to verify performer and studio email address.</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">Subject: Welcome to StageLink – Verify your account</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Audition Invitation Notice</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
              </div>
              <p className="text-slate-500 text-[11px]">Sent when a production studio invites candidate for callback audition interview.</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">Subject: Audition Callback: [Role Title] at [Studio]</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Profile Verification Approved</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
              </div>
              <p className="text-slate-500 text-[11px]">Sent when Super Admin approves artist badge or production house license.</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">Subject: Congratulations! Your StageLink Verification is Approved</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Payment Invoice & Receipt</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">Active</span>
              </div>
              <p className="text-slate-500 text-[11px]">Includes transaction ID, GST details, order amount, and breakdown.</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">Subject: StageLink Payment Receipt: Order #[Order_ID]</div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {isBroadcastModalOpen && (
        <Modal
          isOpen={isBroadcastModalOpen}
          onClose={() => setIsBroadcastModalOpen(false)}
          title="Broadcast Announcement Notice"
        >
          <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
              <select
                value={broadcastForm.targetRole}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, targetRole: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36]"
              >
                <option value="all">All Platform Users (Talent + Studios + Staff)</option>
                <option value="candidate">Artists & Performers Only</option>
                <option value="recruiter">Production Studios & Casting Directors Only</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Alert Headline</label>
              <input
                type="text"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                placeholder="e.g. Scheduled Maintenance or New Feature Announcement"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Message Body</label>
              <textarea
                rows={4}
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                placeholder="Detailed announcement notification message..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl font-semibold cursor-pointer"
              >
                Dispatch Alert
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* FAQ Modal */}
      {isFaqModalOpen && (
        <Modal
          isOpen={isFaqModalOpen}
          onClose={() => setIsFaqModalOpen(false)}
          title={editingFaqIndex !== null ? 'Edit FAQ Entry' : 'Add New FAQ Entry'}
        >
          <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Question</label>
              <input
                type="text"
                value={faqForm.q}
                onChange={(e) => setFaqForm({ ...faqForm, q: e.target.value })}
                placeholder="e.g. How does escrow payment work?"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Authoritative Answer</label>
              <textarea
                rows={4}
                value={faqForm.a}
                onChange={(e) => setFaqForm({ ...faqForm, a: e.target.value })}
                placeholder="Clear and detailed explanation..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl font-semibold cursor-pointer"
              >
                Save FAQ
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default NotificationsCMSPage;

