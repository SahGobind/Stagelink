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
  Eye,
  ArrowRight,
  ShieldCheck,
  Download,
  Mail,
  Phone,
  Sparkles,
  FileText,
  Send,
  Camera,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';

const MOCK_EXTENDED_HEADSHOTS = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    title: 'Primary Studio Headshot',
    category: 'Headshots',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    title: 'Commercial Smile & Casual Look',
    category: 'Commercial',
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    title: 'High-Fashion Editorial Portrait',
    category: 'Editorial',
  },
  {
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    title: 'Dramatic Character Expression',
    category: 'Character',
  },
  {
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    title: 'Full-Length Casting Profile',
    category: 'Full-Length',
  },
  {
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    title: 'Classical Indian Traditional Look',
    category: 'Character',
  },
];

const MOCK_VIDEOS = [
  {
    id: 'vid-showreel',
    title: 'Official Acting Showreel (2025/2026)',
    duration: '02:36',
    category: 'Showreel',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Lead scenes from Mumbai Diaries (OTT), emotional confrontation, and commercial brand deliveries.',
  },
  {
    id: 'vid-clip-1',
    title: 'Dramatic Monologue - Emotional Confrontation',
    duration: '01:45',
    category: 'Drama',
    thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Intense two-minute monologue performed in Hindi & English, exploring grief and betrayal.',
  },
  {
    id: 'vid-clip-2',
    title: 'Commercial Audition - Lifestyle & Festive Campaign',
    duration: '00:58',
    category: 'Commercial',
    thumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'High-energy brand conversation delivering lifestyle dialogue and product showcase.',
  },
  {
    id: 'vid-clip-3',
    title: 'Contemporary Monologue - Urban Independent Feature',
    duration: '01:20',
    category: 'Monologue',
    thumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Subtle, nuanced character study written for modern cinema audition circuits.',
  },
];

const MOCK_EXPERIENCE = [
  {
    id: 'exp-1',
    role: 'Lead - Riya',
    project: 'Mumbai Diaries (OTT Series)',
    type: 'OTT / Web Series',
    director: 'Karan Mehra',
    year: '2025',
    description: 'Lead protagonist across 8 episodes in high-intensity drama series set in contemporary Mumbai.',
  },
  {
    id: 'exp-2',
    role: 'Principal Brand Model',
    project: 'FabIndia Festive Campaign',
    type: 'Commercials',
    director: 'Visual Edge Productions',
    year: '2025',
    description: 'Nationwide television commercial, digital hoardings, and multi-city print campaigns.',
  },
  {
    id: 'exp-3',
    role: 'Supporting Role - Aisha',
    project: 'Echoes of the Monsoon',
    type: 'Films',
    director: 'Ananya Roy',
    year: '2024',
    description: 'Independent feature premiered at Mumbai Film Festival; critically acclaimed performance.',
  },
  {
    id: 'exp-4',
    role: 'Lead - Meera',
    project: 'The Dark Room (Stage Play)',
    type: 'Theatre',
    director: 'Prithvi Theatre Ensemble',
    year: '2023',
    description: 'Full-length Hindi drama staged across 18 sold-out performances at Prithvi Theatre, Mumbai.',
  },
];

