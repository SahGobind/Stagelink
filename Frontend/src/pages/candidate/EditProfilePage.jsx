import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  User,
  Briefcase,
  Layers,
  Film,
  Lock,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Sparkles,
  Camera,
  FileText,
  X,
  ChevronDown,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import { getCandidateProfile, saveCandidateProfile } from '../../data/mockCandidates';
import SkillDropdownPicker from '../../components/profile/SkillDropdownPicker';
import { POPULAR_LANGUAGES } from '../../data/skillsData';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const candidate = getCandidateProfile();

  const initialTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab); // 'personal' | 'professional' | 'credits' | 'skills' | 'media' | 'privacy'
  const [toastMessage, setToastMessage] = useState('');

  // 1. Personal & Contact
  const [fullName, setFullName] = useState(candidate.fullName || '');
  const [dateOfBirth, setDateOfBirth] = useState(candidate.dateOfBirth || '');
  const [location, setLocation] = useState(candidate.location || '');
  const [contactEmail, setContactEmail] = useState(candidate.contactEmail || '');
  const [phone, setPhone] = useState(candidate.phone || '');
  const [avatar, setAvatar] = useState(candidate.avatar || '');
  const [coverImage, setCoverImage] = useState(candidate.coverImage || '');

  // 2. Professional & Bio
  const [headline, setHeadline] = useState(candidate.headline || '');
  const [experienceLevel, setExperienceLevel] = useState(candidate.experienceLevel || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(candidate.yearsOfExperience || 6);
  const [bio, setBio] = useState(candidate.bio || '');
  const [availability, setAvailability] = useState(candidate.availability || '');
  const [unionStatus, setUnionStatus] = useState(candidate.unionStatus || '');
  const [height, setHeight] = useState(candidate.height || "5'8\" (173 cm)");
  const [eyeColor, setEyeColor] = useState(candidate.eyeColor || 'Hazel Green');
  const [hairColor, setHairColor] = useState(candidate.hairColor || 'Auburn / Brown');

  // 3. Credits & Education
  const [experience, setExperience] = useState(candidate.experience || []);
  const [education, setEducation] = useState(candidate.education || []);

  // 4. Skills & Languages
  const [languages, setLanguages] = useState(candidate.languages || ['English (Native/RP)']);
  const [newLanguage, setNewLanguage] = useState('');
  const [skills, setSkills] = useState(candidate.skills || []);
  const [skillsByCategory, setSkillsByCategory] = useState(candidate.skillsByCategory || {});
  const [newSkill, setNewSkill] = useState('');

  // 5. Portfolio & Media
  const [headshots, setHeadshots] = useState(candidate.portfolio?.headshots || []);
  const [portfolioPhotos, setPortfolioPhotos] = useState(candidate.portfolio?.portfolioPhotos || []);
  const [introVideoUrl, setIntroVideoUrl] = useState(candidate.portfolio?.introVideo?.url || '');
  const [actingReelUrl, setActingReelUrl] = useState(candidate.portfolio?.actingReel?.url || '');
  const [resume, setResume] = useState(candidate.portfolio?.resume || null);

  // 6. Privacy Settings
  const [privacySettings, setPrivacySettings] = useState(
    candidate.privacySettings || {
      showEmailPublicly: false,
      showPhonePublicly: false,
      showExactDob: false,
      profileVisibility: 'public',
    }
  );

  // Handlers for adding/removing items
  const [dropdownLanguage, setDropdownLanguage] = useState('');

  const handleAddLanguage = (input) => {
    let val = '';
    if (typeof input === 'string') {
      val = input.trim();
    } else if (input?.preventDefault) {
      input.preventDefault();
      val = newLanguage.trim();
    }
    if (val && !languages.includes(val)) {
      setLanguages((prev) => [...prev, val]);
      setNewLanguage('');
      setDropdownLanguage('');
    }
  };

  const handleAddSkill = (skillInput) => {
    let val = '';
    if (typeof skillInput === 'string') {
      val = skillInput.trim();
    } else if (skillInput?.preventDefault) {
      skillInput.preventDefault();
      val = newSkill.trim();
    }
    if (val && !skills.includes(val)) {
      setSkills((prev) => [...prev, val]);
      setSkillsByCategory((prev) => ({
        ...prev,
        otherSkills: [...(prev.otherSkills || []), val],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
    setSkillsByCategory((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((category) => {
        if (Array.isArray(updated[category])) {
          updated[category] = updated[category].filter((s) => s !== skillToRemove);
        }
      });
      return updated;
    });
  };

  const handleSave = (e) => {
    e?.preventDefault();

    const updatedProfile = {
      ...candidate,
      fullName,
      dateOfBirth,
      location,
      contactEmail,
      phone,
      avatar,
      coverImage,
      headline,
      experienceLevel,
      yearsOfExperience: Number(yearsOfExperience) || 0,
      bio,
      availability,
      unionStatus,
      height,
      eyeColor,
      hairColor,
      languages,
      skills,
      skillsByCategory,
      experience,
      education,
      portfolio: {
        ...(candidate.portfolio || {}),
        headshots,
        portfolioPhotos,
        introVideo: {
          url: introVideoUrl,
          title: 'Introduction Slate',
          duration: '1:02',
          thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
        },
        actingReel: {
          url: actingReelUrl,
          title: 'Dramatic Showreel',
          duration: '2:45',
          thumbnail: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
        },
        resume,
      },
      privacySettings,
    };

    saveCandidateProfile(updatedProfile);
    setToastMessage('Profile changes saved successfully!');

    setTimeout(() => {
      navigate('/candidate/profile');
    }, 1000);
  };

  const tabs = [
    { id: 'personal', label: 'Personal & Contact', icon: User },
    { id: 'professional', label: 'Professional & Bio', icon: Briefcase },
    { id: 'credits', label: 'Credits & Training', icon: Film },
    { id: 'skills', label: 'Skills & Languages', icon: Layers },
    { id: 'media', label: 'Portfolio & Reels', icon: Camera },
    { id: 'privacy', label: 'Privacy & Visibility', icon: Lock },
  ];

  return (
    <PageContainer maxWidth="lg" className="space-y-6 text-left py-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/candidate/profile"
              className="text-xs font-semibold text-gray-500 hover:text-black flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Profile</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold font-serif text-brand-navy mt-1">
            Edit Performer Profile
          </h1>
          <p className="text-xs text-gray-500">
            Update your casting credentials, media portfolio, contact info, and privacy settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/candidate/profile/setup"
            className="px-3.5 py-2 rounded-xl border border-gray-200 hover:border-black text-xs font-bold text-brand-navy bg-white hover:bg-gray-50 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch 5-Step Wizard</span>
          </Link>
          <Button variant="primary" onClick={handleSave} className="space-x-1.5">
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-brand-border rounded-2xl overflow-x-auto shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-navy text-white shadow-xs font-bold'
                  : 'text-gray-500 hover:text-black hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Card */}
      <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
        {/* ================= TAB 1: PERSONAL & CONTACT ================= */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-brand-navy border-b border-gray-100 pb-3">
              Personal Information & Primary Contacts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Stage Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Date of Birth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
              <Input
                label="Primary Location (Base City & Country)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <Input
                label="Contact Email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Profile Avatar Photo URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                helperText="Direct image link for primary profile portrait"
              />
              <div className="md:col-span-2">
                <Input
                  label="Profile Banner Cover Image URL"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  helperText="Wide cinematic backdrop image link"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PROFESSIONAL & BIO ================= */}
        {activeTab === 'professional' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-brand-navy border-b border-gray-100 pb-3">
              Professional Details & Artist Statement
            </h2>

            <Input
              label="Professional Headline / Title"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-brand-border rounded-xl text-xs text-brand-navy"
                >
                  <option value="Freshers / Emerging">Freshers / Emerging</option>
                  <option value="1 - 2 Years">1 - 2 Years</option>
                  <option value="3 - 5 Years">3 - 5 Years</option>
                  <option value="6+ Years / Senior">6+ Years / Senior</option>
                  <option value="Veteran Performer">Veteran Performer</option>
                </select>
              </div>

              <Input
                label="Years of Experience"
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
              />

              <Input
                label="Guild / Union Affiliation"
                value={unionStatus}
                onChange={(e) => setUnionStatus(e.target.value)}
              />
            </div>

            <Textarea
              label="Biography / Statement"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <Input
                label="Height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <Input
                label="Eye Color"
                value={eyeColor}
                onChange={(e) => setEyeColor(e.target.value)}
              />
              <Input
                label="Hair Color"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
              />
            </div>

            <Input
              label="Availability Status"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              helperText="e.g. Available for Castings & Immediate Bookings"
            />
          </div>
        )}

        {/* ================= TAB 3: CREDITS & TRAINING ================= */}
        {activeTab === 'credits' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-brand-navy border-b border-gray-100 pb-3">
              Screen Credits & Acting Education
            </h2>

            {/* Projects list */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Previous Projects ({experience.length})
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setExperience([
                      ...experience,
                      {
                        id: `proj-${Date.now()}`,
                        project: 'New Project Title',
                        role: 'Role Performed',
                        type: 'Feature Film',
                        year: new Date().getFullYear().toString(),
                        director: '',
                        description: '',
                      },
                    ])
                  }
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-brand-navy text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Project"
                      value={exp.project}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[idx].project = e.target.value;
                        setExperience(copy);
                      }}
                    />
                    <Input
                      label="Role"
                      value={exp.role}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[idx].role = e.target.value;
                        setExperience(copy);
                      }}
                    />
                    <Input
                      label="Year"
                      value={exp.year}
                      onChange={(e) => {
                        const copy = [...experience];
                        copy[idx].year = e.target.value;
                        setExperience(copy);
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                      className="text-xs text-brand-error hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Project</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Education list */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Training & Education ({education.length})
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    setEducation([
                      ...education,
                      {
                        id: `edu-${Date.now()}`,
                        institution: 'Conservatory Name',
                        degree: 'Acting Diploma / Certification',
                        year: '2023',
                        notes: '',
                      },
                    ])
                  }
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-brand-navy text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Training</span>
                </button>
              </div>

              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Institution"
                      value={edu.institution}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[idx].institution = e.target.value;
                        setEducation(copy);
                      }}
                    />
                    <Input
                      label="Degree / Course"
                      value={edu.degree}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[idx].degree = e.target.value;
                        setEducation(copy);
                      }}
                    />
                    <Input
                      label="Year"
                      value={edu.year}
                      onChange={(e) => {
                        const copy = [...education];
                        copy[idx].year = e.target.value;
                        setEducation(copy);
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                      className="text-xs text-brand-error hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Education</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: SKILLS & LANGUAGES ================= */}
        {activeTab === 'skills' && (
          <div className="space-y-8">
            <div className="border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold font-serif text-brand-navy">
                Performance Skills & Spoken Dialects
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Select your verified acting disciplines, dance, singing, vocal accents, and athletic skills from easy dropdown menus.
              </p>
            </div>

            {/* Featured Skills Dropdown Selector */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-navy" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                  Performance Skills Catalog
                </h3>
              </div>

              <SkillDropdownPicker
                selectedSkills={skills}
                onAddSkill={handleAddSkill}
                onRemoveSkill={handleRemoveSkill}
                helperText="Choose a category and skill from the dropdown menus below to easily add them to your casting composite profile."
              />
            </div>

            {/* Spoken Languages & Accents */}
            <div className="space-y-4 pt-6 border-t border-gray-100 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🗣️</span>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                    Spoken Languages & Accents ({languages.length})
                  </label>
                </div>
                <span className="text-[11px] text-gray-400">
                  Select from dropdown or enter custom
                </span>
              </div>

              {/* Selected Languages Badges */}
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-navy text-white text-xs font-semibold shadow-2xs"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                      className="p-0.5 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
                      title={`Remove ${lang}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Language Dropdown Selector + Custom Input Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-brand-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  {/* Language Dropdown Option */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                      1. Select Language From Dropdown:
                    </label>
                    <div className="relative">
                      <select
                        value={dropdownLanguage}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddLanguage(e.target.value);
                          }
                        }}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-brand-border rounded-xl text-xs sm:text-sm text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-black/20 appearance-none cursor-pointer hover:border-gray-400 transition-colors shadow-2xs"
                      >
                        <option value="">-- Choose language / dialect from dropdown --</option>
                        {POPULAR_LANGUAGES.map((l) => {
                          const isAdded = languages.includes(l);
                          return (
                            <option key={l} value={l} disabled={isAdded}>
                              {isAdded ? `✓ ${l} (Already Added)` : `+ ${l}`}
                            </option>
                          );
                        })}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Custom Language input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                      2. Or Add Custom Dialect / Accent:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Cockney, Irish Brogue, Arabic..."
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddLanguage(newLanguage);
                          }
                        }}
                        className="flex-1 px-3.5 py-2.5 bg-white border border-brand-border rounded-xl text-xs sm:text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-black/20 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddLanguage(newLanguage)}
                        disabled={!newLanguage.trim()}
                        className="px-4 py-2.5 bg-brand-navy hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-opacity shadow-2xs shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PORTFOLIO & MEDIA ================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-brand-navy border-b border-gray-100 pb-3">
              Portfolio Media, Showreels & CV
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Introduction Video URL"
                value={introVideoUrl}
                onChange={(e) => setIntroVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              <Input
                label="Acting Showreel URL"
                value={actingReelUrl}
                onChange={(e) => setActingReelUrl(e.target.value)}
                placeholder="https://vimeo.com/..."
              />
            </div>

            {/* Headshots */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                Headshots ({headshots.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {headshots.map((url, idx) => (
                  <div key={idx} className="relative aspect-3/4 rounded-2xl overflow-hidden group border border-gray-200">
                    <img src={url} alt={`Headshot ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setHeadshots(headshots.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Lookbook Photos */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                Portfolio & Production Stills ({portfolioPhotos.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {portfolioPhotos.map((url, idx) => (
                  <div key={idx} className="relative aspect-3/4 rounded-2xl overflow-hidden group border border-gray-200">
                    <img src={url} alt={`Look ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPortfolioPhotos(portfolioPhotos.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume document info */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy">
                Current Resume / CV
              </label>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-brand-navy" />
                  <div>
                    <p className="text-xs font-bold text-brand-navy">
                      {resume?.fileName || 'Sophia_Bennett_Acting_CV_2026.pdf'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {resume?.fileSize || '2.4 MB'} • Client session storage
                    </p>
                  </div>
                </div>
                <label className="cursor-pointer px-3 py-1.5 bg-white border border-gray-200 hover:border-black rounded-xl text-xs font-semibold text-brand-navy transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setResume({
                          fileName: file.name,
                          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                          uploadDate: 'Just now',
                          isLocalDemo: true,
                        });
                      }
                    }}
                  />
                  <span>Replace CV</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: PRIVACY & VISIBILITY ================= */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold font-serif text-brand-navy border-b border-gray-100 pb-3">
              Contact Privacy & Visibility Preferences
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-brand-navy">Display Email Publicly</span>
                  <p className="text-xs text-gray-500">
                    When turned off, only verified casting directors can view your email address.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showEmailPublicly}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, showEmailPublicly: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-black cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-brand-navy">Display Phone Number Publicly</span>
                  <p className="text-xs text-gray-500">
                    When turned off, your phone number is protected and available on request only.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showPhonePublicly}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, showPhonePublicly: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-black cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-brand-navy">Show Exact Date of Birth</span>
                  <p className="text-xs text-gray-500">
                    When turned off, StarCast displays a flexible playing age bracket (e.g. 22-30 yrs).
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacySettings.showExactDob}
                  onChange={(e) =>
                    setPrivacySettings({ ...privacySettings, showExactDob: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-black cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Action */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <Button variant="secondary" onClick={() => navigate('/candidate/profile')}>
            Cancel
          </Button>

          <Button variant="primary" onClick={handleSave} className="space-x-1.5">
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </Button>
        </div>
      </div>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default EditProfilePage;
