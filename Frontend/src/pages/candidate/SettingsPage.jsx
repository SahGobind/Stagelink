import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Bell,
  Trash2,
  LogOut,
  AlertTriangle,
  ShieldAlert,
  HardDrive,
  Save,
  X,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { getCandidateProfile, saveCandidateProfile } from '../../data/mockCandidates';
import { getStoredSettings, saveStoredSettings } from '../../utils/settingsStorage';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'password' | 'privacy' | 'notifications' | 'management'
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Candidate Profile State (Account & Privacy)
  const [candidate, setCandidate] = useState(() => getCandidateProfile());
  const [settings, setSettings] = useState(() => getStoredSettings());

  // 1. Account Form State
  const [displayName, setDisplayName] = useState(
    candidate.fullName || user?.fullName || 'Sophia Bennett'
  );
  const [email, setEmail] = useState(
    candidate.contactEmail || user?.email || 'sophia.bennett@example.com'
  );
  const [phone, setPhone] = useState(candidate.phone || '+44 7700 900123');
  const [location, setLocation] = useState(
    candidate.location || 'London, UK / Los Angeles, CA'
  );
  const [accountErrors, setAccountErrors] = useState({});

  // 2. Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // 3. Privacy State
  const [privacy, setPrivacy] = useState(
    candidate.privacySettings || {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    }
  );
  const [allowCastingContact, setAllowCastingContact] = useState(
    settings.allowCastingContact ?? true
  );

  // 4. Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState(
    settings.notificationPreferences || {
      newMessages: { email: true, inApp: true },
      applicationUpdates: { email: true, inApp: true },
      interviewInvitations: { email: true, inApp: true },
      matchingOpportunities: { email: false, inApp: true },
      reminders: { email: true, inApp: true },
    }
  );

  // 5. Account Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle Account Update
  const handleSaveAccount = (e) => {
    e.preventDefault();
    const errors = {};

    if (!displayName.trim()) errors.displayName = 'Display name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      errors.email = 'Please enter a valid email address';
    if (!phone.trim()) errors.phone = 'Phone number is required';
    if (!location.trim()) errors.location = 'Primary location is required';

    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      setToastMessage('Please correct the errors in the account form.');
      setToastType('error');
      return;
    }

    setAccountErrors({});
    const updated = saveCandidateProfile({
      fullName: displayName,
      contactEmail: email,
      phone,
      location,
    });
    setCandidate(updated);
    setToastMessage('Account details updated in local session.');
    setToastType('success');
  };

  // Handle Password Update
  const handleSavePassword = (e) => {
    e.preventDefault();
    const errors = {};

    if (!currentPassword) errors.currentPassword = 'Enter your current password';
    if (!newPassword || newPassword.length < 8)
      errors.newPassword = 'New password must be at least 8 characters long';
    if (newPassword !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      setToastMessage('Please check your password inputs.');
      setToastType('error');
      return;
    }

    setPasswordErrors({});
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setToastMessage('Password updated successfully (frontend demo session).');
    setToastType('success');
  };

  // Handle Privacy Update
  const handleSavePrivacy = (e) => {
    e.preventDefault();
    const updatedProfile = saveCandidateProfile({
      privacySettings: privacy,
    });
    setCandidate(updatedProfile);

    const updatedSettings = {
      ...settings,
      allowCastingContact,
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);

    setToastMessage('Privacy preferences updated successfully.');
    setToastType('success');
  };

  // Handle Notification Preferences Update
  const handleSaveNotificationPreferences = (e) => {
    e.preventDefault();
    const updatedSettings = {
      ...settings,
      notificationPreferences: notifPrefs,
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);

    setToastMessage('Notification preferences saved in local session.');
    setToastType('success');
  };

  const toggleNotifPref = (key, channel) => {
    setNotifPrefs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key]?.[channel],
      },
    }));
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle Request Account Deletion (Demo)
  const handleConfirmDelete = () => {
    if (deleteConfirmationText !== 'DELETE') {
      setToastMessage('Please type DELETE to confirm deletion request.');
      setToastType('error');
      return;
    }

    setIsDeleting(true);
    setTimeout(async () => {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      await logout();
      alert(
        'Account deletion requested.\n\nDemonstration notice: In production this schedules GDPR/CCPA permanent data erasure on the backend. You have been logged out.'
      );
      navigate('/');
    }, 800);
  };

  const navTabs = [
    { id: 'account', label: 'Account Information', icon: User },
    { id: 'password', label: 'Password & Security', icon: Lock },
    { id: 'privacy', label: 'Privacy & Visibility', icon: Shield },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'management', label: 'Account Management', icon: AlertTriangle },
  ];

  return (
    <PageContainer maxWidth="lg" className="space-y-6 text-left py-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
          Candidate Settings & Preferences
        </h1>
        <p className="text-xs text-brand-text-secondary mt-0.5">
          Manage your personal credentials, contact privacy, casting notifications, and account security.
        </p>
      </div>

      {/* Tabs Segmented Header */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-black text-white shadow-xs font-bold'
                  : 'text-gray-600 hover:text-black hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: ACCOUNT ================= */}
      {activeTab === 'account' && (
        <form
          onSubmit={handleSaveAccount}
          className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-brand-navy">
              Account Information
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Primary performer contact details and home casting jurisdiction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              label="Display Name / Stage Name"
              placeholder="e.g. Sophia Bennett"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={accountErrors.displayName}
              required
            />

            <Input
              label="Contact Email Address"
              type="email"
              placeholder="e.g. sophia.bennett@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={accountErrors.email}
              helperText="Used for verified casting invitations and callback notices"
              required
            />

            <Input
              label="Direct Phone Number"
              placeholder="e.g. +44 7700 900123"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={accountErrors.phone}
              required
            />

            <Input
              label="Primary Location (City & Country)"
              placeholder="e.g. London, UK / Los Angeles, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={accountErrors.location}
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-gray-400" />
              <span>Saved locally in browser demonstration session</span>
            </span>
            <Button type="submit">
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Save Account Details</span>
            </Button>
          </div>
        </form>
      )}

      {/* ================= TAB 2: PASSWORD ================= */}
      {activeTab === 'password' && (
        <form
          onSubmit={handleSavePassword}
          className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-brand-navy">
              Password & Authentication
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Change your login password and manage account credentials.
            </p>
          </div>

          {/* Frontend Demo Mode Security Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong className="font-bold">Frontend Demo Mode:</strong> Passwords are not persisted in plaintext. Real authentication, hashing, email verification, and session tokens require backend implementation.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy outline-none focus:border-black pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-brand-error font-medium">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy outline-none focus:border-black pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-brand-error font-medium">{passwordErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy outline-none focus:border-black pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-brand-error font-medium">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit">
              <Lock className="w-3.5 h-3.5 mr-1" />
              <span>Update Password</span>
            </Button>
          </div>
        </form>
      )}

      {/* ================= TAB 3: PRIVACY ================= */}
      {activeTab === 'privacy' && (
        <form
          onSubmit={handleSavePrivacy}
          className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-brand-navy">
              Privacy & Casting Visibility Controls
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Control which production companies and casting directors can view your contact information.
            </p>
          </div>

          <div className="space-y-5">
            {/* Profile Visibility */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                Profile Directory Visibility
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    value: 'public',
                    title: 'Public Directory',
                    desc: 'Visible to accredited casting directors and public lookbook.',
                  },
                  {
                    value: 'verified_only',
                    title: 'Verified Casting Only',
                    desc: 'Visible exclusively to verified SAG / Equity studio scouts.',
                  },
                  {
                    value: 'private',
                    title: 'Private / By Link Only',
                    desc: 'Hidden from search. Accessible only through direct application links.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setPrivacy({ ...privacy, profileVisibility: opt.value })
                    }
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      privacy.profileVisibility === opt.value
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-400 text-brand-navy'
                    }`}
                  >
                    <p className="font-bold text-xs">{opt.title}</p>
                    <p
                      className={`text-[11px] mt-1 leading-normal ${
                        privacy.profileVisibility === opt.value
                          ? 'text-neutral-300'
                          : 'text-gray-500'
                      }`}
                    >
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Contact Toggle */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-brand-navy">
                  Allow Casting Teams to Message Directly
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Accredited casting directors can initiate direct messages and callback inquiries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAllowCastingContact(!allowCastingContact)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  allowCastingContact ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white block transform transition-transform ${
                    allowCastingContact ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Contact Details Visibility */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                Contact Information Visibility
              </h3>

              <div className="space-y-2">
                {/* Email toggle */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-navy">Show Contact Email Publicly</span>
                    <p className="text-[11px] text-gray-500">
                      When disabled, your email is masked and revealed only upon approved casting requests.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showEmailPublicly}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, showEmailPublicly: e.target.checked })
                    }
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </div>

                {/* Phone toggle */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-navy">Show Mobile Phone Publicly</span>
                    <p className="text-[11px] text-gray-500">
                      When disabled, your phone number remains confidential.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showPhonePublicly}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, showPhonePublicly: e.target.checked })
                    }
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </div>

                {/* Exact DOB toggle */}
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-navy">Display Exact Date of Birth</span>
                    <p className="text-[11px] text-gray-500">
                      When disabled, only your playing age bracket (e.g. 20–28 yrs) is displayed.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showExactDob}
                    onChange={(e) =>
                      setPrivacy({ ...privacy, showExactDob: e.target.checked })
                    }
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit">
              <Shield className="w-3.5 h-3.5 mr-1" />
              <span>Save Privacy Preferences</span>
            </Button>
          </div>
        </form>
      )}

      {/* ================= TAB 4: NOTIFICATION PREFERENCES ================= */}
      {activeTab === 'notifications' && (
        <form
          onSubmit={handleSaveNotificationPreferences}
          className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-brand-navy">
              Notification Preferences
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Choose which alerts you receive via email and in-app dashboard badges.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-gray-400 px-3 pb-2 border-b border-gray-100">
              <span className="col-span-8">Alert Type</span>
              <span className="col-span-2 text-center">Email</span>
              <span className="col-span-2 text-center">In-App</span>
            </div>

            {[
              {
                key: 'newMessages',
                title: 'New Casting Messages',
                desc: 'Direct inquiries, callback sides, and director messages',
              },
              {
                key: 'applicationUpdates',
                title: 'Application Updates',
                desc: 'Status changes from Submitted to Under Review or Decision',
              },
              {
                key: 'interviewInvitations',
                title: 'Interview Invitations & Callbacks',
                desc: 'Audition self-tape requests and in-person studio calls',
              },
              {
                key: 'matchingOpportunities',
                title: 'Matching Opportunities',
                desc: 'New roles matching your playing age, location, and skills',
              },
              {
                key: 'reminders',
                title: 'Audition Reminders',
                desc: 'Upcoming tape deadlines and callback schedules',
              },
            ].map(({ key, title, desc }) => (
              <div
                key={key}
                className="grid grid-cols-12 items-center p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs"
              >
                <div className="col-span-8 space-y-0.5">
                  <p className="font-bold text-brand-navy">{title}</p>
                  <p className="text-[11px] text-gray-500">{desc}</p>
                </div>

                <div className="col-span-2 flex justify-center">
                  <input
                    type="checkbox"
                    checked={notifPrefs[key]?.email}
                    onChange={() => toggleNotifPref(key, 'email')}
                    className="w-4 h-4 accent-black cursor-pointer"
                    aria-label={`${title} Email alerts`}
                  />
                </div>

                <div className="col-span-2 flex justify-center">
                  <input
                    type="checkbox"
                    checked={notifPrefs[key]?.inApp}
                    onChange={() => toggleNotifPref(key, 'inApp')}
                    className="w-4 h-4 accent-black cursor-pointer"
                    aria-label={`${title} In-App alerts`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button type="submit">
              <Bell className="w-3.5 h-3.5 mr-1" />
              <span>Save Notification Preferences</span>
            </Button>
          </div>
        </form>
      )}

      {/* ================= TAB 5: ACCOUNT MANAGEMENT ================= */}
      {activeTab === 'management' && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-bold font-serif text-brand-navy">
              Account Management & Session Controls
            </h2>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              Sign out of your active session or submit an account deletion request.
            </p>
          </div>

          {/* Logout Card */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                <LogOut className="w-4 h-4 text-brand-navy" />
                <span>Sign Out of StarCast</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Log out of this browser session. You can sign back in anytime.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 bg-white border border-gray-300 hover:border-black rounded-xl text-xs font-bold text-brand-navy shadow-2xs transition-colors self-start sm:self-auto shrink-0"
            >
              Sign Out Now
            </button>
          </div>

          {/* Danger Zone: Account Deletion */}
          <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
            <div>
              <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Request Account Deletion</span>
              </h3>
              <p className="text-xs text-red-900/80 mt-1 leading-relaxed">
                Permanently deletes your performer profile, composite cards, headshots, showreel links, active audition applications, and messaging history.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmationText('');
                  setIsDeleteModalOpen(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Request Account Deletion...
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 text-left p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold font-serif text-brand-navy">
                  Confirm Account Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                This action is <strong className="text-red-700">permanent</strong>. All casting submissions, showreels, headshots, and messages associated with <strong className="text-brand-navy">{displayName}</strong> will be permanently wiped.
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-normal">
                <strong>Demonstration Architecture Notice:</strong> Account deletion remains a client-side simulation. Real permanent deletion requires backend GDPR/CCPA erasure pipelines.
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-brand-navy">
                  Type <span className="font-mono text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-red-500 rounded-xl px-3 py-2 text-xs font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage('')}
      />
    </PageContainer>
  );
};

export default SettingsPage;
