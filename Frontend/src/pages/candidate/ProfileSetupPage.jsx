import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import {
  getCandidateProfile,
  saveCandidateProfile,
} from '../../data/mockCandidates';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/common/Toast';

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
];

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const candidate = getCandidateProfile(user);

  const stepFromQuery = parseInt(searchParams.get('step') || '1', 10);
  const [currentStep, setCurrentStep] = useState(
    stepFromQuery >= 1 && stepFromQuery <= 5 ? stepFromQuery : 1
  );

  const [toastMessage, setToastMessage] = useState('');

  // Step 1: Basic Information
  const initialName = candidate.fullName || user?.fullName || 'Candidate Performer';
  const [fullName, setFullName] = useState(initialName);
  const [selectedCategories, setSelectedCategories] = useState(
    candidate.categories || ['Actor']
  );
  const [profilePhoto, setProfilePhoto] = useState(
    candidate.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  );
  const [dateOfBirth, setDateOfBirth] = useState(candidate.dateOfBirth || user?.dateOfBirth || '2000-01-01');
  const [gender, setGender] = useState(candidate.gender || 'Female');
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

  // Step 3: Photos & Videos
  const [headshots, setHeadshots] = useState(candidate.portfolio?.headshots || [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
  ]);
  const [showreelUrl, setShowreelUrl] = useState(candidate.portfolio?.showreel?.url || 'https://www.w3schools.com/html/mov_bbb.mp4');

  // Step 4: Casting Preferences
  const [preferredProjects, setPreferredProjects] = useState(
    candidate.preferredProjectTypes || [
      'Films',
      'OTT / Web Series',
      'Advertisements',
      'Music Videos',
      'Fashion Shoots',
      'Theatre',
    ]
  );
  const [availableForAuditions, setAvailableForAuditions] = useState(true);
  const [travelInternationally, setTravelInternationally] = useState(true);
  const [flexibleDates, setFlexibleDates] = useState(true);

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleProjectType = (type) => {
    if (preferredProjects.includes(type)) {
      setPreferredProjects(preferredProjects.filter((t) => t !== type));
    } else {
      setPreferredProjects([...preferredProjects, type]);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
      setToastMessage('Profile photo updated!');
    }
  };

  const handleSaveAndNext = () => {
    const updated = saveCandidateProfile(
      {
        fullName,
        categories: selectedCategories,
        headline: selectedCategories.join(' • '),
        avatar: profilePhoto,
        dateOfBirth,
        gender,
        country,
        city,
        location: `${city}, ${country}`,
        contactEmail: user?.email || candidate.contactEmail,
        phone: user?.phoneNumber || candidate.phone,
        bio,
        experienceYears,
        height,
        nationality,
        appearance,
        bodyType,
        hairColor,
        eyeColor,
        languages,
        preferredProjectTypes: preferredProjects,
        portfolio: {
          ...candidate.portfolio,
          headshots,
          showreel: {
            ...candidate.portfolio?.showreel,
            url: showreelUrl,
          },
        },
      },
      user
    );

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setToastMessage('Profile saved successfully!');
      setTimeout(() => navigate('/candidate/profile'), 800);
    }
  };

  const stepsMeta = [
    { number: 1, title: 'Basic Information', subtitle: 'Name, location, category' },
    { number: 2, title: 'Professional Details', subtitle: 'Bio, experience, skills' },
    { number: 3, title: 'Photos & Videos', subtitle: 'Headshots, showreel' },
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
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                          const isSelected = selectedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                isSelected
                                  ? 'bg-brand-pink text-white shadow-xs'
                                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
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

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">Languages</label>
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
              </div>
            )}

            {/* STEP 3: Photos & Videos */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-xs font-bold text-gray-800 mb-2">
                    Photo Gallery (5 Headshots)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {headshots.map((url, i) => (
                      <div
                        key={i}
                        className="relative group aspect-3/4 rounded-2xl overflow-hidden border border-gray-200 shadow-2xs"
                      >
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    Showreel Video URL
                  </label>
                  <input
                    type="text"
                    value={showreelUrl}
                    onChange={(e) => setShowreelUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Casting Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-3">
                    Preferred Project Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PROJECT_TYPES.map((type) => {
                      const isSelected = preferredProjects.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => toggleProjectType(type)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-brand-pink text-white shadow-xs'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
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
                      {city}, {country} • {gender} • 26 years
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <p>
                    <strong>Categories:</strong> {selectedCategories.join(', ')}
                  </p>
                  <p>
                    <strong>Bio:</strong> {bio}
                  </p>
                  <p>
                    <strong>Languages:</strong> {languages.join(', ')}
                  </p>
                  <p>
                    <strong>Preferred Projects:</strong> {preferredProjects.join(', ')}
                  </p>
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
              onClick={handleSaveAndNext}
              className="px-6 py-2.5 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <span>{currentStep === 5 ? 'Publish Profile' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </main>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default ProfileSetupPage;
