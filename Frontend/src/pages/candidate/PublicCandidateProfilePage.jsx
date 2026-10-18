import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Mail,
  Play,
  MoreVertical,
  CheckCircle2,
  Calendar,
  Plane,
  Circle,
  Eye,
  ArrowRight,
  ShieldCheck,
  Search,
  Bell,
  X,
} from 'lucide-react';
import { getCandidateProfile, getCandidateById } from '../../data/mockCandidates';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import CandidateAccessLock from '../../components/common/CandidateAccessLock';
import { hasCompletedPostingPayment, EVENT_PAYMENT_STATE_CHANGED } from '../../utils/paymentAccess';

const PublicCandidateProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const candidate = id ? getCandidateById(id) : getCandidateProfile(user);

  const [hasPaid, setHasPaid] = useState(() => hasCompletedPostingPayment());

  React.useEffect(() => {
    const checkPayment = () => setHasPaid(hasCompletedPostingPayment());
    window.addEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
    window.addEventListener('storage', checkPayment);
    return () => {
      window.removeEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
      window.removeEventListener('storage', checkPayment);
    };
  }, []);

  const [activeTab, setActiveTab] = useState('About');
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Profile link copied to clipboard!');
    }
  };

  const handleSaveProfile = () => {
    setIsSaved(!isSaved);
    setToastMessage(!isSaved ? 'Profile saved to your talent roster!' : 'Profile removed from roster.');
  };

  const playVideo = (url, title) => {
    setSelectedVideoUrl(url || 'https://www.w3schools.com/html/mov_bbb.mp4');
    setSelectedVideoTitle(title || 'Video Playback');
    setIsVideoModalOpen(true);
  };

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

  if (!hasPaid) {
    return (
      <div className="min-h-screen bg-white text-left font-sans pb-24">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-brand-pink fill-brand-pink" />
              <span className="text-xl font-bold font-serif text-gray-900 tracking-tight">StageLink</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/opportunities" className="text-xs font-semibold text-gray-600 hover:text-black">
                Casting Calls
              </Link>
              <Link to="/post-job" className="px-4 py-2 bg-brand-pink text-white rounded-xl text-xs font-bold">
                Announce Work
              </Link>
            </div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <CandidateAccessLock
            title="Public Candidate Profile is Locked"
            subtitle="To view public talent profiles, portfolios, and contact details, please announce work and complete payment via JuicePay or PayPal."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-left font-sans pb-24">
      {/* Public Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-brand-pink fill-brand-pink" />
            <span className="text-xl font-bold font-serif text-gray-900 tracking-tight">
              StageLink
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-gray-600">
            <Link to="/opportunities" className="hover:text-gray-900 transition-colors">
              Casting Calls
            </Link>
            <Link to="/candidate/profile" className="text-gray-900 font-bold">
              Discover Talent
            </Link>
            <Link to="/how-it-works" className="hover:text-gray-900 transition-colors">
              How It Works
            </Link>
            <Link to="/about" className="hover:text-gray-900 transition-colors">
              About
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl transition-colors"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-gray-900 rounded-xl relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-pink rounded-full" />
            </button>
            <Link to="/candidate/profile" className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-2xs">
              <img src={candidate.avatar} alt="User" className="w-full h-full object-cover" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Profile Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Candidate Hero Card */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-white">
          {/* Large Rounded Photo */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-sm border border-gray-100 shrink-0">
            <img
              src={candidate.avatar}
              alt={candidate.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 tracking-tight">
                  {candidate.fullName}
                </h1>
                <span className="w-5 h-5 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {candidate.categories?.join(' • ') || candidate.headline || 'Actor • Model'}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {candidate.location}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  {candidate.availabilityStatus || 'Available for Projects'}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl font-normal">
              {candidate.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="px-6 py-2.5 rounded-full bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Contact for Casting
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className={`px-5 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition-colors ${
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
                onClick={handleShare}
                className="p-2.5 rounded-full border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 bg-white transition-colors"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 max-w-xl text-left">
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {candidate.experienceYears || '2+'}
                </p>
                <p className="text-[11px] text-gray-400">Years Experience</p>
              </div>
              <div className="border-l border-gray-100 pl-3 sm:pl-4">
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {candidate.projectsCount || '15+'}
                </p>
                <p className="text-[11px] text-gray-400">Projects</p>
              </div>
              <div className="border-l border-gray-100 pl-3 sm:pl-4">
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {candidate.languagesCount || candidate.languages?.length || 3}
                </p>
                <p className="text-[11px] text-gray-400">Languages</p>
              </div>
              <div className="border-l border-gray-100 pl-3 sm:pl-4">
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {candidate.locationDisplay || candidate.city || 'Mumbai'}
                </p>
                <p className="text-[11px] text-gray-400">Location</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 overflow-x-auto scrollbar-none py-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs sm:text-sm font-semibold pb-3 relative transition-colors whitespace-nowrap ${
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

        {/* Content Section: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: About Me & Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif mb-2">About Me</h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                {candidate.bio}
              </p>
            </div>

            {/* Details Table */}
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif mb-3">Details</h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Age</span>
                  <span className="font-semibold text-gray-900">{candidate.age || 26} years</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Height</span>
                  <span className="font-semibold text-gray-900">{candidate.height || '165 cm'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Nationality</span>
                  <span className="font-semibold text-gray-900">{candidate.nationality || 'Indian'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Languages</span>
                  <span className="font-semibold text-gray-900">
                    {candidate.languages?.join(', ') || 'Hindi, English, Punjabi'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Appearance</span>
                  <span className="font-semibold text-gray-900">{candidate.appearance || 'Fair'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Body Type</span>
                  <span className="font-semibold text-gray-900">{candidate.bodyType || 'Slim'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Hair Color</span>
                  <span className="font-semibold text-gray-900">{candidate.hairColor || 'Black'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-400">Eye Color</span>
                  <span className="font-semibold text-gray-900">{candidate.eyeColor || 'Brown'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Skills, Preferred Project Types, Availability */}
          <div className="space-y-6">
            {/* Skills */}
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif mb-3">Skills</h2>
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
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-pink-50 text-brand-pink border border-pink-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Project Types */}
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif mb-3">
                Preferred Project Types
              </h2>
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
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className="text-base font-bold text-gray-900 font-serif mb-3">Availability</h2>
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-gray-900">Available for Auditions</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Plane className="w-3.5 h-3.5 text-gray-500" />
                  <span>Open to travel internationally</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>Flexible with dates</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery Section */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 font-serif">Photo Gallery</h2>
            <button
              type="button"
              onClick={() => setActiveTab('Photos')}
              className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1"
            >
              <span>View All Photos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {headshots.map((photoUrl, idx) => (
              <div
                key={idx}
                onClick={() => setLightboxImage(photoUrl)}
                className="aspect-3/4 rounded-2xl overflow-hidden shadow-2xs border border-gray-100 cursor-pointer group relative"
              >
                <img
                  src={photoUrl}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-5 h-5 drop-shadow" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Showreel Section */}
        <div className="space-y-4 pt-4">
          <h2 className="text-base font-bold text-gray-900 font-serif">Showreel</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Main Video Thumbnail Player */}
            <div
              onClick={() => playVideo(candidate.portfolio?.showreel?.url, 'Aanya Sharma - Showreel')}
              className="md:col-span-2 relative aspect-16/9 rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group bg-black"
            >
              <img
                src={candidate.portfolio?.showreel?.thumbnail || candidate.avatar}
                alt="Showreel Thumbnail"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 opacity-90"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 text-brand-pink flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-brand-pink translate-x-0.5" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                {candidate.portfolio?.showreel?.duration || '02:36'}
              </div>
            </div>

            {/* Audition Clips List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-800">Audition Clips</h3>
              <div className="space-y-2.5">
                {auditionClips.map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => playVideo('', clip.title)}
                    className="flex items-center justify-between p-2 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/80 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                        <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-3.5 h-3.5 text-white fill-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-pink transition-colors">
                          {clip.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">{clip.duration}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setToastMessage(`Options for ${clip.title}`);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Video Modal Player */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="bg-black rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-3 bg-gray-900 text-white text-xs">
              <span className="font-bold">{selectedVideoTitle}</span>
              <button onClick={() => setIsVideoModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            </div>
            <div className="aspect-16/9 bg-black">
              <video
                src={selectedVideoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img src={lightboxImage} alt="Enlarged" className="w-full h-full object-contain" />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Contact for Casting Modal */}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Contact {candidate.fullName}
              </h3>
              <button onClick={() => setIsContactModalOpen(false)}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Send a direct audition invite or casting opportunity slate to {candidate.fullName}.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsContactModalOpen(false);
                setToastMessage('Casting invitation dispatched via StageLink portal!');
              }}
              className="space-y-3 pt-1 text-left"
            >
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Untitled Mumbai Feature"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Character / Role Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Role details, audition sides, filming dates..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Send Audition Slate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default PublicCandidateProfilePage;