const MOCK_CREDITS = [
  {
    category: 'Films & OTT Series',
    items: [
      { title: 'Mumbai Diaries', role: 'Lead (Riya)', year: '2025', banner: 'Premier OTT Streamer' },
      { title: 'Echoes of the Monsoon', role: 'Supporting (Aisha)', year: '2024', banner: 'Film Festival / Theatrical' },
      { title: 'Shadows in the Mist', role: 'Cameo / Performer', year: '2023', banner: 'Short Film Showcase' },
    ],
  },
  {
    category: 'Commercials & Endorsements',
    items: [
      { title: 'FabIndia Festive Lookbook', role: 'Principal Brand Model', year: '2025', banner: 'TVC & Digital Campaign' },
      { title: 'Tanishq Heritage Collection', role: 'Featured Model', year: '2024', banner: 'Print & Digital Billboard' },
      { title: 'Tata Motors Smart Drive', role: 'Lead in TV Commercial', year: '2023', banner: 'National TV Broadcast' },
    ],
  },
  {
    category: 'Theatre & Stage Productions',
    items: [
      { title: 'The Dark Room', role: 'Lead (Meera)', year: '2023', banner: 'Prithvi Theatre (18 Shows)' },
      { title: 'Court Martial (Adapted)', role: 'Ensemble Cast', year: '2022', banner: 'NCPA Experimental Stage' },
    ],
  },
  {
    category: 'Awards & Accolades',
    items: [
      { title: 'Best Emerging Performer (Nominee)', role: 'Echoes of the Monsoon', year: '2024', banner: 'Mumbai Indie Film Awards' },
      { title: 'Screen Acting Distinction', role: 'Diploma Graduate', year: '2021', banner: 'Whistling Woods International' },
    ],
  },
];

