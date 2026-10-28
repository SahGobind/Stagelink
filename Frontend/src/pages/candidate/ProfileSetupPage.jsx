import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Star,
  Camera,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  Film,
  Sparkles,
  ChevronDown,
  Trash2,
  Plus,
  AlertCircle,
  Loader2,
  Play,
  X,
  ExternalLink,
  Video,
  CheckCircle2,
} from 'lucide-react';
import {
  getCandidateProfile,
  saveCandidateProfile,
} from '../../data/mockCandidates';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import Toast from '../../components/common/Toast';

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

const LinkedInIcon = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const CATEGORIES = ['Actor', 'Model', 'Dancer', 'Singer', 'Voice Artist', 'Other'];
const GENDERS = ['Female', 'Male', 'Other'];
const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
];

const PROJECT_TYPES = [
  'Films',
  'OTT / Web Series',
  'Advertisements',
  'Music Videos',
  'Fashion Shoots',
  'Theatre',
  'Other',
];

const SUGGESTED_SKILLS = [
  'Screen Acting',
  'Monologue Delivery',
  'Method Acting',
  'Dialogue Delivery',
  'Stage Combat',
  'Martial Arts',
  'Dance',
  'Voice-over',
  'Improvisation',
];

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser } = useAuth();
  const candidate = getCandidateProfile(user);

  const stepFromQuery = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState(
    stepFromQuery >= 1 && stepFromQuery <= 5 ? stepFromQuery : 1
  );

  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [missingErrors, setMissingErrors] = useState([]);

  // Step 1: Basic Information
  const initialName = candidate.fullName || user?.fullName || 'Candidate Performer';
  const [fullName, setFullName] = useState(initialName);
  const [selectedCategories, setSelectedCategories] = useState(
    candidate.categories || ['Actor']
  );
  const [customCategory, setCustomCategory] = useState(
    candidate.customCategory || candidate.otherCategory || ''
  );
  const [profilePhoto, setProfilePhoto] = useState(
    candidate.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  );
  const [dateOfBirth, setDateOfBirth] = useState(candidate.dateOfBirth || user?.dateOfBirth || '2000-01-01');
  const [gender, setGender] = useState(candidate.gender || 'Female');
  const [customGender, setCustomGender] = useState(
    candidate.customGender || candidate.otherGender || ''
  );
  const [country, setCountry] = useState(candidate.country || (user?.location?.includes(',') ? user.location.split(',')[1].trim() : 'India'));
  const [city, setCity] = useState(candidate.city || (user?.location ? user.location.split(',')[0].trim() : 'Mumbai'));

  // Step 2: Professional Details
  const [headline, setHeadline] = useState(candidate.headline || 'Actor • Model');
  const [bio, setBio] = useState(
    candidate.bio ||
      'Passionate actor and model with experience in films, web series and commercials. I love exploring diverse roles and bringing authentic characters to life.'
  );
  const [experienceYears, setExperienceYears] = useState(candidate.experienceYears || '2+');
  const [height, setHeight] = useState(candidate.height || '165 cm');
  const [nationality, setNationality] = useState(candidate.nationality || 'Indian');
  const [appearance, setAppearance] = useState(candidate.appearance || 'Fair');
  const [bodyType, setBodyType] = useState(candidate.bodyType || 'Slim');
  const [hairColor, setHairColor] = useState(candidate.hairColor || 'Black');
  const [eyeColor, setEyeColor] = useState(candidate.eyeColor || 'Brown');
  const [languages, setLanguages] = useState(candidate.languages || ['Hindi', 'English', 'Punjabi']);
  const [newLang, setNewLang] = useState('');
  const [skills, setSkills] = useState(candidate.skills || ['Screen Acting', 'Dialogue Delivery', 'Method Acting']);
  const [newSkill, setNewSkill] = useState('');

  // Step 3: Photos, Videos & Instagram
  const [headshots, setHeadshots] = useState(
    candidate.portfolio?.headshots && candidate.portfolio.headshots.length > 0
      ? candidate.portfolio.headshots
      : candidate.avatar
      ? [candidate.avatar]
      : [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
        ]
  );
  const photoInputRef = useRef(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [showPhotoUrlInput, setShowPhotoUrlInput] = useState(false);
  const [isDraggingPhotos, setIsDraggingPhotos] = useState(false);

  // Video state
  const videoInputRef = useRef(null);
  const [videoMode, setVideoMode] = useState('upload'); // 'upload' | 'url'
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileName, setVideoFileName] = useState(
    candidate.portfolio?.showreel?.fileName || candidate.portfolio?.showreel?.title || ''
  );
  const [videoFileSize, setVideoFileSize] = useState('');
  const [videoUrl, setVideoUrl] = useState(
    candidate.portfolio?.showreel?.url || 'https://www.w3schools.com/html/mov_bbb.mp4'
  );
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);

  // Instagram state
  const [instagram, setInstagram] = useState(
    candidate.instagram ||
    candidate.portfolio?.instagram ||
    candidate.social_links?.instagram ||
    candidate.socialLinks?.instagram ||
    ''
  );

  // LinkedIn state
  const [linkedin, setLinkedin] = useState(
    candidate.linkedin ||
    candidate.portfolio?.linkedin ||
    candidate.social_links?.linkedin ||
    candidate.socialLinks?.linkedin ||
    ''
  );

  // Step 4: Casting Preferences
  const [preferredProjects, setPreferredProjects] = useState(
    candidate.preferredProjectTypes || ['Films']
  );
  const [customProjectType, setCustomProjectType] = useState(
    candidate.customProjectType || candidate.otherProjectType || ''
  );
  const [availableForAuditions, setAvailableForAuditions] = useState(true);
  const [travelInternationally, setTravelInternationally] = useState(true);
  const [flexibleDates, setFlexibleDates] = useState(true);

  // Sync latest candidate data from backend on mount
  useEffect(() => {
    let isMounted = true;
    if (user?.id) {
      candidateService.getById(user.id).then((profile) => {
        if (isMounted && profile) {
          if (profile.fullName) setFullName(profile.fullName);
          if (profile.categories && profile.categories.length > 0) setSelectedCategories(profile.categories);
          if (profile.customCategory || profile.otherCategory) {
            setCustomCategory(profile.customCategory || profile.otherCategory);
          }
          if (profile.avatar) setProfilePhoto(profile.avatar);
          if (profile.headline) setHeadline(profile.headline);
          if (profile.bio) setBio(profile.bio);
          if (profile.gender) setGender(profile.gender);
          if (profile.customGender || profile.otherGender) {
            setCustomGender(profile.customGender || profile.otherGender);
          }
          if (profile.customProjectType || profile.otherProjectType) {
            setCustomProjectType(profile.customProjectType || profile.otherProjectType);
          }
          if (profile.skills && profile.skills.length > 0) setSkills(profile.skills);
          if (profile.languages && profile.languages.length > 0) setLanguages(profile.languages);
          if (profile.location) {
            if (profile.location.includes(',')) {
              setCity(profile.location.split(',')[0].trim());
              setCountry(profile.location.split(',')[1].trim());
            } else {
              setCity(profile.location);
            }
          }
          if (profile.portfolio?.headshots && profile.portfolio.headshots.length > 0) {
            setHeadshots(profile.portfolio.headshots);
          }
          if (profile.instagram || profile.portfolio?.instagram || profile.social_links?.instagram) {
            setInstagram(profile.instagram || profile.portfolio?.instagram || profile.social_links?.instagram || '');
          }
          if (profile.linkedin || profile.portfolio?.linkedin || profile.social_links?.linkedin || profile.socialLinks?.linkedin) {
            setLinkedin(profile.linkedin || profile.portfolio?.linkedin || profile.social_links?.linkedin || profile.socialLinks?.linkedin || '');
          }
          if (profile.portfolio?.showreel?.url) {
            setVideoUrl(profile.portfolio.showreel.url);
            if (profile.portfolio.showreel.fileName) {
              setVideoFileName(profile.portfolio.showreel.fileName);
            }
          }
        }
      }).catch((e) => console.warn('Could not load profile on wizard mount:', e));
    }
    return () => { isMounted = false; };
  }, [user?.id]);




  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setToastMessage('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 800;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX_DIM) {
          h = Math.round((h * MAX_DIM) / w);
          w = MAX_DIM;
        } else if (h > MAX_DIM) {
          w = Math.round((w * MAX_DIM) / h);
          h = MAX_DIM;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setProfilePhoto(dataUrl);
        setHeadshots((prev) => [dataUrl, ...prev.filter((p) => p !== dataUrl)]);
        setToastMessage('Profile photo updated & saved to gallery!');
      };
      img.onerror = () => {
        setProfilePhoto(ev.target.result);
        setToastMessage('Profile photo updated!');
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const cleanInstagramHandle = (raw) => {
    if (!raw) return '';
    return raw
      .trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
      .replace(/^@/, '')
      .replace(/\/$/, '')
      .trim();
  };

  const cleanLinkedInHandle = (raw) => {
    if (!raw) return '';
    return raw
      .trim()
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '')
      .replace(/^https?:\/\/(www\.)?linkedin\.com\/pub\//i, '')
      .replace(/^in\//i, '')
      .replace(/\/$/, '')
      .trim();
  };

  const handlePhotoFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      setToastMessage('Please select valid image files (JPG, PNG, WebP).');
      return;
    }

    try {
      const processed = await Promise.all(
        files.map(
          (file) =>
            new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_DIM = 1200;
                  let w = img.width;
                  let h = img.height;
                  if (w > h && w > MAX_DIM) {
                    h = Math.round((h * MAX_DIM) / w);
                    w = MAX_DIM;
                  } else if (h > MAX_DIM) {
                    w = Math.round((w * MAX_DIM) / h);
                    h = MAX_DIM;
                  }
                  canvas.width = w;
                  canvas.height = h;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, w, h);
                  resolve(canvas.toDataURL('image/jpeg', 0.82));
                };
                img.onerror = () => resolve(e.target.result);
                img.src = e.target.result;
              };
              reader.readAsDataURL(file);
            })
        )
      );

      setHeadshots((prev) => [...prev, ...processed]);
      setToastMessage(`${files.length} photo${files.length > 1 ? 's' : ''} added to gallery!`);
    } catch {
      setToastMessage('Failed to process image file.');
    }
  };

  const handleAddPhotoUrl = () => {
    if (!photoUrlInput.trim()) return;
    setHeadshots((prev) => [...prev, photoUrlInput.trim()]);
    setPhotoUrlInput('');
    setShowPhotoUrlInput(false);
    setToastMessage('Photo link added to gallery!');
  };

  const handleRemoveHeadshot = (index) => {
    const updated = headshots.filter((_, i) => i !== index);
    setHeadshots(updated);
    if (index === 0 && updated.length > 0) {
      setProfilePhoto(updated[0]);
    }
    setToastMessage('Headshot removed.');
  };

  const handleSetPrimaryHeadshot = (index) => {
    if (index === 0) return;
    const item = headshots[index];
    const remaining = headshots.filter((_, i) => i !== index);
    const updated = [item, ...remaining];
    setHeadshots(updated);
    setProfilePhoto(item);
    setToastMessage('Set as primary headshot and profile photo!');
  };

  const handleVideoFileUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setToastMessage('Please select a valid video file (.mp4, .mov, .webm).');
      return;
    }
    const sizeMbNum = file.size / (1024 * 1024);
    const sizeMb = sizeMbNum.toFixed(1);
    const blobUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoFileName(file.name);
    setVideoFileSize(`${sizeMb} MB`);

    if (sizeMbNum <= 8) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoUrl(e.target.result);
      };
      reader.readAsDataURL(file);
      setToastMessage(`Video "${file.name}" uploaded & ready to save!`);
    } else {
      setVideoUrl(blobUrl);
      setToastMessage(`Video attached (${sizeMb} MB). For large video reels, we recommend using a YouTube or Vimeo link for faster casting streaming.`);
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoFileName('');
    setVideoFileSize('');
    setVideoUrl('');
    setToastMessage('Video removed.');
  };

  const buildProfilePayload = () => {
    const handle = cleanInstagramHandle(instagram);
    const formattedInsta = handle ? `@${handle}` : '';
    const linkedinHandle = cleanLinkedInHandle(linkedin);
    const formattedLinkedIn = linkedinHandle ? `https://linkedin.com/in/${linkedinHandle}` : '';

    const finalCategories = selectedCategories.map((c) =>
      c === 'Other' && customCategory.trim() ? customCategory.trim() : c
    );
    const finalGender = gender === 'Other' && customGender.trim() ? customGender.trim() : gender;
    const finalPreferredProjects = preferredProjects.map((p) =>
      p === 'Other' && customProjectType.trim() ? customProjectType.trim() : p
    );

    return {
      fullName,
      full_name: fullName,
      categories: finalCategories,
      selectedCategories,
      customCategory: customCategory.trim(),
      category: finalCategories[0] || 'Actor',
      headline: headline || finalCategories.join(' • '),
      avatar: profilePhoto,
      dateOfBirth,
      date_of_birth: dateOfBirth,
      gender: finalGender,
      selectedGender: gender,
      customGender: customGender.trim(),
      country,
      city,
      location: `${city}, ${country}`,
      contactEmail: user?.email || candidate.contactEmail,
      phone: user?.phoneNumber || candidate.phone,
      bio,
      skills,
      languages,
      experienceYears,
      yearsOfExperience: parseInt(experienceYears, 10) || 2,
      height,
      nationality,
      appearance,
      bodyType,
      hairColor,
      eyeColor,
      preferredProjectTypes: finalPreferredProjects,
      selectedProjectTypes: preferredProjects,
      customProjectType: customProjectType.trim(),
      instagram: formattedInsta,
      linkedin: formattedLinkedIn,
      social_links: {
        ...(candidate.social_links || {}),
        instagram: formattedInsta,
        linkedin: formattedLinkedIn,
      },
      socialLinks: {
        ...(candidate.socialLinks || {}),
        instagram: formattedInsta,
        linkedin: formattedLinkedIn,
      },
      portfolio: {
        ...candidate.portfolio,
        headshots,
        instagram: formattedInsta,
        linkedin: formattedLinkedIn,
        showreel: {
          ...candidate.portfolio?.showreel,
          url: videoUrl,
          title: videoFileName || candidate.portfolio?.showreel?.title || 'Performance Showreel',
          fileName: videoFileName,
        },
        video_audition_url: videoUrl,
      },
    };
  };

  const handleSaveAndNext = async () => {
    // Validate Step 1 custom entries
    if (currentStep === 1) {
      if (selectedCategories.includes('Other') && !customCategory.trim()) {
        setToastMessage('Please enter your specific profession in the Other category box.');
        return;
      }
      if (gender === 'Other' && !customGender.trim()) {
        setToastMessage('Please specify your gender in the Other gender box.');
        return;
      }
    }

    // Validate Step 4 custom entries
    if (currentStep === 4) {
      if (preferredProjects.includes('Other') && !customProjectType.trim()) {
        setToastMessage('Please specify your other preferred project type.');
        return;
      }
    }

    const payload = buildProfilePayload();

    if (currentStep < 5) {
      // Save current progress step locally and on backend
      saveCandidateProfile(payload, user);
      candidateService.updateProfile(user?.id, payload, user).catch((err) => {
        console.warn('Step draft save error:', err);
      });

      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 5: Final Submission & Publishing to MongoDB Atlas
      setIsSaving(true);
      setMissingErrors([]);

      try {
        const result = await candidateService.publishProfile(user?.id, payload, user);
        if (updateUser) {
          updateUser({
            ...payload,
            is_published: true,
            isPublished: true,
            status: 'active',
          });
        }
        setIsSaving(false);
        setToastMessage('Profile published successfully! Your talent card is now live on Discover Talent.');
        setTimeout(() => navigate('/candidate/profile'), 1000);
      } catch (err) {
        setIsSaving(false);
        const labels = err.missingLabels && err.missingLabels.length > 0 ? err.missingLabels : [err.message];
        setMissingErrors(labels);
        setToastMessage(err.message || 'Please complete all required fields before publishing.');
      }
    }
  };


  const stepsMeta = [
    { number: 1, title: 'Basic Information', subtitle: 'Name, location, category' },
    { number: 2, title: 'Professional Details', subtitle: 'Bio, experience, skills' },
    { number: 3, title: 'Photos & Videos', subtitle: 'Headshots, reel & Instagram' },
    { number: 4, title: 'Casting Preferences', subtitle: 'Role types, availability' },
    { number: 5, title: 'Review & Submit', subtitle: 'Preview and publish' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-80 bg-pink-50/30 border-b md:border-b-0 md:border-r border-gray-200 p-6 sm:p-8 flex flex-col justify-between shrink-0">
          <div className="space-y-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-brand-pink fill-brand-pink" />
              <span className="text-xl font-bold font-serif text-gray-900 tracking-tight">
                StageLink
              </span>
            </Link>

            {/* Stepper */}
            <div className="space-y-6">
              {stepsMeta.map((s) => {
                const isActive = currentStep === s.number;
                const isCompleted = currentStep > s.number;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => setCurrentStep(s.number)}
                    className="flex items-start gap-3.5 text-left w-full group transition-all"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isActive
                          ? 'bg-brand-pink text-white ring-4 ring-pink-100'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-500 group-hover:border-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.number}
                    </div>
                    <div>
                      <h3
                        className={`text-xs font-bold ${
                          isActive
                            ? 'text-gray-900'
                            : isCompleted
                            ? 'text-gray-800'
                            : 'text-gray-500'
                        }`}
                      >
                        {s.title}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{s.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Promotional Card */}
          <div className="mt-8 bg-gradient-to-br from-pink-100/70 to-pink-50 border border-pink-200/60 rounded-2xl p-4 flex flex-col gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xs">
              <img
                src={profilePhoto}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 leading-tight">
                Build your professional profile
              </h4>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                Get discovered by top casting directors worldwide.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 p-6 sm:p-10 flex flex-col justify-between">
          <div className="max-w-2xl space-y-8">
            {/* Step Header */}
            <div>
              <span className="text-xs font-bold text-brand-pink uppercase tracking-wider">
                Step {currentStep} of 5
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-gray-900 mt-1">
                {stepsMeta[currentStep - 1].title}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {currentStep === 1 && "Let's start with your basic details."}
                {currentStep === 2 && 'Tell casting directors about your background and appearance.'}
                {currentStep === 3 && 'Upload your highest quality headshots and performance reels.'}
                {currentStep === 4 && 'Define the roles and project scopes you are open to.'}
                {currentStep === 5 && 'Verify your details before saving and publishing.'}
              </p>
            </div>

            {/* STEP 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {/* Left 2 Cols: Name & Category */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-2">
                        Full Name <span className="text-brand-pink">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full legal or stage name"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                      />
                    </div>

                    {/* Professional Category */}
                    <div>
                      <label className="block text-xs font-bold text-gray-800 mb-2">
                        Professional Category <span className="text-brand-pink">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCategories[0] || 'Actor'}
                          onChange={(e) => setSelectedCategories([e.target.value])}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-white appearance-none pr-10 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Custom Category Input Box when Other is selected */}
                      {selectedCategories.includes('Other') && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                            Please specify other category <span className="text-brand-pink">*</span>
                          </label>
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Enter your profession (e.g. Comedian, Stunt Performer, Magician)..."
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all bg-white shadow-2xs"
                            autoFocus
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right 1 Col: Profile Photo Upload */}
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-xs bg-gray-50">
                        <img
                          src={profilePhoto}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <label
                        htmlFor="photo-upload"
                        className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-brand-pink text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-rose-700 transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 mt-3">
                      Upload Profile Photo
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">JPG, PNG (Max 5MB)</span>
                  </div>
                </div>

                {/* Date of Birth & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">
                      Date of Birth <span className="text-brand-pink">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">
                      Gender <span className="text-brand-pink">*</span>
                    </label>
                    <div className="flex gap-2">
                      {GENDERS.map((g) => {
                        const isSelected = gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setGender(g)}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                              isSelected
                                ? 'border-brand-pink bg-pink-50 text-brand-pink'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {g}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Gender Input Box when Other is selected */}
                    {gender === 'Other' && (
                      <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                          Please specify gender <span className="text-brand-pink">*</span>
                        </label>
                        <input
                          type="text"
                          value={customGender}
                          onChange={(e) => setCustomGender(e.target.value)}
                          placeholder="Enter your gender (e.g. Non-Binary, Transgender, Self-describe)..."
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all bg-white shadow-2xs"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Country & City */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">
                      Country <span className="text-brand-pink">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-white focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-2">
                      City <span className="text-brand-pink">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Professional Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    Professional Headline <span className="text-brand-pink">*</span>
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Actor • Model"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    About / Bio <span className="text-brand-pink">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your acting background, training, and experience..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Height
                    </label>
                    <input
                      type="text"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Body Type
                    </label>
                    <input
                      type="text"
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                      Hair / Eyes
                    </label>
                    <input
                      type="text"
                      value={`${hairColor} / ${eyeColor}`}
                      onChange={(e) => {
                        const [h, ey] = e.target.value.split('/');
                        if (h) setHairColor(h.trim());
                        if (ey) setEyeColor(ey.trim());
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900"
                    />
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Languages <span className="text-brand-pink">*</span></label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {languages.map((l, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-brand-pink text-xs font-semibold border border-pink-200"
                      >
                        {l}
                        <button
                          type="button"
                          onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                          className="hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value)}
                      placeholder="Add language (e.g. Marathi, French)..."
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newLang.trim()) {
                          setLanguages([...languages, newLang.trim()]);
                          setNewLang('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Performance Skills */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-gray-800">
                      Performance Skills <span className="text-brand-pink">*</span>
                    </label>
                    <span className="text-[11px] text-gray-400">At least 1 required</span>
                  </div>

                  {/* Active Skills Pills */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink text-white text-xs font-semibold shadow-2xs"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                          className="hover:opacity-75"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Quick Add Suggested Skills */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Suggested skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setSkills([...skills, suggestion])}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-pink-50 hover:text-brand-pink border border-gray-200 text-[11px] font-medium text-gray-700 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Skill Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add custom performance skill..."
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                          setSkills([...skills, newSkill.trim()]);
                          setNewSkill('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* STEP 3: Photos, Videos & Instagram (Easy & Simple Streamlined Layout) */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. PHOTO GALLERY & HEADSHOTS */}
                <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                        <Camera className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">
                            Photo Gallery & Headshots
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                            {headshots.length} uploaded
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          High-resolution headshots, portrait and full-body production photos.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="file"
                        ref={photoInputRef}
                        onChange={(e) => {
                          handlePhotoFiles(e.target.files);
                          e.target.value = '';
                        }}
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photos</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPhotoUrlInput(!showPhotoUrlInput)}
                        className="px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        {showPhotoUrlInput ? 'Close Link' : '+ Add via URL'}
                      </button>
                    </div>
                  </div>

                  {/* Optional Image URL Input Bar */}
                  {showPhotoUrlInput && (
                    <div className="p-3 bg-pink-50/40 border border-pink-100 rounded-2xl flex flex-col sm:flex-row items-center gap-2 animate-in fade-in duration-150">
                      <input
                        type="url"
                        value={photoUrlInput}
                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        className="flex-1 w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPhotoUrl();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoUrl}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-colors"
                      >
                        Add Photo
                      </button>
                    </div>
                  )}

                  {/* Gallery Grid with Integrated Add Photo Tile */}
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {headshots.map((url, i) => (
                        <div
                          key={i}
                          className="relative group aspect-3/4 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs transition-all hover:shadow-md"
                        >
                          <img
                            src={url}
                            alt={`Headshot ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                            }}
                          />

                          {/* Primary Badge */}
                          {i === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-brand-pink text-white text-[10px] font-bold flex items-center gap-1 shadow-xs z-10">
                              <Star className="w-2.5 h-2.5 fill-white" />
                              <span>Primary</span>
                            </div>
                          )}

                          {/* Action Buttons Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <div className="flex justify-end gap-1.5">
                              {i !== 0 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetPrimaryHeadshot(i);
                                  }}
                                  className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-800 shadow-sm transition-colors cursor-pointer"
                                  title="Set as Primary Profile Photo"
                                >
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveHeadshot(i);
                                }}
                                className="p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors cursor-pointer"
                                title="Remove Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-white text-[11px] font-medium px-1">
                              <span>#{i + 1}</span>
                              {i === 0 && <span className="text-[10px] text-pink-200">Avatar</span>}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Integrated + Add Photo / Drop Card */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => photoInputRef.current?.click()}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingPhotos(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDraggingPhotos(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingPhotos(false);
                          handlePhotoFiles(e.dataTransfer.files);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            photoInputRef.current?.click();
                          }
                        }}
                        className={`aspect-3/4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer transition-all ${
                          isDraggingPhotos
                            ? 'border-brand-pink bg-pink-50/70 scale-[0.98]'
                            : 'border-gray-200 hover:border-brand-pink bg-gray-50/60 hover:bg-pink-50/30'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-brand-pink">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-gray-800">Add Photo</span>
                        <span className="text-[10px] text-gray-400">browse or drop</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 mt-2.5 flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      <span>Tip: The first image is your main profile headshot. Star any photo to make it Primary.</span>
                    </p>
                  </div>
                </div>

                {/* 2. PERFORMANCE REEL & VIDEO */}
                <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                        <Film className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900">
                            Performance Reel & Video
                          </h3>
                          {videoUrl && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Attached
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Paste a video link or upload your acting reel.
                        </p>
                      </div>
                    </div>

                    {/* Mode Toggle Tabs */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl shrink-0">
                      <button
                        type="button"
                        onClick={() => setVideoMode('upload')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          videoMode === 'upload'
                            ? 'bg-white text-gray-900 shadow-2xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('url')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                          videoMode === 'url'
                            ? 'bg-white text-gray-900 shadow-2xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Video Link / URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Video File Upload */}
                  {videoMode === 'upload' && (
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoFileUpload(file);
                          e.target.value = '';
                        }}
                        accept="video/mp4,video/webm,video/quicktime,video/m4v,video/*"
                        className="hidden"
                      />

                      {videoFile || (videoFileName && videoUrl) ? (
                        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-pink-100 text-brand-pink flex items-center justify-center shrink-0">
                                <Film className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {videoFileName || 'Uploaded Performance Reel'}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {videoFileSize || 'Video ready for casting review'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                Replace
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveVideo}
                                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove Video"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Video Player Preview */}
                          {videoUrl && (
                            <div className="pt-1">
                              <video
                                controls
                                src={videoUrl}
                                className="w-full rounded-xl aspect-video bg-black max-h-64 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingVideo(true);
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            setIsDraggingVideo(false);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingVideo(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleVideoFileUpload(file);
                          }}
                          onClick={() => videoInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                            isDraggingVideo
                              ? 'border-brand-pink bg-pink-50/60 scale-[0.99]'
                              : 'border-gray-200 hover:border-gray-300 bg-gray-50/40 hover:bg-gray-50/80'
                          }`}
                        >
                          <div className="w-10 h-10 mx-auto rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-brand-pink mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-gray-800">
                            Click to select video or drag & drop
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            MP4, WebM or QuickTime MOV (Max 100MB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: Video URL Input */}
                  {videoMode === 'url' && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="url"
                            value={videoUrl}
                            onChange={(e) => {
                              setVideoUrl(e.target.value);
                              setVideoFile(null);
                              setVideoFileName('');
                            }}
                            placeholder="Paste YouTube, Vimeo or MP4 link (e.g. https://www.youtube.com/watch?v=...)"
                            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink shadow-2xs"
                          />
                          {videoUrl && (
                            <button
                              type="button"
                              onClick={() => setVideoUrl('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {videoUrl && (
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 rounded-xl border border-pink-200 hover:border-brand-pink text-brand-pink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 bg-pink-50/50"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3 text-pink-400" />
                          </a>
                        )}
                      </div>

                      {/* Video Link Preview */}
                      {videoUrl && (
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                            <span>Video Preview</span>
                            <span className="text-[11px] text-gray-400">Ready for review</span>
                          </div>

                          {getYouTubeEmbedUrl(videoUrl) ? (
                            <iframe
                              src={getYouTubeEmbedUrl(videoUrl)}
                              title="YouTube Showreel Preview"
                              className="w-full rounded-xl aspect-video max-h-64 bg-black border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              controls
                              src={videoUrl}
                              className="w-full rounded-xl aspect-video bg-black max-h-64 object-contain"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. SOCIAL & PROFESSIONAL PROFILES (Instagram & LinkedIn) */}
                <div className="bg-white rounded-3xl border border-gray-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  {/* Instagram Profile */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                        <InstagramIcon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Instagram Profile
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <span className="font-bold text-sm text-brand-pink">@</span>
                        </div>
                        <input
                          type="text"
                          value={instagram.replace(/^@/, '')}
                          onChange={(e) => {
                            const val = e.target.value.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '');
                            setInstagram(val ? `@${val}` : '');
                          }}
                          placeholder="your_handle (e.g. aanya_sharma)"
                          className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-brand-pink shadow-2xs"
                        />
                      </div>

                      {cleanInstagramHandle(instagram) && (
                        <a
                          href={`https://instagram.com/${cleanInstagramHandle(instagram)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-white border border-pink-200 hover:border-brand-pink text-brand-pink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
                        >
                          <InstagramIcon className="w-3.5 h-3.5" />
                          <span>View @{cleanInstagramHandle(instagram)}</span>
                          <ExternalLink className="w-3 h-3 text-pink-400" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* LinkedIn Profile */}
                  <div className="border-t border-gray-100 pt-3 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#0077b5] text-white flex items-center justify-center shadow-2xs shrink-0">
                        <LinkedInIcon className="w-4 h-4 fill-white" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">
                        LinkedIn Profile / ID
                      </h3>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <span className="font-bold text-xs text-[#0077b5]">in/</span>
                        </div>
                        <input
                          type="text"
                          value={cleanLinkedInHandle(linkedin)}
                          onChange={(e) => {
                            const val = cleanLinkedInHandle(e.target.value);
                            setLinkedin(val);
                          }}
                          placeholder="username or profile link (e.g. gobind-sah)"
                          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#0077b5] shadow-2xs"
                        />
                      </div>

                      {cleanLinkedInHandle(linkedin) && (
                        <a
                          href={`https://linkedin.com/in/${cleanLinkedInHandle(linkedin)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-white border border-blue-200 hover:border-[#0077b5] text-[#0077b5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
                        >
                          <LinkedInIcon className="w-3.5 h-3.5 fill-[#0077b5]" />
                          <span>View LinkedIn Profile</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Casting Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    Preferred Project Types
                  </label>
                  <div className="relative">
                    <select
                      value={preferredProjects[0] || 'Films'}
                      onChange={(e) => setPreferredProjects([e.target.value])}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-white appearance-none pr-10 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all cursor-pointer"
                    >
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Custom Project Type Input Box when Other is selected */}
                  {preferredProjects.includes('Other') && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                      <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                        Please specify other project type <span className="text-brand-pink">*</span>
                      </label>
                      <input
                        type="text"
                        value={customProjectType}
                        onChange={(e) => setCustomProjectType(e.target.value)}
                        placeholder="Enter preferred project type (e.g. Voiceover, Reality Show, Radio)..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-pink-100 transition-all bg-white shadow-2xs"
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    Availability & Travel Status
                  </label>
                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availableForAuditions}
                      onChange={(e) => setAvailableForAuditions(e.target.checked)}
                      className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="text-xs font-bold text-gray-900">
                      Available for Auditions & Screen Tests
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={travelInternationally}
                      onChange={(e) => setTravelInternationally(e.target.checked)}
                      className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="text-xs font-bold text-gray-900">
                      Open to travel internationally for shoots
                    </span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flexibleDates}
                      onChange={(e) => setFlexibleDates(e.target.checked)}
                      className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink"
                    />
                    <span className="text-xs font-bold text-gray-900">
                      Flexible with shoot dates & schedules
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5: Review & Submit */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Missing Fields Warning Banner */}
                {missingErrors.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-xs font-bold">
                        Required fields missing before publication:
                      </span>
                    </div>
                    <ul className="list-disc list-inside text-xs space-y-1 pl-1 text-rose-800 font-medium">
                      {missingErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-rose-600 pt-1">
                      Click the "Back" button to complete missing information in previous steps.
                    </p>
                  </div>
                )}

                <div className="p-6 rounded-3xl bg-pink-50/40 border border-pink-100 flex flex-col sm:flex-row items-center gap-5">
                  <img
                    src={profilePhoto}
                    alt={fullName}
                    className="w-20 h-20 rounded-2xl object-cover shadow-xs border border-white"
                  />
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{fullName}</h3>
                    <p className="text-xs text-brand-pink font-semibold">{headline}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {city}, {country} • {gender === 'Other' && customGender.trim() ? `Other (${customGender.trim()})` : gender} • {experienceYears} experience
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-gray-600 bg-gray-50 p-5 rounded-2xl border border-gray-200">
                  <div className="space-y-2 pb-3 border-b border-gray-200">
                    <p>
                      <strong className="text-gray-900">Categories:</strong>{' '}
                      {selectedCategories
                        .map((c) => (c === 'Other' && customCategory.trim() ? `Other (${customCategory.trim()})` : c))
                        .join(', ')}
                    </p>
                    <p>
                      <strong className="text-gray-900">Bio:</strong> {bio}
                    </p>
                    <p>
                      <strong className="text-gray-900">Skills:</strong> {skills.join(', ')}
                    </p>
                    <p>
                      <strong className="text-gray-900">Languages:</strong> {languages.join(', ')}
                    </p>
                    <p>
                      <strong className="text-gray-900">Preferred Projects:</strong>{' '}
                      {preferredProjects
                        .map((p) => (p === 'Other' && customProjectType.trim() ? `Other (${customProjectType.trim()})` : p))
                        .join(', ')}
                    </p>
                  </div>

                  {/* Portfolio Media Summary */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-gray-900">Headshots ({headshots.length}):</strong>
                        <span className="text-[11px] text-gray-400">First image is your main profile avatar</span>
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {headshots.map((img, idx) => (
                          <div key={idx} className="relative w-14 h-18 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                            <img src={img} alt={`Headshot ${idx + 1}`} className="w-full h-full object-cover" />
                            {idx === 0 && (
                              <span className="absolute bottom-0 inset-x-0 bg-brand-pink text-white text-[8px] font-bold text-center py-0.5">
                                Primary
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                      <div>
                        <strong className="text-gray-900">Showreel Video:</strong>{' '}
                        {videoUrl ? (
                          <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {videoFileName || 'Video Attached'}
                          </span>
                        ) : (
                          <span className="text-gray-400">None attached</span>
                        )}
                      </div>
                      <div>
                        <strong className="text-gray-900">Instagram:</strong>{' '}
                        {instagram ? (
                          <span className="text-brand-pink font-semibold inline-flex items-center gap-1">
                            <InstagramIcon className="w-3.5 h-3.5" />
                            {instagram}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                      <div>
                        <strong className="text-gray-900">LinkedIn:</strong>{' '}
                        {cleanLinkedInHandle(linkedin) ? (
                          <span className="text-[#0077b5] font-semibold inline-flex items-center gap-1">
                            <LinkedInIcon className="w-3.5 h-3.5 fill-[#0077b5]" />
                            in/{cleanLinkedInHandle(linkedin)}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-8 border-t border-gray-100 flex items-center justify-between mt-8">
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={() => navigate('/candidate/profile')}
                className="px-6 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveAndNext}
              className={`px-6 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 ${
                isSaving ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing to StageLink...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === 5 ? 'Publish Profile' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </main>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default ProfileSetupPage;
