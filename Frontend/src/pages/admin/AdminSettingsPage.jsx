import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Shield,
  Bell,
  Lock,
  Save,
  CheckCircle2,
  HardDrive,
  LogOut,
  MapPin,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminSettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'notifications' | 'security'
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  // Studio profile
  const [studioName, setStudioName] = useState(
    user?.companyName || user?.company_name || 'Auteur Pictures Studio'
  );
  const [adminEmail, setAdminEmail] = useState(
    user?.email || 'admin@stagelink.com'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    user?.phoneNumber || '+91 98765 00000'
  );
  const [website, setWebsite] = useState(
    user?.website || 'https://auteurstudio.com'
  );
  const [location, setLocation] = useState(
    user?.location || 'Mumbai, India'
  );

  // Notifications
  const [notifState, setNotifState] = useState({
    candidateApplications: true,
    auditionTapeUploads: true,
    directMessages: true,
    supportAlerts: true,
    emailSummaries: false,
  });

  // Password
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const handleSaveStudio = (e) => {
    e.preventDefault();
    if (updateUser) {
      updateUser({
        companyName: studioName,
        email: adminEmail,
        phoneNumber,
        website,
        location,
      });
    }
    setToastMsg('Studio and agency details updated successfully!');
    setToastType('success');
  };

  const handleSaveNotifs = (e) => {
    e.preventDefault();
    setToastMsg('Notification preferences updated!');
    setToastType('success');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!newPwd || newPwd.length < 8) {
      setToastMsg('New password must be at least 8 characters.');
      setToastType('error');
      return;
    }
    if (newPwd !== confirmPwd) {
      setToastMsg('Passwords do not match.');
      setToastType('error');
      return;
    }
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setToastMsg('Admin security credentials updated successfully!');
    setToastType('success');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <PageContainer maxWidth="lg" className="space-y-6 text-left py-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
          Studio Administration & Settings
        </h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">
          Manage your production agency profile, casting notification webhooks, and team credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-2xl">
        {[
          { id: 'studio', label: 'Studio Profile', icon: Building2 },
          { id: 'notifications', label: 'Casting Alerts', icon: Bell },
          { id: 'security', label: 'Security & Team', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-white/70'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Studio Profile */}
      {activeTab === 'studio' && (
        <form
          onSubmit={handleSaveStudio}
          className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-brand-navy">
              Agency & Production House Details
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Accredited studio information displayed on published casting calls and contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Production Company / Studio Name"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              required
            />
            <Input
              label="Primary Administrator Email"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
            />
            <Input
              label="Direct Casting Desk Phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Input
              label="Official Studio Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Input
              label="Primary Production Headquarters"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Visible to applicants on published opportunities</span>
            </span>
            <Button type="submit">
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Save Studio Details</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Casting Alerts */}
      {activeTab === 'notifications' && (
        <form
          onSubmit={handleSaveNotifs}
          className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-brand-navy">
              Casting Desk Alerts & Relays
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Configure notifications for new candidate submissions, auditions, and tape submissions.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                key: 'candidateApplications',
                title: 'New Candidate Submissions',
                desc: 'Instant notice whenever talent submits an application to your open roles',
              },
              {
                key: 'auditionTapeUploads',
                title: 'Self-Tape & Video Reel Submissions',
                desc: 'Alerts when requested self-tape sides are delivered by performers',
              },
              {
                key: 'directMessages',
                title: 'Candidate Inquiries & Messages',
                desc: 'Direct chats from invited candidates and auditionees',
              },
              {
                key: 'supportAlerts',
                title: 'Studio Verification & Compliance Notices',
                desc: 'Updates from StageLink platform operations desk',
              },
            ].map(({ key, title, desc }) => (
              <div
                key={key}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-bold text-brand-navy">{title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifState[key]}
                  onChange={(e) =>
                    setNotifState({ ...notifState, [key]: e.target.checked })
                  }
                  className="w-4 h-4 accent-black cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit">
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Save Alert Preferences</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Security & Team */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form
            onSubmit={handleSavePassword}
            className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6"
          >
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Studio Password & Credentials
              </h2>
              <p className="text-xs text-brand-text-secondary mt-0.5">
                Maintain access credentials for studio administrators.
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Minimum 8 characters"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button type="submit">
                <Lock className="w-3.5 h-3.5 mr-1" />
                <span>Update Admin Password</span>
              </Button>
            </div>
          </form>

          {/* Session Sign Out */}
          <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-card flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-brand-navy" />
                <span>Sign Out of Studio Admin</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                End active session across this workstation.
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-300 hover:border-black rounded-xl text-xs font-bold text-brand-navy"
            >
              Sign Out Now
            </button>
          </div>
        </div>
      )}

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </PageContainer>
  );
};

export default AdminSettingsPage;
