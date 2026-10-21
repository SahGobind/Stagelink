import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Heart,
  Send,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FALLBACK_TALENT_AVATAR } from '../../data/mockTalentDirectory';

const TalentCard = ({
  talent,
  isSaved = false,
  onToggleSave,
  onInvite,
}) => {
  const [imgSrc, setImgSrc] = useState(talent.avatar || FALLBACK_TALENT_AVATAR);
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      setImgSrc(FALLBACK_TALENT_AVATAR);
    }
  };

  const primaryCategory = talent.category || (talent.categories && talent.categories[0]) || 'Performer';
  const skillsToShow = talent.skills ? talent.skills.slice(0, 3) : [];
  const remainingSkillsCount = talent.skills && talent.skills.length > 3 ? talent.skills.length - 3 : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden text-left relative">
      {/* Top Image & Header */}
      <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
        <img
          src={imgSrc}
          alt={talent.fullName}
          onError={handleImageError}
          className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-auto">
          {/* Category Pill */}
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-brand-navy text-[11px] font-bold shadow-xs">
            {primaryCategory}
          </span>

          {/* Save Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave?.(talent);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs ${
              isSaved
                ? 'bg-brand-pink text-white scale-105'
                : 'bg-white/90 text-gray-600 hover:text-brand-pink hover:bg-white'
            }`}
            title={isSaved ? 'Saved to Roster' : 'Save Talent'}
            aria-label={isSaved ? 'Remove from saved talent' : 'Save talent to roster'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Banner inside Image: Name & Location */}
        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-bold font-serif text-white tracking-tight drop-shadow-sm truncate">
              {talent.fullName}
            </h3>
            {talent.verificationStatus === 'verified' && (
              <span className="shrink-0 text-brand-pink" title="StageLink Verified Artist">
                <CheckCircle2 className="w-4 h-4 fill-white text-brand-pink" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-200 mt-0.5 font-medium">
            <MapPin className="w-3 h-3 text-pink-300 shrink-0" />
            <span className="truncate">{talent.city && talent.country ? `${talent.city}, ${talent.country}` : talent.location}</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Availability Status Badge & Experience */}
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[140px]">{talent.availabilityStatus || talent.availability || 'Available'}</span>
          </span>

          <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 shrink-0">
            {talent.experienceYears || (talent.yearsOfExperience ? `${talent.yearsOfExperience}+ Yrs` : 'Experienced')}
          </span>
        </div>

        {/* Professional Bio */}
        <p className="text-xs text-brand-text-secondary leading-relaxed line-clamp-2">
          {talent.bio || talent.headline || 'Passionate artist available for auditions, commercials, and productions.'}
        </p>

        {/* Relevant Skills */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {skillsToShow.map((skill, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-semibold text-gray-600"
            >
              {skill}
            </span>
          ))}
          {remainingSkillsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-pink-50 text-[10px] font-bold text-brand-pink">
              +{remainingSkillsCount}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-gray-50 flex items-center gap-2">
          {/* View Profile Button */}
          <Link
            to={`/talent/${talent.id}`}
            className="flex-1 py-2 px-3 rounded-xl border border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 text-brand-navy text-xs font-bold text-center transition-all shadow-2xs"
          >
            View Profile
          </Link>

          {/* Save / Saved Button */}
          <button
            type="button"
            onClick={() => onToggleSave?.(talent)}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs shrink-0 ${
              isSaved
                ? 'bg-pink-50 border-brand-pink text-brand-pink'
                : 'bg-white border-gray-200 text-gray-700 hover:border-brand-pink hover:text-brand-pink'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Quick Invite Button */}
          {onInvite && (
            <button
              type="button"
              onClick={() => onInvite(talent)}
              className="p-2 rounded-xl bg-brand-pink text-white hover:bg-rose-700 transition-colors shadow-2xs"
              title="Invite to Casting Call"
              aria-label={`Invite ${talent.fullName} to audition`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentCard;