const PublicProfileModal = ({ isOpen, onClose, candidate }) => {
  const [activeTab, setActiveTab] = useState('About');
  const [isSaved, setIsSaved] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [photoFilter, setPhotoFilter] = useState('All');
  const [contactSent, setContactSent] = useState(false);

  if (!isOpen || !candidate) return null;

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

  const rawHeadshots = candidate.portfolio?.headshots || [];
  const headshotsList = rawHeadshots.length > 0
    ? rawHeadshots.map((url, i) => ({
        url,
        title: i === 0 ? 'Primary Headshot' : `Lookbook Photo #${i + 1}`,
        category: i === 0 ? 'Headshots' : i % 2 === 0 ? 'Editorial' : 'Character',
      }))
    : MOCK_EXTENDED_HEADSHOTS;

  const filteredPhotos = photoFilter === 'All'
    ? headshotsList
    : headshotsList.filter((p) => p.category === photoFilter);

  const videosList = candidate.portfolio?.auditionClips && candidate.portfolio?.auditionClips.length > 0
    ? [
        {
          id: 'showreel-main',
          title: candidate.portfolio.showreel?.title || 'Official Acting Showreel',
          duration: candidate.portfolio.showreel?.duration || '02:36',
          category: 'Showreel',
          thumbnail: candidate.portfolio.showreel?.thumbnail || candidate.avatar,
          url: candidate.portfolio.showreel?.url || 'https://www.w3schools.com/html/mov_bbb.mp4',
          description: 'Official compilation of lead performances and dialogue delivery.',
        },
        ...candidate.portfolio.auditionClips.map((c) => ({
          ...c,
          category: c.title.includes('Commercial') ? 'Commercial' : 'Drama',
          url: c.url || 'https://www.w3schools.com/html/mov_bbb.mp4',
        })),
      ]
    : MOCK_VIDEOS;

  const experienceList = candidate.experience && candidate.experience.length > 0
    ? candidate.experience
    : MOCK_EXPERIENCE;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200 text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Indicator */}
        <div className="bg-neutral-900 px-6 py-3 text-white flex items-center justify-between text-xs shrink-0 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Public Casting Lookbook Preview</span>
            <span className="hidden sm:inline text-neutral-400">
              — Displayed to verified casting directors and studio scouts
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
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Hero Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
              <img
                src={candidate.avatar}
                alt={candidate.fullName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900">
                      {candidate.fullName}
                    </h2>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                  </div>
                  <p className="text-xs text-brand-pink font-semibold">
                    {candidate.headline || 'Actor • Model'}
                  </p>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-center md:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{candidate.availabilityStatus || 'Available for Projects'}</span>
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed max-w-2xl font-normal">
                {candidate.bio}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('Contact')}
                  className="px-5 py-2 rounded-full bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Contact for Casting
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`px-4 py-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isSaved
                      ? 'border-brand-pink bg-pink-50 text-brand-pink'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-pink' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save to Roster'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert('Profile link copied to clipboard!');
                  }}
                  className="p-2 rounded-full border border-gray-300 text-gray-600 hover:text-gray-900 bg-white"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100 max-w-md text-left">
                <div>
                  <p className="text-sm sm:text-base font-bold text-gray-900">{candidate.experienceYears || '2+'}</p>
                  <p className="text-[10px] text-gray-400">Experience</p>
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-sm sm:text-base font-bold text-gray-900">{candidate.projectsCount || '15+'}</p>
                  <p className="text-[10px] text-gray-400">Projects</p>
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-sm sm:text-base font-bold text-gray-900">{candidate.languages?.length || 3}</p>
                  <p className="text-[10px] text-gray-400">Languages</p>
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-sm sm:text-base font-bold text-gray-900">{candidate.city || 'Mumbai'}</p>
                  <p className="text-[10px] text-gray-400">Location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 sticky top-0 bg-white z-10 py-1">
            <nav className="flex space-x-6 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs font-semibold pb-2.5 relative transition-colors whitespace-nowrap cursor-pointer ${
                      isActive ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full shadow-xs" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ================= TAB 1: ABOUT ================= */}
          {activeTab === 'About' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-150">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-serif mb-2">About Me</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {candidate.bio}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-serif mb-3">Physical Specifications</h3>
                  <div className="space-y-1.5 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Playing Age</span>
                      <span className="font-semibold text-gray-900">{candidate.age || 26} years</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Height</span>
                      <span className="font-semibold text-gray-900">{candidate.height || '165 cm'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Nationality</span>
                      <span className="font-semibold text-gray-900">{candidate.nationality || 'Indian'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Languages</span>
                      <span className="font-semibold text-gray-900">{candidate.languages?.join(', ') || 'Hindi, English'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-200">
                      <span className="text-gray-500">Appearance</span>
                      <span className="font-semibold text-gray-900">{candidate.appearance || 'Fair'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Body Type</span>
                      <span className="font-semibold text-gray-900">{candidate.bodyType || 'Slim'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 font-serif mb-3">Drama Education</h3>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
                    <p className="font-bold text-gray-900">Whistling Woods International, Mumbai</p>
                    <p className="text-brand-pink font-semibold">Diploma in Screen Acting</p>
                    <p className="text-gray-500 text-[11px]">Specialization in camera acting, diction & classical method.</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">Lookbook Preview</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('Photos')}
                      className="text-brand-pink font-bold hover:underline"
                    >
                      View all ({headshotsList.length}) →
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {headshotsList.slice(0, 4).map((h, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-200">
                        <img src={h.url} alt="lookbook" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: PHOTOS ================= */}
          {activeTab === 'Photos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 font-serif">
                  High-Resolution Lookbook ({filteredPhotos.length})
                </h3>
                <div className="flex gap-1.5">
                  {['All', 'Headshots', 'Editorial', 'Character'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPhotoFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        photoFilter === cat
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {filteredPhotos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setLightboxImage(photo.url);
                      setLightboxIndex(i);
                    }}
                    className="aspect-3/4 rounded-2xl overflow-hidden shadow-2xs border border-gray-100 cursor-pointer group relative bg-gray-100"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-5 h-5 drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: VIDEOS ================= */}
          {activeTab === 'Videos' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-sm font-bold text-gray-900 font-serif">Acting Reels & Monologues</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {videosList.map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedVideo(clip)}
                    className="p-3 rounded-2xl border border-gray-200 bg-white hover:border-black cursor-pointer group space-y-2"
                  >
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-black">
                      <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover opacity-85" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-white text-brand-pink flex items-center justify-center shadow">
                          <Play className="w-4 h-4 fill-brand-pink translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-[9px] font-bold">
                        {clip.duration}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-brand-pink uppercase">{clip.category}</span>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-pink transition-colors truncate">
                        {clip.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: EXPERIENCE ================= */}
          {activeTab === 'Experience' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <h3 className="text-sm font-bold text-gray-900 font-serif">
                Acting & Screen Production Timeline
              </h3>

              <div className="space-y-3">
                {experienceList.map((exp, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {exp.role} <span className="text-gray-500 font-normal">in</span> {exp.project}
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-pink-50 text-brand-pink font-bold text-[10px]">
                        {exp.type} • {exp.year}
                      </span>
                    </div>
                    <p className="text-gray-500">Directed by {exp.director}</p>
                    <p className="text-gray-600 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: SKILLS ================= */}
          {activeTab === 'Skills' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <h3 className="text-sm font-bold text-gray-900 font-serif">Artistic Skills & Languages</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <h4 className="font-bold text-gray-900">Acting & Screen Performance</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Screen Acting', 'Method Acting', 'Improvisation', 'Monologue Delivery', 'Stage Combat'].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <h4 className="font-bold text-gray-900">Dance & Movement</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Classical Kathak', 'Bollywood Contemporary', 'Jazz', 'Physical Theatre'].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <h4 className="font-bold text-gray-900">Voice, Accents & Diction</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Voice-over', 'Hindi Diction', 'English Narration', 'Dubbing & ADR'].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <h4 className="font-bold text-gray-900">Languages & Fluency</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['Hindi (Native)', 'English (Fluent Neutral)', 'Punjabi (Conversational)'].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: CREDITS ================= */}
          {activeTab === 'Credits' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <h3 className="text-sm font-bold text-gray-900 font-serif">Filmography & Major Endorsements</h3>

              <div className="space-y-3">
                {MOCK_CREDITS.map((sec, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2">
                    <h4 className="font-bold text-brand-navy uppercase tracking-wider text-[11px]">{sec.category}</h4>
                    <div className="divide-y divide-gray-100">
                      {sec.items.map((it, idx) => (
                        <div key={idx} className="py-1.5 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-gray-900">{it.title}</span>
                            <span className="text-brand-pink font-semibold ml-2">({it.role})</span>
                          </div>
                          <span className="text-gray-400 font-medium">{it.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 7: AVAILABILITY ================= */}
          {activeTab === 'Availability' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <h3 className="text-sm font-bold text-gray-900 font-serif">Casting Status & Logistics</h3>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm">{candidate.availabilityStatus || 'Available for Auditions & Shoots'}</span>
                </div>
                <p className="text-emerald-800 text-[11px]">
                  Open for immediate callback appointments, script sides, and shoot schedules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Plane className="w-4 h-4 text-brand-pink" />
                    <span>Travel Readiness</span>
                  </h4>
                  <p className="text-gray-600">{candidate.travelStatus || 'Worldwide / Passport Ready'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-pink" />
                    <span>Union Guild Status</span>
                  </h4>
                  <p className="text-gray-600">{candidate.unionStatus || 'CINTAA Registered (India)'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 8: CONTACT ================= */}
          {activeTab === 'Contact' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-xs">
              <h3 className="text-sm font-bold text-gray-900 font-serif">Contact {candidate.fullName}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setContactSent(true);
                  }}
                  className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3"
                >
                  <h4 className="font-bold text-gray-900">Direct Audition Invitation</h4>
                  <input
                    type="text"
                    placeholder="Your Studio / Agency Name"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
                  />
                  <textarea
                    rows={3}
                    placeholder="Write your casting message, character role, and audition instructions..."
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-brand-pink hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    {contactSent ? 'Inquiry Dispatched!' : 'Send Audition Sides'}
                  </button>
                </form>

                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-900">Verified Contact Details</h4>
                  <div className="space-y-2 text-gray-600">
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-pink" />
                      <span>{candidate.contactEmail || candidate.email || 'aanya.sharma@example.com'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-pink" />
                      <span>{candidate.phone || '+91 98201 23456'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-pink" />
                      <span>{candidate.location || 'Mumbai, India'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <div className="bg-black rounded-3xl overflow-hidden max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 bg-neutral-900 text-white text-xs">
              <span className="font-bold truncate">{selectedVideo.title}</span>
              <button onClick={() => setSelectedVideo(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-16/9">
              <video src={selectedVideo.url} controls autoPlay className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="Enlarged" className="w-full h-full object-contain rounded-2xl" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfileModal;
