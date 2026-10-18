import React from 'react';
import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  ShieldCheck,
  Edit3,
  Eye,
  Sliders,
  Plane,
  Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const ProfileHeader = ({
  candidate,
  isOwn = false,
  onOpenPublicPreview,
  onOpenPrivacySettings,
}) => {
  if (!candidate) return null;

  const privacy = candidate.privacySettings || {};

  // Compute displayed age or birth date according to privacy setting
  const getDisplayedAge = () => {
    if (!candidate.dateOfBirth) return null;
    if (privacy.showExactDob) {
      return candidate.dateOfBirth;
    }
    const birthYear = parseInt(candidate.dateOfBirth.split('-')[0], 10);
    if (!birthYear || isNaN(birthYear)) return null;
    const currentYear = 2026;
    const age = currentYear - birthYear;
    return `Playing Age: ${Math.max(18, age - 4)}–${age + 4} yrs`;
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden">
      {/* Cover Image Banner */}
      <div className="relative h-48 sm:h-64 md:h-72 w-full bg-brand-navy overflow-hidden">
        {candidate.coverImage ? (
          <img
            src={candidate.coverImage}
            alt="Profile Banner"
            className="w-full h-full object-cover object-center opacity-85"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-r from-zinc-900 via-neutral-900 to-black" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/15 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>StageLink Verified Talent</span>
            </span>
            {candidate.unionStatus && (
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-medium border border-white/20">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>{candidate.unionStatus}</span>
              </span>
            )}
          </div>

          {/* Availability Pill */}
          {candidate.availability && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="hidden sm:inline">{candidate.availability}</span>
              <span className="sm:hidden">Available</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Profile Info Header */}
      <div className="px-6 sm:px-8 pb-8 pt-0 relative">
        <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 -mt-20 sm:-mt-24 mb-6">
          {/* Avatar and Primary Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-white">
                <img
                  src={candidate.avatar}
                  alt={candidate.fullName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-brand-pink text-white p-1.5 rounded-full shadow-md border-2 border-white">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-navy font-serif">
                  {candidate.fullName}
                </h1>
                {candidate.yearsOfExperience && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-brand-navy text-[11px] font-semibold">
                    {candidate.yearsOfExperience}+ Years Pro
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-brand-text-secondary max-w-xl">
                {candidate.headline}
              </p>

              {/* Meta information tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-gray-500 pt-1">
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{candidate.location}</span>
                </div>

                {getDisplayedAge() && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{getDisplayedAge()}</span>
                  </div>
                )}

                {candidate.travelStatus && (
                  <div className="hidden md:flex items-center gap-1 text-gray-600">
                    <Plane className="w-3.5 h-3.5 text-gray-400" />
                    <span>{candidate.travelStatus}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          {isOwn && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 w-full lg:w-auto">
              {onOpenPublicPreview && (
                <button
                  type="button"
                  onClick={onOpenPublicPreview}
                  className="px-4 py-2.5 rounded-xl border border-brand-border hover:border-gray-400 bg-white hover:bg-gray-50 text-xs font-semibold text-brand-navy shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>Public View Preview</span>
                </button>
              )}

              {onOpenPrivacySettings && (
                <button
                  type="button"
                  onClick={onOpenPrivacySettings}
                  className="px-3 py-2.5 rounded-xl border border-brand-border hover:border-gray-400 bg-white hover:bg-gray-50 text-xs font-semibold text-brand-navy shadow-xs flex items-center gap-1.5 transition-all"
                  title="Privacy Controls"
                >
                  <Sliders className="w-4 h-4 text-gray-500" />
                  <span className="hidden sm:inline">Privacy</span>
                </button>
              )}

              <Link to="/candidate/profile/edit">
                <Button variant="primary" size="sm" className="space-x-1.5">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Contact info bar with privacy indicators */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Email Contact */}
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              {privacy.showEmailPublicly ? (
                <a
                  href={`mailto:${candidate.contactEmail}`}
                  className="font-medium text-brand-navy hover:underline"
                >
                  {candidate.contactEmail}
                </a>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-brand-navy">
                    {candidate.contactEmail?.replace(/(.{3})(.*)(@.*)/, '$1***$3') ||
                      'Protected Email'}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                    Verified Casting Only
                  </span>
                </div>
              )}
            </div>

            {/* Phone Contact */}
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              {privacy.showPhonePublicly ? (
                <a
                  href={`tel:${candidate.phone}`}
                  className="font-medium text-brand-navy hover:underline"
                >
                  {candidate.phone}
                </a>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500 font-medium">+XX ••• ••• ••••</span>
                  <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    On Request Only
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick link to setup wizard if own profile */}
          {isOwn && (
            <Link
              to="/candidate/profile/setup"
              className="text-xs font-semibold text-brand-navy hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch 5-Step Setup Wizard</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
