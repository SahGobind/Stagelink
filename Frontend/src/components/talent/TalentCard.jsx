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
import { FALLBACK_TALENT_AVATAR, COUNTRY_FLAGS } from '../../data/mockTalentDirectory';

const getCategoryPillStyle = (category, isFilmStar) => {
  if (isFilmStar || category === 'Film Stars') {
    return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black';
  }
  switch (category) {
    case 'Musicians':
      return 'bg-purple-600 text-white font-bold';
    case 'Dancers':
      return 'bg-rose-500 text-white font-bold';
    case 'Graphic Designers':
      return 'bg-sky-600 text-white font-bold';
    case 'Comedians':
      return 'bg-emerald-600 text-white font-bold';
    case 'Singers':
      return 'bg-violet-600 text-white font-bold';
    case 'Actors':
    case 'Actresses':
      return 'bg-indigo-600 text-white font-bold';
    case 'Models':
      return 'bg-pink-600 text-white font-bold';
    default:
      return 'bg-white/95 text-brand-navy font-bold';
  }
};

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

  // Resolve country flag emoji
  const countryFlag =
    COUNTRY_FLAGS[talent.country] ||
    (talent.country?.toLowerCase().includes('india') ? '🇮🇳' : '') ||
    (talent.country?.toLowerCase().includes('uk') || talent.location?.toLowerCase().includes('uk') ? '🇬🇧' : '') ||
    (talent.country?.toLowerCase().includes('france') || talent.location?.toLowerCase().includes('paris') ? '🇫🇷' : '') ||
    (talent.country?.toLowerCase().includes('germany') || talent.location?.toLowerCase().includes('berlin') ? '🇩🇪' : '') ||
    (talent.country?.toLowerCase().includes('italy') || talent.location?.toLowerCase().includes('rome') ? '🇮🇹' : '') ||
    (talent.country?.toLowerCase().includes('spain') || talent.location?.toLowerCase().includes('madrid') ? '🇪🇸' : '') ||
    (talent.country?.toLowerCase().includes('ireland') || talent.location?.toLowerCase().includes('dublin') ? '🇮🇪' : '') ||
    (talent.country?.toLowerCase().includes('sweden') || talent.location?.toLowerCase().includes('stockholm') ? '🇸🇪' : '') ||
    '';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/85 hover:border-slate-300 shadow-3d-card hover:shadow-3d-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden text-left relative specular-top">
      {/* Top Image & Header */}
      <div className="relative aspect-4/3 w-full bg-neutral-900 overflow-hidden">
        <img
          src={imgSrc}
          alt={talent.fullName}
          onError={handleImageError}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-auto">
          {/* Category & Star Badges */}
          <div className="flex flex-wrap items-center gap-1.5 max-w-[80%]">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] shadow-xs backdrop-blur-md ${getCategoryPillStyle(primaryCategory, talent.isFilmStar)}`}>
              {primaryCategory}
            </span>

            {talent.isFilmStar && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold shadow-xs tracking-wider uppercase border border-amber-300">
                <Star className="w-2.5 h-2.5 fill-amber-950 text-amber-950" />
                <span>{talent.country === 'India' ? 'Indian Star' : 'Film Star'}</span>
              </span>
            )}
          </div>

          {/* Save Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave?.(talent);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-xs shrink-0 cursor-pointer hover:scale-105 active:scale-90 ${
              isSaved
                ? 'bg-brand-pink text-white shadow-3d-button-pink'
                : 'bg-white/85 text-neutral-700 hover:text-brand-pink hover:bg-white border border-white/40'
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
            <h3 className="text-base sm:text-lg font-bold font-serif text-white tracking-tight drop-shadow-sm truncate">
              {talent.fullName}
            </h3>
            {talent.verificationStatus === 'verified' && (
              <span className="shrink-0 text-brand-pink" title="StageLink Verified Artist">
                <CheckCircle2 className="w-4 h-4 fill-white text-brand-pink" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-200 mt-0.5 font-medium">
            <MapPin className="w-3 h-3 text-pink-300 shrink-0" />
            <span className="truncate flex items-center gap-1">
              {countryFlag && <span className="text-xs">{countryFlag}</span>}
              <span>{talent.city && talent.country ? `${talent.city}, ${talent.country}` : talent.location}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Availability Status Badge & Experience */}
        <div className="flex items-center justify-between text-xs gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/70 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[140px]">{talent.availabilityStatus || talent.availability || 'Available'}</span>
          </span>

          <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/70 shrink-0 shadow-inner-bevel">
            {talent.experienceYears || (talent.yearsOfExperience ? `${talent.yearsOfExperience}+ Yrs` : 'Experienced')}
          </span>
        </div>

        {/* Professional Bio */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
          {talent.bio || talent.headline || 'Passionate artist available for auditions, commercials, and productions.'}
        </p>

        {/* Relevant Skills */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {skillsToShow.map((skill, index) => (
            <span
              key={index}
              className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200/80 text-[10px] font-semibold text-slate-700 shadow-2xs"
            >
              {skill}
            </span>
          ))}
          {remainingSkillsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[10px] font-bold text-brand-pink border border-rose-200/60">
              +{remainingSkillsCount}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {/* View Profile Button */}
          <Link
            to={`/talent/${talent.id}`}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 text-neutral-900 text-xs font-bold text-center transition-all shadow-2xs hover:shadow-subtle active:translate-y-0.5"
          >
            View Profile
          </Link>

          {/* Save / Saved Button */}
          <button
            type="button"
            onClick={() => onToggleSave?.(talent)}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs active:translate-y-0.5 shrink-0 cursor-pointer ${
              isSaved
                ? 'bg-rose-50 border-brand-pink text-brand-pink shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-brand-pink hover:text-brand-pink'
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
              className="p-2 rounded-xl bg-brand-pink text-white hover:bg-brand-pink-hover transition-all shadow-3d-button-pink active:translate-y-0.5 cursor-pointer"
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
