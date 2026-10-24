import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  User,
  FileText,
  Image as ImageIcon,
  Sliders,
  ShieldCheck,
  UploadCloud,
  Eye,
  CheckCircle2,
  Sparkles,
  Lock,
  Calendar,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import PublicProfileModal from '../../components/profile/PublicProfileModal';
import Toast from '../../components/common/Toast';
import { getCandidateProfile, saveCandidateProfile } from '../../data/mockCandidates';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(() => getCandidateProfile(user));
  const [isPublicPreviewOpen, setIsPublicPreviewOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isResumeUploadOpen, setIsResumeUploadOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Synchronize if profile changes or user changes
  useEffect(() => {
    setCandidate(getCandidateProfile(user));
    let isMounted = true;
    if (user?.id) {
      candidateService.getById(user.id).then((profile) => {
        if (isMounted && profile) setCandidate(profile);
      }).catch((err) => console.warn('Failed to load profile dynamically:', err));
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    const handleStorageChange = () => {
      setCandidate(getCandidateProfile(user));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('starcast_profile_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('starcast_profile_updated', handleStorageChange);
    };
  }, [user]);

  const profileCompletion = candidate.profileCompletion || 85;

  // Circular progress math (circumference = 2 * PI * r)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (profileCompletion / 100) * circumference;

  const handleResumeUploaded = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = saveCandidateProfile(
        {
          portfolio: {
            ...candidate.portfolio,
            resume: {
              fileName: file.name,
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              uploadDate: 'Just now',
            },
          },
        },
        user
      );
      setCandidate(updated);
      setIsResumeUploadOpen(false);
      setToastMessage('Resume uploaded successfully!');
    }
  };

  const handleTogglePrivacy = (key) => {
    const current = candidate.privacySettings || {};
    const updated = saveCandidateProfile(
      {
        privacySettings: {
          ...current,
          [key]: !current[key],
        },
      },
      user
    );
    setCandidate(updated);
    setToastMessage('Privacy preferences updated.');
  };

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 pb-12 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-serif tracking-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your profile and keep it up to date.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/candidate/profile/public"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 shadow-2xs transition-all"
          >
            <span>View Public Profile</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
          </Link>
        </div>
      </div>

      {/* Profile Completion Banner Card */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Circular Progress Ring */}
          <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-pink-100 stroke-current"
                strokeWidth="5.5"
                fill="transparent"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                className="text-brand-pink stroke-current transition-all duration-700 ease-out"
                strokeWidth="5.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-sm font-bold text-gray-900 tracking-tight">
              {profileCompletion}%
            </span>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Profile Completion
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Almost there! Complete your profile to get more opportunities.
            </p>
          </div>
        </div>

        <Link
          to="/candidate/profile/setup"
          className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors text-center"
        >
          Complete Profile
        </Link>
      </div>

      {/* Profile Sections Grid (2 Columns, 3 Rows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Basic Information */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Basic Information</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Completed
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <img
                src={candidate.avatar}
                alt={candidate.fullName}
                className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">
                  {candidate.fullName}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {candidate.categories?.join(', ') || candidate.headline || 'Actor, Model'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>{candidate.location}</span>
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/candidate/profile/setup?step=1"
            className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-center block"
          >
            Edit
          </Link>
        </div>

        {/* Card 2: Professional Details */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Professional Details</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Completed
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Bio, experience, skills and languages.
              </p>
            </div>
          </div>

          <Link
            to="/candidate/profile/setup?step=2"
            className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-center block"
          >
            Edit
          </Link>
        </div>

        {/* Card 3: Photos & Videos */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Photos & Videos</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-brand-pink border border-pink-200">
                In Progress
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-700 font-medium">
                {candidate.portfolio?.headshots?.length || 4} headshots
                {candidate.instagram || candidate.portfolio?.instagram ? ` • ${candidate.instagram || candidate.portfolio?.instagram}` : ' • 1 video showreel'}
              </p>
            </div>
          </div>

          <Link
            to="/candidate/profile/setup?step=3"
            className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-center block"
          >
            Add More
          </Link>
        </div>

        {/* Card 4: Casting Preferences */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Casting Preferences</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Completed
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Preferred project types and availability.
              </p>
            </div>
          </div>

          <Link
            to="/candidate/profile/setup?step=4"
            className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-center block"
          >
            Edit
          </Link>
        </div>

        {/* Card 5: Contact & Privacy */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Contact & Privacy</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                Completed
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Manage your visibility and contact options.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-center block"
          >
            Edit
          </button>
        </div>

        {/* Card 6: Resume / CV */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Resume / CV</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {candidate.portfolio?.resume ? 'Uploaded' : 'Optional'}
              </span>
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {candidate.portfolio?.resume?.fileName || 'Upload your resume for casting directors.'}
                </p>
                {candidate.portfolio?.resume?.fileSize && (
                  <span className="text-[11px] text-gray-400">
                    {candidate.portfolio.resume.fileSize}
                  </span>
                )}
              </div>
            </div>
          </div>

          <label className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors text-center block cursor-pointer">
            <span>Upload</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleResumeUploaded}
            />
          </label>
        </div>
      </div>

      {/* Privacy Settings Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Contact & Privacy Settings</h3>
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Control what casting directors and the public can view on your talent card.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-800">Public Email</p>
                  <p className="text-[11px] text-gray-500">{candidate.contactEmail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('showEmailPublicly')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    candidate.privacySettings?.showEmailPublicly ? 'bg-brand-pink' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      candidate.privacySettings?.showEmailPublicly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-800">Public Phone</p>
                  <p className="text-[11px] text-gray-500">{candidate.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('showPhonePublicly')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    candidate.privacySettings?.showPhonePublicly ? 'bg-brand-pink' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      candidate.privacySettings?.showPhonePublicly ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-800">Show Exact Age / DOB</p>
                  <p className="text-[11px] text-gray-500">26 years ({candidate.dateOfBirth})</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePrivacy('showExactDob')}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    candidate.privacySettings?.showExactDob ? 'bg-brand-pink' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      candidate.privacySettings?.showExactDob ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Profile Modal */}
      <PublicProfileModal
        isOpen={isPublicPreviewOpen}
        onClose={() => setIsPublicPreviewOpen(false)}
        candidate={candidate}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default MyProfilePage;
