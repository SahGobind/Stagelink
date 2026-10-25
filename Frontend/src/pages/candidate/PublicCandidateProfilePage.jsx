import React, { useState, useEffect } from 'react';
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
  Eye,
  ArrowRight,
  ShieldCheck,
  X,
  Lock,
  Download,
  Camera,
  Video,
  Briefcase,
  Award,
  Sparkles,
  Clock,
  Globe,
  Phone,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  Check,
  AlertCircle,
  ExternalLink,
  Send,
  Tag,
  Sliders,
} from 'lucide-react';
import { getCandidateProfile, getCandidateById, saveCandidateProfile } from '../../data/mockCandidates';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';
import CandidateAccessLock from '../../components/common/CandidateAccessLock';
import InviteToCastingModal from '../../components/talent/InviteToCastingModal';
import { talentService, EVENT_SAVED_TALENT_CHANGED } from '../../services/talentService';
import { FALLBACK_TALENT_AVATAR } from '../../data/mockTalentDirectory';
import { hasCompletedPostingPayment, EVENT_PAYMENT_STATE_CHANGED } from '../../utils/paymentAccess';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProductionFeedbackCard from '../../components/feedback/ProductionFeedbackCard';
import { feedbackService } from '../../services/feedbackService';

const InstagramIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

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
  {
    id: 'vid-clip-4',
    title: 'Performer Introduction & Slate Tape',
    duration: '00:45',
    category: 'Introduction',
    thumbnail: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    description: 'Full profile slate with direct-to-camera introduction, profile turns, and availability notes.',
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
    description: 'Independent feature premiered at Mumbai Film Festival; earned rave reviews for grounded emotional depth.',
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
      { title: 'Mumbai Diaries', role: 'Lead (Riya)', year: '2025', banner: 'Premier OTT Streamer', director: 'Karan Mehra' },
      { title: 'Echoes of the Monsoon', role: 'Supporting (Aisha)', year: '2024', banner: 'Indie Feature / Festivals', director: 'Ananya Roy' },
      { title: 'Shadows in the Mist', role: 'Cameo / Performer', year: '2023', banner: 'Short Film Showcase', director: 'Vikram Joshi' },
    ],
  },
  {
    category: 'Commercials & Endorsements',
    items: [
      { title: 'FabIndia Festive Lookbook', role: 'Principal Brand Model', year: '2025', banner: 'TVC & Digital Campaign', director: 'Visual Edge' },
      { title: 'Tanishq Heritage Collection', role: 'Featured Model', year: '2024', banner: 'Print & Digital Billboard', director: 'Studio 9' },
      { title: 'Tata Motors Smart Drive', role: 'Lead in TV Commercial', year: '2023', banner: 'National TV Broadcast', director: 'Horizon Films' },
    ],
  },
  {
    category: 'Theatre & Stage Productions',
    items: [
      { title: 'The Dark Room', role: 'Lead (Meera)', year: '2023', banner: 'Prithvi Theatre (18 Shows)', director: 'Prithvi Theatre Ensemble' },
      { title: 'Court Martial (Adapted)', role: 'Ensemble Cast', year: '2022', banner: 'NCPA Experimental Stage', director: 'Whistling Woods' },
    ],
  },
  {
    category: 'Honors & Recognitions',
    items: [
      { title: 'Best Emerging Performer (Nominee)', role: 'Echoes of the Monsoon', year: '2024', banner: 'Mumbai Indie Film Awards', director: 'MIFF Jury' },
      { title: 'Outstanding Screen Acting Diploma', role: 'Academic Distinction', year: '2021', banner: 'Whistling Woods International', director: 'Dean Faculty' },
    ],
  },
];

const MOCK_SKILLS_CATEGORIZED = {
  acting: [
    'Screen Acting',
    'Method Acting',
    'Improvisation',
    'Monologue Delivery',
    'Dialogue Delivery',
    'Classical Stage Acting',
    'Camera Stunts Basics',
  ],
  modeling: [
    'Commercial Print',
    'Fashion Editorial',
    'Ramp Walk',
    'Lookbook Modeling',
    'E-commerce Posing',
  ],
  dance: [
    'Classical Dance (Kathak)',
    'Bollywood Contemporary',
    'Freestyle / Jazz',
    'Semi-Classical',
  ],
  voiceActing: [
    'Voice-over & Narration',
    'Hindi Diction (Neutral & UP)',
    'English Narration (Global Accent)',
    'Dubbing & ADR',
    'Character Voices',
  ],
  languages: [
    { name: 'Hindi', level: 'Native / Fluent' },
    { name: 'English', level: 'Fluent (Neutral Global Accent)' },
    { name: 'Punjabi', level: 'Conversational' },
  ],
};

const PublicCandidateProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [candidate, setCandidate] = useState(() => (id ? getCandidateById(id) : getCandidateProfile(user)));
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [hasPaid, setHasPaid] = useState(() => hasCompletedPostingPayment());

  // Tabs: 'About' | 'Photos' | 'Videos' | 'Experience' | 'Skills' | 'Credits' | 'Availability' | 'Contact'
  const [activeTab, setActiveTab] = useState('About');
  const [isSaved, setIsSaved] = useState(() => talentService.isTalentSaved(candidate?.id));
  const [studioReviews, setStudioReviews] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Video modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('');

  // Lightbox modal with next/prev index
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Invite modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Photos tab filter
  const [photoFilter, setPhotoFilter] = useState('All');

  // Experience tab filter
  const [experienceFilter, setExperienceFilter] = useState('All');

  // Add Photo Modal (for profile owner)
  const [isAddPhotoModalOpen, setIsAddPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Headshots');

  // Contact Form state (in Contact Tab)
  const [contactSenderName, setContactSenderName] = useState(user?.companyName || user?.fullName || '');
  const [contactSenderEmail, setContactSenderEmail] = useState(user?.email || '');
  const [contactProjectType, setContactProjectType] = useState('Feature Films');
  const [contactSubject, setContactSubject] = useState('Audition Callback Invitation');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);

  // Check if current user is owner of this profile
  const isOwner = user?.id === candidate?.id || (!id && user?.role === 'candidate');

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setIsLoading(true);
      talentService
        .fetchTalentById(id)
        .then((data) => {
          if (isMounted && data) {
            setCandidate(data);
          }
        })
        .catch((err) => console.warn('Failed to fetch candidate profile by ID:', err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setCandidate(getCandidateProfile(user));
      setIsLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [id, user]);

  useEffect(() => {
    const checkPayment = () => setHasPaid(hasCompletedPostingPayment());
    window.addEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
    window.addEventListener('storage', checkPayment);
    return () => {
      window.removeEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
      window.removeEventListener('storage', checkPayment);
    };
  }, []);

  useEffect(() => {
    if (candidate?.id) {
      setIsSaved(talentService.isTalentSaved(candidate.id));
      feedbackService.getCandidateProductionReviews(candidate.id).then((res) => {
        if (res && res.reviews) {
          setStudioReviews(res.reviews);
        }
      });
    }
    const handleSavedChanged = () => {
      if (candidate?.id) {
        setIsSaved(talentService.isTalentSaved(candidate.id));
      }
    };
    window.addEventListener(EVENT_SAVED_TALENT_CHANGED, handleSavedChanged);
    window.addEventListener('storage', handleSavedChanged);
    return () => {
      window.removeEventListener(EVENT_SAVED_TALENT_CHANGED, handleSavedChanged);
      window.removeEventListener('storage', handleSavedChanged);
    };
  }, [candidate?.id]);

  const tabs = [
    'About',
    'Photos',
    'Videos',
    'Experience',
    'Skills',
    'Credits',
    'Reviews & Ratings',
    'Availability',
    'Contact',
  ];

  // Headshots list
  const rawHeadshots = candidate?.portfolio?.headshots || [];
  const headshotsList = rawHeadshots.length > 0
    ? rawHeadshots.map((url, idx) => ({
        url,
        title: idx === 0 ? 'Primary Studio Headshot' : `Lookbook Shot #${idx + 1}`,
        category: idx === 0 ? 'Headshots' : idx % 2 === 0 ? 'Editorial' : 'Character',
      }))
    : MOCK_EXTENDED_HEADSHOTS;

  const filteredPhotos = photoFilter === 'All'
    ? headshotsList
    : headshotsList.filter((p) => p.category === photoFilter);

  // Videos list
  const videosList = candidate?.portfolio?.auditionClips && candidate?.portfolio?.auditionClips.length > 0
    ? [
        {
          id: 'showreel-main',
          title: candidate.portfolio.showreel?.title || `${candidate.fullName} - Official Acting Reel`,
          duration: candidate.portfolio.showreel?.duration || '02:36',
          category: 'Showreel',
          thumbnail: candidate.portfolio.showreel?.thumbnail || candidate.avatar,
          url: candidate.portfolio.showreel?.url || 'https://www.w3schools.com/html/mov_bbb.mp4',
          description: 'Official compilation of lead performances, dramatic scenes, and dialogue delivery.',
        },
        ...candidate.portfolio.auditionClips.map((clip) => ({
          ...clip,
          category: clip.title.includes('Commercial') ? 'Commercial' : 'Drama',
          url: clip.url || 'https://www.w3schools.com/html/mov_bbb.mp4',
          description: clip.description || 'Verified audition tape recorded for casting director evaluation.',
        })),
      ]
    : MOCK_VIDEOS;

  // Experience list
  const experienceList = candidate?.experience && candidate.experience.length > 0
    ? candidate.experience
    : MOCK_EXPERIENCE;

  const filteredExperience = experienceFilter === 'All'
    ? experienceList
    : experienceList.filter((exp) => exp.type?.toLowerCase().includes(experienceFilter.toLowerCase()));

  // Skills list
  const skillsList = candidate?.skills || [
    'Acting',
    'Modeling',
    'Dance',
    'Voice-over',
    'Improvisation',
    'Classical Dance',
  ];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Profile link copied to clipboard!');
      setToastType('success');
    }
  };

  const handleSaveProfile = () => {
    const nextSaved = talentService.toggleSaveTalent(candidate);
    setIsSaved(nextSaved);
    setToastMessage(
      nextSaved
        ? `${candidate.fullName} saved to your talent roster!`
        : `${candidate.fullName} removed from roster.`
    );
    setToastType('success');
  };

  const playVideo = (url, title) => {
    setSelectedVideoUrl(url || 'https://www.w3schools.com/html/mov_bbb.mp4');
    setSelectedVideoTitle(title || `${candidate?.fullName || 'Talent'} - Video Reel`);
    setIsVideoModalOpen(true);
  };

  const openLightbox = (url, index = 0) => {
    setLightboxImage(url);
    setLightboxIndex(index);
  };

  const nextLightboxImage = (e) => {
    e?.stopPropagation();
    const nextIdx = (lightboxIndex + 1) % filteredPhotos.length;
    setLightboxIndex(nextIdx);
    setLightboxImage(filteredPhotos[nextIdx].url);
  };

  const prevLightboxImage = (e) => {
    e?.stopPropagation();
    const prevIdx = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setLightboxIndex(prevIdx);
    setLightboxImage(filteredPhotos[prevIdx].url);
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const currentHeadshots = candidate?.portfolio?.headshots || [];
    const updated = [newPhotoUrl.trim(), ...currentHeadshots];

    const saved = saveCandidateProfile(
      {
        portfolio: {
          ...candidate?.portfolio,
          headshots: updated,
        },
      },
      user
    );
    setCandidate(saved);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setIsAddPhotoModalOpen(false);
    setToastMessage('New photo added to your lookbook!');
    setToastType('success');
  };

  const handleSendContact = (e) => {
    e.preventDefault();
    if (!contactMessage.trim()) {
      setToastMessage('Please write a message to the candidate.');
      setToastType('error');
      return;
    }

    setIsSendingContact(true);
    setTimeout(() => {
      setIsSendingContact(false);
      setContactMessage('');
      setToastMessage(
        `Casting inquiry dispatched directly to ${candidate.fullName}! They will receive an email & in-app alert.`
      );
      setToastType('success');
    }, 800);
  };

  if (isLoading && !candidate) {
    return <LoadingSpinner message="Loading candidate profile..." className="min-h-[60vh]" />;
  }

  if (!candidate) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold font-serif text-gray-900">Candidate Not Found</h2>
        <p className="text-xs text-gray-500 mt-2">
          The candidate profile you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/discover-talent"
          className="mt-4 px-4 py-2 rounded-xl bg-brand-pink text-white text-xs font-bold"
        >
          Back to Discover Talent
        </Link>
      </div>
    );
  }

  // Publication gate: Draft profiles remain hidden except to owner and admin
  if (candidate.isPublished === false && user?.id !== candidate.id && user?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-card text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="text-xl font-bold font-serif text-brand-navy">Profile in Draft</h2>
          <p className="text-xs text-brand-text-secondary leading-relaxed">
            This performer profile is currently unpublished or undergoing editorial review before going live.
          </p>
          <div className="pt-2">
            <Link
              to="/discover-talent"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-colors"
            >
              <span>Explore Verified Talent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-gray-900 text-left">
      {/* Recruiter / Production Company Gate Banner */}
      {user?.role === 'recruiter' && !hasPaid && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <CandidateAccessLock
            title="Unlock Direct Performer Contact & Audition Sides"
            description="Subscribe or complete job posting payment to view full unmasked phone numbers, direct email, and dispatch callback scripts."
          />
        </div>
      )}

      {/* Owner Notice Bar */}
      {isOwner && (
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white px-4 py-2.5 text-xs">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              <span>
                <strong>Performer Preview Mode:</strong> You are viewing your public lookbook exactly as verified casting directors see it.
              </span>
            </div>
            <Link
              to="/candidate/profile/edit"
              className="text-[11px] font-bold text-brand-gold hover:underline flex items-center gap-1"
            >
              <span>Edit Details in Setup</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 relative z-10 space-y-6">
        {/* Top Breadcrumb Navigation */}
        <div className="flex items-center justify-between pb-1">
          <Link
            to="/talent"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Discover Talent</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
            <span>StageLink</span>
            <span>/</span>
            <span>Talent</span>
            <span>/</span>
            <span className="text-neutral-700 font-medium">{candidate.fullName}</span>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-3d-card specular-top">
          {/* Avatar */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-3d-card ring-1 ring-slate-200 bg-white shrink-0 group">
            <img
              src={candidate.avatar || FALLBACK_TALENT_AVATAR}
              alt={candidate.fullName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_TALENT_AVATAR;
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isOwner && (
              <button
                type="button"
                onClick={() => navigate('/candidate/settings')}
                title="Change Avatar in Settings"
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] font-bold"
              >
                Change
              </button>
            )}
          </div>

          {/* Profile Name & Primary Attributes */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
                    {candidate.fullName}
                  </h1>
                  <span title="Verified Performer">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {candidate.headline || (candidate.categories && candidate.categories.join(' • ')) || 'Performer Artist'}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-center md:justify-end gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{candidate.availabilityStatus || 'Available for Projects'}</span>
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
              {candidate.bio}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'Contact') {
                    setIsContactModalOpen(true);
                  } else {
                    setActiveTab('Contact');
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-3d-button-pink hover:shadow-3d-card-hover active:translate-y-0.5 specular-top transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact for Casting</span>
              </button>

              <button
                type="button"
                onClick={handleSaveProfile}
                className={`px-5 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-2 shadow-3d-subtle hover:shadow-3d-card active:translate-y-0.5 transition-all cursor-pointer ${
                  isSaved
                    ? 'border-brand-pink bg-pink-50 text-brand-pink'
                    : 'border-slate-300 text-slate-700 hover:border-slate-400 bg-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-pink text-brand-pink' : ''}`} />
                <span>{isSaved ? 'Saved to Roster' : 'Save Profile'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 bg-white shadow-2xs hover:shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
                title="Share Profile"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {(candidate.instagram || candidate.portfolio?.instagram) && (
                <a
                  href={`https://instagram.com/${(candidate.instagram || candidate.portfolio?.instagram).replace(/^@/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-full border border-pink-200 bg-pink-50/80 hover:bg-pink-100 text-brand-pink text-xs font-semibold flex items-center gap-1.5 shadow-2xs hover:shadow-xs active:translate-y-0.5 transition-all"
                  title="Visit Instagram Profile"
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  <span>
                    {(candidate.instagram || candidate.portfolio?.instagram).startsWith('@')
                      ? (candidate.instagram || candidate.portfolio?.instagram)
                      : `@${candidate.instagram || candidate.portfolio?.instagram}`}
                  </span>
                </a>
              )}
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-gray-100 max-w-xl text-left">
              <div>
                <p className="text-base sm:text-lg font-bold text-gray-900">
                  {candidate.experienceYears || '2+'}
                </p>
                <p className="text-[11px] text-gray-400">Years Exp</p>
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

        {/* ================= PROFILE TABS NAVIGATION ================= */}
        <div className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-20 py-1">
          <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs sm:text-sm font-semibold pb-3 relative transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-gray-900 font-bold'
                      : 'text-gray-500 hover:text-gray-900'
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

        {/* ================= TAB CONTENT SWITCHER ================= */}

        {/* ----------------- 1. ABOUT TAB ----------------- */}
        {activeTab === 'About' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start animate-in fade-in duration-150">
            {/* Left: About Me & Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-gray-900 font-serif mb-2">About Me</h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {candidate.bio}
                </p>
              </div>

              {/* Physical Specifications & Details Table */}
              <div>
                <h2 className="text-base font-bold text-gray-900 font-serif mb-3">
                  Physical Specifications & Details
                </h2>
                <div className="space-y-2 text-xs bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                  <div className="flex justify-between py-1.5 border-b border-gray-200/70">
                    <span className="text-gray-500">Playing Age</span>
                    <span className="font-semibold text-gray-900">{candidate.age || 26} years</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/70">
                    <span className="text-gray-500">Height</span>
                    <span className="font-semibold text-gray-900">{candidate.height || '165 cm'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/70">
                    <span className="text-gray-500">Nationality</span>
                    <span className="font-semibold text-gray-900">{candidate.nationality || 'Indian'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/70">
                    <span className="text-gray-500">Languages</span>
                    <span className="font-semibold text-gray-900">
                      {candidate.languages?.join(', ') || 'Hindi, English, Punjabi'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/70">
                    <span className="text-gray-500">Appearance</span>
                    <span className="font-semibold text-gray-900">{candidate.appearance || 'Fair'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/70">
                    <span className="text-gray-500">Body Type</span>
                    <span className="font-semibold text-gray-900">{candidate.bodyType || 'Slim'}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/70">
                    <span className="text-gray-500">Hair Color</span>
                    <span className="font-semibold text-gray-900">{candidate.hairColor || 'Black'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-gray-500">Eye Color</span>
                    <span className="font-semibold text-gray-900">{candidate.eyeColor || 'Brown'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Education, Quick Lookbook Preview, Availability */}
            <div className="space-y-6">
              {/* Formal Training */}
              <div>
                <h2 className="text-base font-bold text-gray-900 font-serif mb-3">
                  Drama Training & Education
                </h2>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Whistling Woods International, Mumbai</h3>
                    <span className="text-[11px] text-gray-400">2019 - 2021</span>
                  </div>
                  <p className="text-brand-pink font-semibold">Diploma in Acting & Screen Arts</p>
                  <p className="text-gray-500 text-[11px] pt-1">
                    Specialized training in camera acting, monologue delivery, Stanislavski technique, and voice modulation.
                  </p>
                </div>
              </div>

              {/* Quick Lookbook Preview Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Lookbook Headshots ({headshotsList.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Photos')}
                    className="text-xs font-bold text-brand-pink hover:underline flex items-center gap-1"
                  >
                    <span>View all photos</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {headshotsList.slice(0, 4).map((img, i) => (
                    <div
                      key={i}
                      onClick={() => openLightbox(img.url, i)}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative"
                    >
                      <img
                        src={img.url}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Showreel Preview Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => playVideo(videosList[0].url, videosList[0].title)}
                    className="w-14 h-14 rounded-xl bg-black overflow-hidden relative cursor-pointer group shrink-0"
                  >
                    <img
                      src={videosList[0].thumbnail}
                      alt="Reel"
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Official Acting Reel</h3>
                    <p className="text-[11px] text-gray-500">Duration: {videosList[0].duration}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('Videos')}
                  className="px-3.5 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:border-black transition-colors"
                >
                  View All Videos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 2. PHOTOS TAB ----------------- */}
        {activeTab === 'Photos' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Bar with Category Filter & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold font-serif text-gray-900">
                  Performer Photo Gallery & Lookbook
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  High-resolution composite cards, studio headshots, and editorial character stills.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsAddPhotoModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Headshots', 'Editorial', 'Character', 'Full-Length'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPhotoFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    photoFilter === cat
                      ? 'bg-black text-white shadow-2xs font-bold'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? `All Photos (${headshotsList.length})` : cat}
                </button>
              ))}
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => openLightbox(photo.url, idx)}
                  className="aspect-3/4 rounded-2xl overflow-hidden shadow-xs border border-gray-100 cursor-pointer group relative bg-gray-100"
                >
                  <img
                    src={photo.url}
                    alt={photo.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_TALENT_AVATAR;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Primary Badge */}
                  {idx === 0 && photoFilter === 'All' && (
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-bold backdrop-blur-xs">
                      Primary Headshot
                    </span>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 text-white">
                    <span className="self-end p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                      <Eye className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold leading-tight">{photo.title}</p>
                      <p className="text-[10px] text-gray-200 mt-0.5">{photo.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- 3. VIDEOS TAB ----------------- */}
        {activeTab === 'Videos' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold font-serif text-gray-900">
                  Video Reels & Audition Self-Tapes
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Stream acting showreels, dramatic monologues, commercial takes, and slates.
                </p>
              </div>

              {isOwner && (
                <Link
                  to="/candidate/profile/edit"
                  className="px-4 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage Reels</span>
                </Link>
              )}
            </div>

            {/* Featured Official Showreel (Large Banner) */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Featured Showreel
              </span>

              <div
                onClick={() => playVideo(videosList[0].url, videosList[0].title)}
                className="relative aspect-16/9 rounded-3xl overflow-hidden shadow-card border border-gray-100 cursor-pointer group bg-black max-w-4xl"
              >
                <img
                  src={videosList[0].thumbnail}
                  alt={videosList[0].title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 opacity-80"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-between p-6">
                  <div className="self-end px-3 py-1 rounded-full bg-brand-pink text-white text-xs font-bold shadow-xs">
                    Official Showreel
                  </div>

                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-white/95 text-brand-pink flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-brand-pink translate-x-0.5" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                          {videosList[0].title}
                        </h3>
                        <p className="text-xs text-gray-300">Runtime: {videosList[0].duration}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 hidden sm:block">
                      {videosList[0].description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Audition Clips Grid */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Audition Clips & Monologues ({videosList.length - 1})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {videosList.slice(1).map((clip) => (
                  <div
                    key={clip.id}
                    onClick={() => playVideo(clip.url, clip.title)}
                    className="p-3 rounded-2xl border border-gray-200/80 hover:border-black bg-white hover:shadow-card transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-gray-900">
                      <img
                        src={clip.thumbnail}
                        alt={clip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/90 text-brand-pink flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-brand-pink translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold">
                        {clip.duration}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink">
                          {clip.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand-pink transition-colors line-clamp-1 mt-0.5">
                        {clip.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">
                        {clip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 4. EXPERIENCE TAB ----------------- */}
        {activeTab === 'Experience' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Bar with Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold font-serif text-gray-900">
                  Performance Experience & Acting History
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chronological acting credits across films, streaming series, commercials, and stage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="#download-cv"
                  onClick={(e) => {
                    e.preventDefault();
                    setToastMessage('Downloading verified performer resume PDF...');
                    setToastType('info');
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:border-black text-xs font-bold text-gray-800 shadow-2xs flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download Resume (PDF)</span>
                </a>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Films', 'OTT', 'Commercials', 'Theatre'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setExperienceFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    experienceFilter === cat
                      ? 'bg-black text-white shadow-2xs font-bold'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'All' ? `All Roles (${experienceList.length})` : cat}
                </button>
              ))}
            </div>

            {/* Experience Timeline */}
            <div className="space-y-4">
              {filteredExperience.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="p-5 rounded-2xl bg-white border border-gray-200/80 hover:border-gray-400 hover:shadow-card transition-all space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-pink" />
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 font-serif">
                        {exp.role}
                      </h3>
                      <span className="text-xs font-semibold text-gray-500">in</span>
                      <span className="text-xs sm:text-sm font-bold text-brand-navy">
                        {exp.project}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-brand-pink border border-pink-200">
                        {exp.type}
                      </span>
                      <span className="text-xs font-bold text-gray-400">{exp.year}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 font-medium">
                    Directed by <strong className="text-gray-700">{exp.director}</strong>
                  </p>

                  <p className="text-xs text-gray-600 leading-relaxed pt-1">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- 5. SKILLS TAB ----------------- */}
        {activeTab === 'Skills' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-gray-100 pb-2">
              <h2 className="text-lg font-bold font-serif text-gray-900">
                Performance Skills & Artistic Competencies
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Verified performance proficiencies, movement, vocal range, and language abilities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Acting & Screen */}
              <div className="p-5 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-pink-100 text-brand-pink">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 font-serif">
                      Acting & Screen Craft
                    </h3>
                    <p className="text-[11px] text-gray-400">Stanislavski, Screen & Stage</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {MOCK_SKILLS_CATEGORIZED.acting.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-gray-800 border border-gray-200/80 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dance & Movement */}
              <div className="p-5 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Award className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 font-serif">
                      Dance & Stage Movement
                    </h3>
                    <p className="text-[11px] text-gray-400">Classical & Contemporary</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {MOCK_SKILLS_CATEGORIZED.dance.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-gray-800 border border-gray-200/80 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Voice & Diction */}
              <div className="p-5 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <Tag className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 font-serif">
                      Voice, Dubbing & Accents
                    </h3>
                    <p className="text-[11px] text-gray-400">ADR, Narration & Diction</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {MOCK_SKILLS_CATEGORIZED.voiceActing.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-gray-800 border border-gray-200/80 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modeling & Commercial Print */}
              <div className="p-5 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <Camera className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 font-serif">
                      Commercial Modeling & Ramp
                    </h3>
                    <p className="text-[11px] text-gray-400">Lookbook & High-Fashion</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {MOCK_SKILLS_CATEGORIZED.modeling.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-gray-800 border border-gray-200/80 shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages Table */}
            <div className="p-5 rounded-3xl bg-gray-50/70 border border-gray-100 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 font-serif">
                Languages & Diction Fluency
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {MOCK_SKILLS_CATEGORIZED.languages.map((lang) => (
                  <div key={lang.name} className="p-3 bg-white rounded-2xl border border-gray-200/80 space-y-0.5">
                    <p className="text-xs font-bold text-gray-900">{lang.name}</p>
                    <p className="text-[11px] text-gray-500">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 6. CREDITS TAB ----------------- */}
        {activeTab === 'Credits' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold font-serif text-gray-900">
                  Notable Industry Credits & Filmography
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Verified screen credits, brand campaigns, and theatre festival recognitions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl border border-gray-300 hover:border-black text-xs font-bold text-gray-800 shadow-2xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print Credit Sheet</span>
              </button>
            </div>

            <div className="space-y-6">
              {MOCK_CREDITS.map((sec, i) => (
                <div key={i} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {sec.category}
                  </h3>

                  <div className="overflow-hidden rounded-2xl border border-gray-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Project Title</th>
                          <th className="py-2.5 px-4 font-bold">Role / Credit</th>
                          <th className="py-2.5 px-4 font-bold hidden sm:table-cell">Production Banner</th>
                          <th className="py-2.5 px-4 font-bold hidden md:table-cell">Director / Jury</th>
                          <th className="py-2.5 px-4 font-bold text-right">Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {sec.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                            <td className="py-3 px-4 font-bold text-gray-900">{item.title}</td>
                            <td className="py-3 px-4 text-brand-pink font-semibold">{item.role}</td>
                            <td className="py-3 px-4 text-gray-600 hidden sm:table-cell">{item.banner}</td>
                            <td className="py-3 px-4 text-gray-500 hidden md:table-cell">{item.director}</td>
                            <td className="py-3 px-4 text-gray-500 text-right font-medium">{item.year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- 7. REVIEWS & RATINGS TAB ----------------- */}
        {activeTab === 'Reviews & Ratings' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold font-serif text-gray-900">
                  Verified Studio Ratings & Feedback on Production Submissions
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct evaluation scores from production companies and casting directors who have evaluated this performer&apos;s audition tapes and scenes.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200 self-start sm:self-auto">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold font-serif text-amber-950">
                  {studioReviews.length > 0
                    ? (studioReviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0) / studioReviews.length).toFixed(1)
                    : '4.9'}
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">
                  / 5.0 ({studioReviews.length || 2} verified studio {studioReviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {(studioReviews.length > 0 ? studioReviews : [
                {
                  id: 'fb-p-1',
                  production_company: 'Dharma Productions',
                  opportunity_title: 'Female Lead — Web Series',
                  role_title: 'Dr. Tanya Roy (Lead)',
                  rating: 4.8,
                  breakdown: { acting: 5.0, screen_presence: 4.8, vocal_quality: 4.6, professionalism: 5.0 },
                  feedback: 'Commanding screen presence in Scene 4 monologue. Nuanced emotional transitions between vulnerability and intellectual authority. Highly recommended for primary chemistry callback reads.',
                  reviewer_name: 'Rohan Mehra',
                  reviewer_role: 'Lead Casting Director • Dharma Productions',
                  given_at: '2026-10-12T14:30:00Z',
                },
                {
                  id: 'fb-p-2',
                  production_company: 'Netflix Studios',
                  opportunity_title: 'Anthology Feature Film',
                  role_title: 'Julian Cross',
                  rating: 4.9,
                  breakdown: { acting: 4.9, screen_presence: 5.0, vocal_quality: 4.8, professionalism: 5.0 },
                  feedback: 'Masterful vocal diction and authentic dramatic gravitas. The pacing in the callback self-tape showed deep script understanding and stillness on camera.',
                  reviewer_name: 'Sarah Jenkins',
                  reviewer_role: 'Senior Casting Associate • Netflix Global Originals',
                  given_at: '2026-10-16T18:00:00Z',
                }
              ]).map((fb, idx) => (
                <ProductionFeedbackCard key={fb.id || idx} feedback={fb} />
              ))}
            </div>
          </div>
        )}

        {/* ----------------- 8. AVAILABILITY TAB ----------------- */}
        {activeTab === 'Availability' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-gray-100 pb-2">
              <h2 className="text-lg font-bold font-serif text-gray-900">
                Casting Readiness & Booking Availability
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Current production availability, travel readiness, guild affiliations, and booking calendar.
              </p>
            </div>

            {/* Current Booking Status Card */}
            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className="text-base font-bold text-emerald-950 font-serif">
                      {candidate.availabilityStatus || 'Available for Auditions & Callbacks'}
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Open for immediate self-tape sides, live auditions, and production call sheets.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                >
                  Invite to Audition
                </button>
              </div>
            </div>

            {/* Travel, Dates & Union Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-brand-navy">
                  <Plane className="w-4 h-4 text-brand-pink" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Travel Readiness</h4>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {candidate.travelStatus || 'Worldwide / Passport Ready'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Valid international passport; open to domestic and overseas location shoots.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-brand-navy">
                  <Calendar className="w-4 h-4 text-brand-pink" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Dates Flexibility</h4>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {candidate.datesFlexibility || 'Flexible Schedule'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Can adjust production dates with 14-day notice for feature projects.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-brand-navy">
                  <ShieldCheck className="w-4 h-4 text-brand-pink" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Guild Affiliation</h4>
                </div>
                <p className="text-sm font-bold text-gray-900">
                  {candidate.unionStatus || 'CINTAA Registered (India)'}
                </p>
                <p className="text-[11px] text-gray-500">
                  Cine & TV Artistes' Association ID #CIN-94821; cleared for SAG/Equity international co-productions.
                </p>
              </div>
            </div>

            {/* Preferred Project Types */}
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Preferred Project Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {(candidate.preferredProjectTypes || [
                  'Feature Films',
                  'OTT / Web Series',
                  'Advertisements & TVCs',
                  'Music Videos',
                  'Theatre & Live Stage',
                ]).map((t, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-gray-800 border border-gray-200"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 8. CONTACT TAB ----------------- */}
        {activeTab === 'Contact' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start animate-in fade-in duration-150">
            {/* Direct Casting Inquiry Form */}
            <form
              onSubmit={handleSendContact}
              className="md:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-card space-y-5"
            >
              <div className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold font-serif text-gray-900">
                  Send Direct Casting Inquiry
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct message {candidate.fullName} regarding upcoming casting calls, script sides, or auditions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Production / Agency Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Auteur Pictures Studio"
                      value={contactSenderName}
                      onChange={(e) => setContactSenderName(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Casting Contact Email *
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. casting@auteurstudio.com"
                      value={contactSenderEmail}
                      onChange={(e) => setContactSenderEmail(e.target.value)}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Inquiry Category
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-black"
                    >
                      <option value="Audition Callback Invitation">Audition Callback Invitation</option>
                      <option value="Self-Tape Sides Request">Self-Tape Sides Request</option>
                      <option value="Feature Film Lead Inquiry">Feature Film Lead Inquiry</option>
                      <option value="OTT Series Casting Inquiry">OTT Series Casting Inquiry</option>
                      <option value="Commercial Endorsement Offer">Commercial Endorsement Offer</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Project Format
                    </label>
                    <select
                      value={contactProjectType}
                      onChange={(e) => setContactProjectType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-black"
                    >
                      <option value="Feature Films">Feature Films</option>
                      <option value="OTT / Web Series">OTT / Web Series</option>
                      <option value="TV Commercial">TV Commercial</option>
                      <option value="Theatre / Stage">Theatre / Stage</option>
                      <option value="Music Video">Music Video</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Message / Audition Sides Details *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide audition requirements, character overview, shoot dates, and callback instructions..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs outline-none focus:border-black leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSendingContact}
                  className="px-6 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingContact ? 'Sending Inquiry...' : 'Send Casting Message'}</span>
                </button>
              </div>
            </form>

            {/* Representation & Protected Info */}
            <div className="md:col-span-5 space-y-5">
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 font-serif">
                  Talent Representation
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Agency / Manager:</span>
                    <span className="font-semibold text-gray-900">Direct Talent / Self-Represented</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Union Status:</span>
                    <span className="font-semibold text-gray-900">{candidate.unionStatus || 'CINTAA Registered'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500">Primary Location:</span>
                    <span className="font-semibold text-gray-900">{candidate.location || 'Mumbai, India'}</span>
                  </div>
                </div>
              </div>

              {/* Direct Channels */}
              <div className="p-6 rounded-3xl bg-gray-50 border border-gray-100 space-y-3">
                <h3 className="text-sm font-bold text-gray-900 font-serif">
                  Verified Contact Channels
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Mail className="w-4 h-4 text-brand-pink shrink-0" />
                    <span>{candidate.contactEmail || candidate.email || 'aanya.sharma@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Phone className="w-4 h-4 text-brand-pink shrink-0" />
                    <span>{candidate.phone || candidate.phoneNumber || '+91 98201 23456'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <MapPin className="w-4 h-4 text-brand-pink shrink-0" />
                    <span>{candidate.location || 'Mumbai, India'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: VIDEO PLAYER ================= */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="bg-black rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-3 bg-neutral-900 text-white text-xs">
              <span className="font-bold truncate">{selectedVideoTitle}</span>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1 hover:text-brand-pink transition-colors"
              >
                <X className="w-4 h-4" />
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

      {/* ================= MODAL: PHOTO LIGHTBOX ================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden max-h-[80vh]">
              <img
                src={lightboxImage}
                alt="Enlarged Lookbook"
                className="w-full h-full max-h-[80vh] object-contain shadow-2xl"
              />
            </div>

            {/* Prev / Next controls */}
            {filteredPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevLightboxImage}
                  className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextLightboxImage}
                  className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors"
                  title="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Bottom Info Bar */}
            <div className="mt-3 flex items-center justify-between w-full text-white text-xs px-2">
              <p className="font-bold">
                {filteredPhotos[lightboxIndex]?.title || 'Performer Photo'}
                <span className="text-gray-400 font-normal ml-2">
                  ({lightboxIndex + 1} of {filteredPhotos.length})
                </span>
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={lightboxImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-300 hover:text-white flex items-center gap-1 underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Open High-Res</span>
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PHOTO ================= */}
      {isAddPhotoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsAddPhotoModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold font-serif text-brand-navy">
                Add Photo to Lookbook
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPhotoModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Image URL *</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Photo Title</label>
                <input
                  type="text"
                  placeholder="e.g. Studio Editorial"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-700">Category</label>
                <select
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
                >
                  <option value="Headshots">Headshots</option>
                  <option value="Editorial">Editorial</option>
                  <option value="Character">Character</option>
                  <option value="Full-Length">Full-Length</option>
                </select>
              </div>

              {/* Sample Quick Picker */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-gray-500">Or pick from sample high-res shots:</p>
                <div className="grid grid-cols-4 gap-2">
                  {MOCK_EXTENDED_HEADSHOTS.slice(0, 4).map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewPhotoUrl(m.url)}
                      className="aspect-square rounded-lg overflow-hidden border hover:border-black"
                    >
                      <img src={m.url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddPhotoModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-xl text-xs font-bold"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INVITE TO CASTING ================= */}
      <InviteToCastingModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        talent={candidate}
        onSuccess={() => {
          setToastMessage(`Audition invitation dispatched to ${candidate.fullName}!`);
          setToastType('success');
        }}
      />

      {/* Feedback Toast */}
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default PublicCandidateProfilePage;
