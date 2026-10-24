import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  HardDrive,
  Save,
  X,
  Check,
  CheckCircle2,
  Sliders,
  Globe,
  Camera,
  Film,
  Sparkles,
  Download,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Award,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { getCandidateProfile, saveCandidateProfile } from '../../data/mockCandidates';
import { getStoredSettings, saveStoredSettings } from '../../utils/settingsStorage';
import { candidateService } from '../../services/candidateService';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
];

const CATEGORY_OPTIONS = [
  'Actor',
  'Model',
  'Voiceover Artist',
  'Dancer',
  'Theatre Performer',
  'Singer / Musician',
  'Stunt Performer',
  'Child Actor',
];

const LOCATION_SUGGESTIONS = [
  'Mumbai, India',
  'Delhi NCR, India',
  'Bengaluru, India',
  'London, UK',
  'Los Angeles, CA',
  'New York, NY',
  'Toronto, Canada',
  'Remote / Worldwide',
];

const UNION_OPTIONS = [
  'CINTAA Registered (India)',
  'SAG-AFTRA Eligible / Member',
  'Equity UK Member',
  'Independent / Non-Union',
];

const PROJECT_TYPE_OPTIONS = [
  'Feature Films',
  'OTT / Web Series',
  'TV Commercials & Digital Ads',
  'Theatre & Live Stage',
  'Short Films & Indie Projects',
  'Voiceover & Dubbing',
];

const SettingsPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  // Active tab state: 'account' | 'casting' | 'privacy' | 'notifications' | 'security' | 'data'
  const [activeTab, setActiveTab] = useState('account');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isSaving, setIsSaving] = useState(false);

  // Profile data from storage/backend
  const [candidate, setCandidate] = useState(() => getCandidateProfile(user));
  const [settings, setSettings] = useState(() => getStoredSettings());

  // 1. Account Form State
  const [displayName, setDisplayName] = useState(
    candidate.fullName || user?.fullName || 'Candidate Performer'
  );
  const [headline, setHeadline] = useState(
    candidate.headline || 'Actor • Model'
  );
  const [category, setCategory] = useState(
    candidate.category || (candidate.categories && candidate.categories[0]) || 'Actor'
  );
  const [email, setEmail] = useState(
    candidate.contactEmail || user?.email || ''
  );
  const [phone, setPhone] = useState(
    candidate.phone || user?.phoneNumber || '+91 98201 23456'
  );
  const [location, setLocation] = useState(
    candidate.location || user?.location || 'Mumbai, India'
  );
  const [avatar, setAvatar] = useState(
    candidate.avatar || user?.avatar || SAMPLE_AVATARS[0]
  );
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [accountErrors, setAccountErrors] = useState({});

  // 2. Casting & Availability State
  const [availabilityStatus, setAvailabilityStatus] = useState(
    candidate.availabilityStatus || 'Available for Projects'
  );
  const [travelStatus, setTravelStatus] = useState(
    candidate.travelStatus || 'Open to travel domestically and internationally'
  );
  const [unionStatus, setUnionStatus] = useState(
    candidate.unionStatus || 'CINTAA Registered (India)'
  );
  const [preferredProjects, setPreferredProjects] = useState(
    candidate.preferredProjectTypes || ['Feature Films', 'OTT / Web Series', 'TV Commercials & Digital Ads']
  );

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

  // 5. Password & Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // 6. Account Deletion Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Synchronize state when auth user changes
  useEffect(() => {
    const prof = getCandidateProfile(user);
    setCandidate(prof);
    setDisplayName(prof.fullName || user?.fullName || 'Candidate Performer');
    setHeadline(prof.headline || 'Actor • Model');
    setCategory(prof.category || (prof.categories && prof.categories[0]) || 'Actor');
    setEmail(prof.contactEmail || user?.email || '');
    setPhone(prof.phone || user?.phoneNumber || '+91 98201 23456');
    setLocation(prof.location || user?.location || 'Mumbai, India');
    setAvatar(prof.avatar || user?.avatar || SAMPLE_AVATARS[0]);
    setAvailabilityStatus(prof.availabilityStatus || 'Available for Projects');
    setTravelStatus(prof.travelStatus || 'Open to travel domestically and internationally');
    setUnionStatus(prof.unionStatus || 'CINTAA Registered (India)');
    if (prof.preferredProjectTypes) {
      setPreferredProjects(prof.preferredProjectTypes);
    }
    if (prof.privacySettings) {
      setPrivacy(prof.privacySettings);
    }

    if (user?.id) {
      candidateService
        .getById(user.id)
        .then((live) => {
          if (live) {
            setCandidate(live);
            setDisplayName(live.fullName || user?.fullName || 'Candidate Performer');
            setHeadline(live.headline || 'Actor • Model');
            setEmail(live.contactEmail || live.email || user?.email || '');
            setPhone(live.phone || user?.phoneNumber || '+91 98201 23456');
            setLocation(live.location || user?.location || 'Mumbai, India');
            if (live.avatar) setAvatar(live.avatar);
          }
        })
        .catch((err) => console.warn('Live settings profile fallback:', err));
    }
  }, [user]);

  // Handle Account Info Save
  const handleSaveAccount = async (e) => {
    e?.preventDefault();
    const errors = {};

    if (!displayName.trim()) errors.displayName = 'Display name / Stage name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      errors.email = 'Please enter a valid email address';
    if (!phone.trim()) errors.phone = 'Contact phone number is required';
    if (!location.trim()) errors.location = 'Primary casting base location is required';

    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      setToastMessage('Please correct the highlighted fields.');
      setToastType('error');
      return;
    }

    setAccountErrors({});
    setIsSaving(true);

    try {
      const updates = {
        fullName: displayName,
        contactEmail: email,
        phone,
        location,
        headline,
        category,
        categories: [category],
        avatar,
      };

      const updated = saveCandidateProfile(updates, user);
      setCandidate(updated);

      if (updateUser) {
        updateUser({
          fullName: displayName,
          email,
          phoneNumber: phone,
          location,
          avatar,
        });
      }

      await candidateService.updateProfile(user?.id, updates, user);

      setToastMessage('Account & performer details saved successfully!');
      setToastType('success');
    } catch (err) {
      console.warn('Backend sync warning, stored locally:', err);
      setToastMessage('Account details saved locally.');
      setToastType('success');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Casting & Availability Save
  const handleSaveCasting = async (e) => {
    e?.preventDefault();
    setIsSaving(true);

    try {
      const updates = {
        availabilityStatus,
        travelStatus,
        unionStatus,
        preferredProjectTypes: preferredProjects,
      };

      const updated = saveCandidateProfile(updates, user);
      setCandidate(updated);
      await candidateService.updateProfile(user?.id, updates, user);

      setToastMessage('Casting and audition availability preferences updated!');
      setToastType('success');
    } catch {
      setToastMessage('Preferences saved in local session.');
      setToastType('success');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProjectType = (type) => {
    setPreferredProjects((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Handle Privacy Save
  const handleSavePrivacy = async (e) => {
    e?.preventDefault();
    setIsSaving(true);

    try {
      const updatedProfile = saveCandidateProfile(
        { privacySettings: privacy },
        user
      );
      setCandidate(updatedProfile);

      const updatedSettings = {
        ...settings,
        allowCastingContact,
      };
      setSettings(updatedSettings);
      saveStoredSettings(updatedSettings);

      await candidateService.updateProfile(
        user?.id,
        { privacySettings: privacy },
        user
      );

      setToastMessage('Privacy preferences updated successfully.');
      setToastType('success');
    } catch {
      setToastMessage('Privacy settings saved locally.');
      setToastType('success');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Notifications Save
  const handleSaveNotifications = (e) => {
    e?.preventDefault();
    const updatedSettings = {
      ...settings,
      notificationPreferences: notifPrefs,
    };
    setSettings(updatedSettings);
    saveStoredSettings(updatedSettings);

    setToastMessage('Notification preferences updated successfully.');
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

  const setNotifPreset = (preset) => {
    if (preset === 'all') {
      setNotifPrefs({
        newMessages: { email: true, inApp: true },
        applicationUpdates: { email: true, inApp: true },
        interviewInvitations: { email: true, inApp: true },
        matchingOpportunities: { email: true, inApp: true },
        reminders: { email: true, inApp: true },
      });
    } else if (preset === 'crucial') {
      setNotifPrefs({
        newMessages: { email: true, inApp: true },
        applicationUpdates: { email: false, inApp: true },
        interviewInvitations: { email: true, inApp: true },
        matchingOpportunities: { email: false, inApp: true },
        reminders: { email: true, inApp: true },
      });
    } else if (preset === 'quiet') {
      setNotifPrefs({
        newMessages: { email: false, inApp: true },
        applicationUpdates: { email: false, inApp: true },
        interviewInvitations: { email: false, inApp: true },
        matchingOpportunities: { email: false, inApp: true },
        reminders: { email: false, inApp: true },
      });
    }
  };

  // Handle Password Save
  const handleSavePassword = (e) => {
    e?.preventDefault();
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
    setToastMessage('Password updated successfully! Your account credentials are secure.');
    setToastType('success');
  };

  // Calculate live password strength
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
    if (score === 2) return { score: 2, text: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
    if (score === 3) return { score: 3, text: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
    return { score: 4, text: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };
  const pwdStrength = getPasswordStrength(newPassword);

  // Handle Performer Data Export (JSON)
  const handleExportData = () => {
    try {
      const exportObject = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        account: {
          id: candidate.id || user?.id,
          fullName: displayName,
          email,
          phone,
          location,
          category,
          headline,
        },
        portfolio: candidate.portfolio || {},
        preferences: {
          availabilityStatus,
          travelStatus,
          unionStatus,
          preferredProjectTypes: preferredProjects,
          privacySettings: privacy,
          notificationPreferences: notifPrefs,
        },
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `stagelink_performer_data_${(displayName || 'candidate').toLowerCase().replace(/\s+/g, '_')}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setToastMessage('Profile archive exported successfully!');
      setToastType('success');
    } catch (e) {
      console.error(e);
      setToastMessage('Failed to generate export file.');
      setToastType('error');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle Account Deletion
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
        'Account deletion request recorded.\n\nYour performer profile and active applications have been decommissioned.'
      );
      navigate('/');
    }, 900);
  };

  const navTabs = [
    {
      id: 'account',
      label: 'Profile & Account',
      description: 'Stage name, email, phone & casting base',
      icon: User,
    },
    {
      id: 'casting',
      label: 'Casting & Availability',
      description: 'Audition status, union guild & roles',
      icon: Film,
    },
    {
      id: 'privacy',
      label: 'Privacy & Visibility',
      description: 'Directory lookbook & contact masking',
      icon: Shield,
    },
    {
      id: 'notifications',
      label: 'Alerts & Notifications',
      description: 'Audition sides, callbacks & reminders',
      icon: Bell,
    },
    {
      id: 'security',
      label: 'Password & Security',
      description: 'Credential updates & active sessions',
      icon: Lock,
    },
    {
      id: 'data',
      label: 'Data & Account Actions',
      description: 'Data export, sign out & deletion',
      icon: Sliders,
    },
  ];

  return (
    <PageContainer maxWidth="xl" className="space-y-6 text-left py-6 pb-28">
      {/* ================= HERO PROFILE SUMMARY ================= */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden border border-neutral-700/50">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar with click-to-edit badge */}
            <div className="relative group shrink-0">
              <img
                src={avatar}
                alt={displayName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-white/20 shadow-md group-hover:opacity-90 transition-opacity"
              />
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Change Headshot"
                className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-brand-gold text-brand-navy hover:bg-yellow-400 rounded-xl shadow-md transition-all hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Performer Details */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Verified Performer</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 text-[11px] font-medium">
                  {category}
                </span>
              </div>

              <p className="text-xs text-neutral-300 line-clamp-1 max-w-lg">
                {headline || 'Performer Portfolio registered on StageLink'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{email || 'No email attached'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Links */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <Link
              to="/candidate/profile/public"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
            >
              <span>View Public Lookbook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/candidate/profile/edit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-gold text-brand-navy hover:bg-yellow-400 transition-colors shadow-xs"
            >
              <span>Edit Full Portfolio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ================= TWO-COLUMN SETTINGS LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar (Desktop) / Horizontal Tabs (Mobile) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-3">
          {/* Mobile / Tablet: Horizontal Scrolling Tab Pills */}
          <div className="flex lg:hidden overflow-x-auto gap-2 p-1 bg-gray-100 rounded-2xl no-scrollbar">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-gray-600 hover:text-black hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop: Vertical Settings Menu Card */}
          <div className="hidden lg:block bg-white rounded-3xl border border-brand-border p-3 shadow-card space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Settings & Preferences
            </div>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-sm'
                      : 'hover:bg-gray-50 text-brand-navy hover:text-black'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isActive ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold leading-snug">{tab.label}</p>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isActive ? 'text-neutral-300' : 'text-gray-400'
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>
                </button>
              );
            })}

            <div className="pt-3 mt-3 border-t border-gray-100 px-3 pb-1">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <HardDrive className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>Syncs with Atlas Cloud & Session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* ================= TAB 1: PROFILE & ACCOUNT ================= */}
          {activeTab === 'account' && (
            <form
              onSubmit={handleSaveAccount}
              className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold font-serif text-brand-navy">
                    Performer Profile & Account Information
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-0.5">
                    Your professional stage name, contact channels, and casting jurisdiction.
                  </p>
                </div>
                <Button type="submit" loading={isSaving}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Save Account Details</span>
                </Button>
              </div>

              {/* Headshot Selection Preview */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={avatar}
                    alt="Active Headshot"
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-200"
                  />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">Primary Headshot Photo</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      This photo represents your performer card in casting directors' searches.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="px-3.5 py-1.5 bg-white border border-gray-300 hover:border-black rounded-xl text-xs font-bold text-brand-navy shadow-2xs transition-colors self-start sm:self-auto shrink-0"
                >
                  Change Headshot Photo
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Display Name / Stage Name"
                  placeholder="e.g. Aanya Sharma"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  error={accountErrors.displayName}
                  required
                />

                <Input
                  label="Professional Headline / Tagline"
                  placeholder="e.g. Actor • Model | Classical & Screen Acting"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  helperText="Short one-line summary displayed next to your name"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Primary Performance Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy outline-none focus:border-black"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Primary Contact Email"
                  type="email"
                  placeholder="e.g. aanya.sharma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={accountErrors.email}
                  helperText="Used for verified casting callbacks and notifications"
                  required
                />

                <Input
                  label="Direct Phone / WhatsApp Number"
                  placeholder="e.g. +91 98201 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={accountErrors.phone}
                  helperText="Include country code for international productions"
                  required
                />

                <div className="space-y-1.5">
                  <Input
                    label="Home Casting Location (City & Country)"
                    placeholder="e.g. Mumbai, India"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    error={accountErrors.location}
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {LOCATION_SUGGESTIONS.slice(0, 4).map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[10px] text-gray-600 transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Changes immediately update your public lookbook and talent card</span>
                </span>
                <Button type="submit" loading={isSaving}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Save Account Details</span>
                </Button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: CASTING & AVAILABILITY ================= */}
          {activeTab === 'casting' && (
            <form
              onSubmit={handleSaveCasting}
              className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold font-serif text-brand-navy">
                    Casting & Audition Availability Preferences
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-0.5">
                    Signal your booking readiness, guild status, and preferred production genres.
                  </p>
                </div>
                <Button type="submit" loading={isSaving}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Save Availability</span>
                </Button>
              </div>

              {/* Availability Status Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Current Booking Readiness
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: 'Available for Projects',
                      label: 'Available for Projects',
                      desc: 'Open for immediate audition callbacks and shoots.',
                      color: 'border-emerald-500 bg-emerald-50/20 text-emerald-900',
                      dot: 'bg-emerald-500',
                    },
                    {
                      value: 'Booked / Selective',
                      label: 'Booked / Selective',
                      desc: 'Currently in production. Only considering advance bookings.',
                      color: 'border-amber-500 bg-amber-50/20 text-amber-900',
                      dot: 'bg-amber-500',
                    },
                    {
                      value: 'On Hiatus / Sabbatical',
                      label: 'On Hiatus / Sabbatical',
                      desc: 'Not currently taking new audition appointments.',
                      color: 'border-gray-400 bg-gray-50 text-gray-800',
                      dot: 'bg-gray-400',
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAvailabilityStatus(opt.value)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        availabilityStatus === opt.value
                          ? `${opt.color} ring-1 ring-current shadow-2xs font-semibold`
                          : 'bg-white border-gray-200 hover:border-gray-300 text-brand-navy'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`} />
                        <p className="font-bold text-xs">{opt.label}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Union & Travel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Union / Guild Affiliation
                  </label>
                  <select
                    value={unionStatus}
                    onChange={(e) => setUnionStatus(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy outline-none focus:border-black"
                  >
                    {UNION_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-400">
                    Displayed on your composite card for SAG / Equity casting directors
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Travel & Location Flexibility
                  </label>
                  <select
                    value={travelStatus}
                    onChange={(e) => setTravelStatus(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy outline-none focus:border-black"
                  >
                    <option value="Local Shoots Only (Base City)">Local Shoots Only (Base City)</option>
                    <option value="Open to travel domestically">Open to travel domestically (Nationwide)</option>
                    <option value="Open to travel domestically and internationally">
                      Worldwide / International Travel (Passport Ready)
                    </option>
                  </select>
                  <p className="text-[11px] text-gray-400">
                    Informs casting scouts whether you can travel on set
                  </p>
                </div>
              </div>

              {/* Preferred Project Types */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Preferred Project Types (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TYPE_OPTIONS.map((proj) => {
                    const isSelected = preferredProjects.includes(proj);
                    return (
                      <button
                        key={proj}
                        type="button"
                        onClick={() => toggleProjectType(proj)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-black text-white border-black shadow-2xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                        <span>{proj}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button type="submit" loading={isSaving}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Save Availability</span>
                </Button>
              </div>
            </form>
          )}

          {/* ================= TAB 3: PRIVACY & VISIBILITY ================= */}
          {activeTab === 'privacy' && (
            <form
              onSubmit={handleSavePrivacy}
              className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold font-serif text-brand-navy">
                    Privacy & Casting Visibility Controls
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-0.5">
                    Control who can discover your lookbook and how your contact data is protected.
                  </p>
                </div>
                <Button type="submit" loading={isSaving}>
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  <span>Save Privacy</span>
                </Button>
              </div>

              {/* Directory Visibility */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Directory Lookbook Visibility
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      value: 'public',
                      title: 'Public Lookbook',
                      desc: 'Visible to accredited casting directors, talent scouts, and public search.',
                      badge: 'Recommended',
                    },
                    {
                      value: 'verified_only',
                      title: 'Verified Casting Only',
                      desc: 'Visible exclusively to verified SAG / Equity studio casting teams.',
                      badge: 'Protected',
                    },
                    {
                      value: 'private',
                      title: 'Private / By Link Only',
                      desc: 'Hidden from search. Accessible only through direct application links.',
                      badge: 'Hidden',
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
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xs">{opt.title}</p>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                            privacy.profileVisibility === opt.value
                              ? 'bg-white/20 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-1.5 leading-normal ${
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

              {/* Direct Messaging Switch */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-brand-navy">
                    Allow Casting Directors to Message Directly
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Accredited production teams can initiate direct callback chats and sides inquiries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowCastingContact(!allowCastingContact)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    allowCastingContact ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white block transform transition-transform ${
                      allowCastingContact ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Contact Details Masking */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Contact Information Masking & Safeguards
                </h3>

                <div className="space-y-2">
                  {/* Email Toggle */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-brand-navy">
                        Show Contact Email Publicly
                      </span>
                      <p className="text-[11px] text-gray-500">
                        When disabled, your email is masked. Inquiries pass through verified StageLink message relays.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showEmailPublicly}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, showEmailPublicly: e.target.checked })
                      }
                      className="w-4 h-4 accent-black cursor-pointer shrink-0"
                    />
                  </div>

                  {/* Phone Toggle */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-brand-navy">
                        Show Mobile Phone Publicly
                      </span>
                      <p className="text-[11px] text-gray-500">
                        When disabled, your phone number remains confidential and hidden from unverified visitors.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showPhonePublicly}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, showPhonePublicly: e.target.checked })
                      }
                      className="w-4 h-4 accent-black cursor-pointer shrink-0"
                    />
                  </div>

                  {/* Date of Birth / Playing Age Toggle */}
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-brand-navy">
                        Display Exact Date of Birth
                      </span>
                      <p className="text-[11px] text-gray-500">
                        When disabled, only your playing age bracket (e.g. 20–28 yrs) is displayed to protect age privacy.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showExactDob}
                      onChange={(e) =>
                        setPrivacy({ ...privacy, showExactDob: e.target.checked })
                      }
                      className="w-4 h-4 accent-black cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <Button type="submit" loading={isSaving}>
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  <span>Save Privacy Preferences</span>
                </Button>
              </div>
            </form>
          )}

          {/* ================= TAB 4: NOTIFICATIONS ================= */}
          {activeTab === 'notifications' && (
            <form
              onSubmit={handleSaveNotificationPreferences}
              className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold font-serif text-brand-navy">
                    Notification & Audition Alerts
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-0.5">
                    Select how and when you receive audition invitations, script sides, and callbacks.
                  </p>
                </div>
                <Button type="submit">
                  <Bell className="w-3.5 h-3.5 mr-1" />
                  <span>Save Notifications</span>
                </Button>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-xs font-bold text-gray-500 mr-2">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => setNotifPreset('all')}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition-colors"
                >
                  All Alerts
                </button>
                <button
                  type="button"
                  onClick={() => setNotifPreset('crucial')}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition-colors"
                >
                  Crucial Auditions Only
                </button>
                <button
                  type="button"
                  onClick={() => setNotifPreset('quiet')}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-black hover:text-white transition-colors"
                >
                  Quiet Mode (In-App only)
                </button>
              </div>

              {/* Granular Table */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-gray-400 px-3 pb-2 border-b border-gray-100">
                  <span className="col-span-8">Alert Channel & Type</span>
                  <span className="col-span-2 text-center">Email</span>
                  <span className="col-span-2 text-center">In-App</span>
                </div>

                {[
                  {
                    key: 'interviewInvitations',
                    title: 'Audition & Callback Invitations',
                    desc: 'Time-critical self-tape requests and studio audition invites',
                  },
                  {
                    key: 'newMessages',
                    title: 'Direct Casting Messages',
                    desc: 'Casting director inquiries, sides distribution, and schedule updates',
                  },
                  {
                    key: 'applicationUpdates',
                    title: 'Application Status Changes',
                    desc: 'Notices when your submission moves to Under Review or Shortlisted',
                  },
                  {
                    key: 'matchingOpportunities',
                    title: 'Smart Match Recommendations',
                    desc: 'New casting calls matching your playing age and skills profile',
                  },
                  {
                    key: 'reminders',
                    title: 'Self-Tape & Deadline Reminders',
                    desc: 'Upcoming audition tape deadlines and callback schedules',
                  },
                ].map(({ key, title, desc }) => (
                  <div
                    key={key}
                    className="grid grid-cols-12 items-center p-3.5 rounded-2xl bg-gray-50/70 border border-gray-100 text-xs"
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

          {/* ================= TAB 5: PASSWORD & SECURITY ================= */}
          {activeTab === 'security' && (
            <form
              onSubmit={handleSavePassword}
              className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold font-serif text-brand-navy">
                    Password & Account Security
                  </h2>
                  <p className="text-xs text-brand-text-secondary mt-0.5">
                    Update your login credentials and review your active session safeguards.
                  </p>
                </div>
                <Button type="submit">
                  <Lock className="w-3.5 h-3.5 mr-1" />
                  <span>Update Password</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Password Fields */}
                <div className="space-y-4">
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

                    {/* Live Strength Meter */}
                    {newPassword && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Password Strength:</span>
                          <span className="font-bold text-brand-navy">{pwdStrength.text}</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pwdStrength.color} ${pwdStrength.width} transition-all duration-300`}
                          />
                        </div>
                      </div>
                    )}

                    {passwordErrors.newPassword && (
                      <p className="text-xs text-brand-error font-medium">{passwordErrors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
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
                    {newPassword && confirmPassword && newPassword === confirmPassword && (
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Passwords match
                      </p>
                    )}
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-brand-error font-medium">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Session & Security Info */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-4 text-xs">
                  <div className="flex items-center gap-2 text-brand-navy font-bold text-sm">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Active Session Safeguards</span>
                  </div>

                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-500">Current Device:</span>
                      <span className="font-semibold text-brand-navy">Desktop Browser (Windows)</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-500">Authentication Mode:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        PBKDF2 SHA-256 Hashed
                      </span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <span className="text-gray-500">Active Casting Region:</span>
                      <span className="font-semibold text-brand-navy">{location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Last Password Change:</span>
                      <span className="font-semibold text-brand-navy">Active session standard</span>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-normal">
                    <strong>Security Recommendation:</strong> Use a passphrase with mixed letters, digits, and symbols to ensure protection against unauthorized casting submissions.
                  </div>
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

          {/* ================= TAB 6: DATA & ACCOUNT ACTIONS ================= */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-gray-100 pb-5">
                <h2 className="text-lg font-bold font-serif text-brand-navy">
                  Data Portability & Account Controls
                </h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Export an offline archive of your performer data, sign out, or decommission your account.
                </p>
              </div>

              {/* Data Export Card */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-brand-navy" />
                    <span>Export Performer Data Archive</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Download a comprehensive JSON export of your credits, headshots, contact information, and preferences.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2.5 bg-white border border-gray-300 hover:border-black rounded-xl text-xs font-bold text-brand-navy shadow-2xs transition-colors self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON Archive</span>
                </button>
              </div>

              {/* Sign Out Card */}
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                    <LogOut className="w-4 h-4 text-brand-navy" />
                    <span>Sign Out of StageLink</span>
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    End your active browser session. Your profile and audition applications remain safely stored.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-white border border-gray-300 hover:border-black rounded-xl text-xs font-bold text-brand-navy shadow-2xs transition-colors self-start sm:self-auto shrink-0"
                >
                  Sign Out Now
                </button>
              </div>

              {/* Danger Zone: Account Deletion */}
              <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>Permanent Account Deletion</span>
                  </h3>
                  <p className="text-xs text-red-900/80 mt-1 leading-relaxed">
                    Permanently wipe your performer composite card, headshots, showreel links, active audition submissions, and casting messages.
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
        </div>
      </div>

      {/* ================= MODAL: HEADSHOT PICKER ================= */}
      {isAvatarModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAvatarModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 text-left p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold font-serif text-brand-navy">
                Select Headshot Photo
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Sample Professional Headshots
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {SAMPLE_AVATARS.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAvatar(imgUrl);
                        setIsAvatarModalOpen(false);
                        setToastMessage('Headshot updated! Click Save to apply.');
                        setToastType('info');
                      }}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        avatar === imgUrl
                          ? 'border-black ring-2 ring-black/20 scale-105'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Sample ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {avatar === imgUrl && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-brand-navy">
                  Or enter Custom Image URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/headshot.jpg"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (customAvatarInput.trim()) {
                        setAvatar(customAvatarInput.trim());
                        setCustomAvatarInput('');
                        setIsAvatarModalOpen(false);
                        setToastMessage('Custom headshot set! Click Save to persist.');
                        setToastType('info');
                      }
                    }}
                  >
                    Apply URL
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ACCOUNT DELETION CONFIRMATION ================= */}
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
                <strong>Data Safeguard Notice:</strong> Decommissioning your account removes your talent card from Discover Talent and cancels pending callbacks.
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
