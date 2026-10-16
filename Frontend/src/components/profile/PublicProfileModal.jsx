import React, { useState } from 'react';
import {
  X,
  MapPin,
  Heart,
  Share2,
  CheckCircle2,
  Calendar,
  Plane,
  Play,
  MoreVertical,
  Eye,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PublicProfileModal = ({ isOpen, onClose, candidate }) => {
  if (!isOpen || !candidate) return null;

  const [activeTab, setActiveTab] = useState('About');
  const [isSaved, setIsSaved] = useState(false);

  const tabs = [
    'About',
    'Photos',
    'Videos',
    'Experience',
    'Skills',
    'Credits',
    'Availability',
    'Contact',
  ];

  const headshots = candidate.portfolio?.headshots || [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
  ];

  const auditionClips = candidate.portfolio?.auditionClips || [
    {
      id: 'clip-1',
      title: 'Dramatic Scene',
      duration: '01:45',
      thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'clip-2',
      title: 'Commercial Audition',
      duration: '00:58',
      thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'clip-3',
      title: 'Monologue',
      duration: '01:20',
      thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Indicator: "Viewing As Casting Director" */}
        <div className="bg-brand-navy px-6 py-3 text-white flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Public Casting Preview Mode</span>
            <span className="hidden sm:inline text-gray-400">
              — This is how casting directors view your profile on StarCast
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
            aria-label="Exit Public Preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Hero Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white">
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
              <img
                src={candidate.avatar}
                alt={candidate.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-3.5 text-center md:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl font-bold font-serif text-gray-900">
                    {candidate.fullName}
                  </h1>
                  <span className="w-5 h-5 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  {candidate.categories?.join(' • ') || candidate.headline || 'Actor • Model'}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-gray-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {candidate.location}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {candidate.availabilityStatus || 'Available for Projects'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                {candidate.bio}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center md:justify-start gap-3 pt-1">
                <button
                  type="button"
                  className="px-6 py-2 rounded-full bg-brand-pink text-white text-xs font-bold shadow-xs hover:bg-rose-700 transition-colors"
                >
                  Contact for Casting
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-2 transition-colors ${
                    isSaved
                      ? 'border-brand-pink bg-pink-50 text-brand-pink'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-pink' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Profile'}</span>
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full border border-gray-300 text-gray-600 hover:text-gray-900 bg-white"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100 max-w-lg text-left">
                <div>
                  <p className="text-sm font-bold text-gray-900">{candidate.experienceYears || '2+'}</p>
                  <p className="text-[10px] text-gray-400">Years Experience</p>
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-sm font-bold text-gray-900">{candidate.projectsCount || '15+'}</p>
                  <p className="text-[10px] text-gray-400">Projects</p>
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-sm font-bold text-gray-900">
                    {candidate.languagesCount || candidate.languages?.length || 3}
                  </p>
                  <p className="text-[10px] text-gray-400">Languages</p>
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-sm font-bold text-gray-900">
                    {candidate.locationDisplay || candidate.city || 'Mumbai'}
                  </p>
                  <p className="text-[10px] text-gray-400">Location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-6 overflow-x-auto scrollbar-none py-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs font-semibold pb-2.5 relative transition-colors whitespace-nowrap ${
                      isActive ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Details & Specs (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: About Me & Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-serif mb-2">About Me</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {candidate.bio}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 font-serif mb-3">Details</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Age</span>
                    <span className="font-semibold text-gray-900">{candidate.age || 26} years</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Height</span>
                    <span className="font-semibold text-gray-900">{candidate.height || '165 cm'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Nationality</span>
                    <span className="font-semibold text-gray-900">{candidate.nationality || 'Indian'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Languages</span>
                    <span className="font-semibold text-gray-900">
                      {candidate.languages?.join(', ') || 'Hindi, English, Punjabi'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Appearance</span>
                    <span className="font-semibold text-gray-900">{candidate.appearance || 'Fair'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Body Type</span>
                    <span className="font-semibold text-gray-900">{candidate.bodyType || 'Slim'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Hair Color</span>
                    <span className="font-semibold text-gray-900">{candidate.hairColor || 'Black'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-400">Eye Color</span>
                    <span className="font-semibold text-gray-900">{candidate.eyeColor || 'Brown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Skills, Preferred Projects, Availability */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 font-serif mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(candidate.skills || [
                    'Acting',
                    'Modeling',
                    'Dance',
                    'Voice-over',
                    'Improvisation',
                    'Classical Dance',
                  ]).map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-brand-pink border border-pink-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 font-serif mb-3">
                  Preferred Project Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(candidate.preferredProjectTypes || [
                    'Films',
                    'OTT / Web Series',
                    'Advertisements',
                    'Music Videos',
                    'Fashion Shoots',
                    'Theatre',
                  ]).map((type, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 font-serif mb-3">Availability</h3>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-gray-900">Available for Auditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 text-gray-500" />
                    <span>Open to travel internationally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    <span>Flexible with dates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900 font-serif">Photo Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {headshots.map((url, i) => (
                <div
                  key={i}
                  className="aspect-3/4 rounded-2xl overflow-hidden shadow-2xs border border-gray-100"
                >
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Showreel */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900 font-serif">Showreel</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 relative aspect-16/9 rounded-3xl overflow-hidden shadow-xs border border-gray-100 bg-black">
                <img
                  src={candidate.portfolio?.showreel?.thumbnail || candidate.avatar}
                  alt="Showreel"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white text-brand-pink flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-brand-pink translate-x-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                  {candidate.portfolio?.showreel?.duration || '02:36'}
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-gray-800">Audition Clips</h4>
                {auditionClips.map((clip) => (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between p-2 rounded-2xl border border-gray-100 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-900">{clip.title}</h5>
                        <p className="text-[10px] text-gray-400">{clip.duration}</p>
                      </div>
                    </div>
                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileModal;
