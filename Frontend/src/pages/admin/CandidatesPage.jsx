import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Users,
  ChevronRight,
  Lock,
  Mail,
  ChevronLeft,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Phone,
  Sparkles,
  ShieldCheck,
  Award,
  Filter,
  Check,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import BackButton from '../../components/common/BackButton';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import { hasCompletedPostingPayment, EVENT_PAYMENT_STATE_CHANGED } from '../../utils/paymentAccess';
import { getCandidatesList } from '../../data/mockCandidates';
import { candidateService } from '../../services/candidateService';

const PAGE_SIZE = 8;

const LOCATION_OPTIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'mumbai', label: 'Mumbai, India' },
  { value: 'delhi', label: 'Delhi, India' },
  { value: 'bangalore', label: 'Bangalore, India' },
  { value: 'london', label: 'London, UK' },
  { value: 'new york', label: 'New York, USA' },
  { value: 'los angeles', label: 'Los Angeles, USA' },
  { value: 'toronto', label: 'Toronto, Canada' },
  { value: 'berlin', label: 'Berlin, Germany' },
  { value: 'paris', label: 'Paris, France' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'All Experience Levels' },
  { value: 'junior', label: '1 - 2 Years (Junior)' },
  { value: 'mid', label: '3 - 5 Years (Mid-Level)' },
  { value: 'senior', label: '6+ Years (Senior)' },
];

const VERIFICATION_OPTIONS = [
  { value: 'all', label: 'All Verification Statuses' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'unverified', label: 'Unverified' },
];

const DEFAULT_CANDIDATE_FORM = {
  fullName: '',
  contactEmail: '',
  phone: '',
  category: 'Actor',
  headline: '',
  location: 'Mumbai, India',
  yearsOfExperience: 2,
  skills: 'Method Acting, Screen Presence, Voice Modulation',
  languages: 'Hindi, English',
  verificationStatus: 'verified',
  availabilityStatus: 'Available for Auditions',
  bio: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
};

const CandidatesPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [candidates, setCandidates] = useState(() => getCandidatesList());
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);

  // CRUD Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQuickViewModalOpen, setIsQuickViewModalOpen] = useState(false);

  const [activeCandidate, setActiveCandidate] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_CANDIDATE_FORM);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Sync with candidate list
  const loadCandidates = async () => {
    setIsLoading(true);
    try {
      const data = await candidateService.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setCandidates(data);
      }
    } catch (err) {
      console.warn('Failed to fetch candidate list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();

    const handleCreated = () => loadCandidates();
    const handleUpdated = () => loadCandidates();
    const handleDeleted = () => loadCandidates();

    window.addEventListener('starcast_candidate_created', handleCreated);
    window.addEventListener('starcast_candidate_updated', handleUpdated);
    window.addEventListener('starcast_candidate_deleted', handleDeleted);

    return () => {
      window.removeEventListener('starcast_candidate_created', handleCreated);
      window.removeEventListener('starcast_candidate_updated', handleUpdated);
      window.removeEventListener('starcast_candidate_deleted', handleDeleted);
    };
  }, []);

  // Compute stats for header summary
  const stats = useMemo(() => {
    const total = candidates.length;
    const verified = candidates.filter((c) => c.verificationStatus === 'verified').length;
    const pending = candidates.filter((c) => c.verificationStatus === 'pending_review').length;
    const senior = candidates.filter((c) => (c.yearsOfExperience || 0) >= 5).length;
    return { total, verified, pending, senior };
  }, [candidates]);

  // Filter logic
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // 1. Text Search across name, headline, location, and skills
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = c.fullName?.toLowerCase().includes(query);
        const matchesHeadline = c.headline?.toLowerCase().includes(query);
        const matchesLoc = c.location?.toLowerCase().includes(query);
        const matchesSkills = c.skills?.some((s) => s.toLowerCase().includes(query));
        if (!matchesName && !matchesHeadline && !matchesLoc && !matchesSkills) {
          return false;
        }
      }

      // 2. Location Filter
      if (selectedLocation !== 'all') {
        if (!c.location?.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // 3. Experience Filter
      if (selectedExperience !== 'all') {
        const years = c.yearsOfExperience || 0;
        if (selectedExperience === 'junior' && years > 2) return false;
        if (selectedExperience === 'mid' && (years < 3 || years > 5)) return false;
        if (selectedExperience === 'senior' && years < 6) return false;
      }

      // 4. Verification Status Filter
      if (selectedVerification !== 'all') {
        if (c.verificationStatus !== selectedVerification) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, search, selectedLocation, selectedExperience, selectedVerification]);

  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE) || 1;
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCandidates.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCandidates, currentPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedLocation('all');
    setSelectedExperience('all');
    setSelectedVerification('all');
    setCurrentPage(1);
  };

  // --- CRUD Handlers ---

  // 1. Open Create Modal
  const openCreateModal = () => {
    setFormData(DEFAULT_CANDIDATE_FORM);
    setIsCreateModalOpen(true);
  };

  // Submit Create
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    try {
      const skillsArray = typeof formData.skills === 'string'
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.skills;

      const languagesArray = typeof formData.languages === 'string'
        ? formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
        : formData.languages;

      const newCand = await candidateService.create({
        ...formData,
        skills: skillsArray,
        languages: languagesArray,
        yearsOfExperience: Number(formData.yearsOfExperience) || 1,
        experienceYears: `${formData.yearsOfExperience}+`,
        experienceLevel: `${formData.yearsOfExperience}+ Years Experience`,
        profileCompletion: 85,
        registeredDate: new Date().toISOString().split('T')[0],
      });

      setCandidates((prev) => [newCand, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`✓ Candidate "${newCand.fullName}" successfully created!`);
    } catch (err) {
      showToast(`✕ Error creating candidate: ${err.message}`);
    }
  };

  // 2. Open Edit Modal
  const openEditModal = (candidate) => {
    setActiveCandidate(candidate);
    setFormData({
      fullName: candidate.fullName || '',
      contactEmail: candidate.contactEmail || candidate.email || '',
      phone: candidate.phone || candidate.phoneNumber || '',
      category: candidate.categories?.[0] || candidate.category || 'Actor',
      headline: candidate.headline || '',
      location: candidate.location || 'Mumbai, India',
      yearsOfExperience: candidate.yearsOfExperience || 2,
      skills: Array.isArray(candidate.skills) ? candidate.skills.join(', ') : (candidate.skills || ''),
      languages: Array.isArray(candidate.languages) ? candidate.languages.join(', ') : (candidate.languages || ''),
      verificationStatus: candidate.verificationStatus || 'verified',
      availabilityStatus: candidate.availabilityStatus || 'Available for Auditions',
      bio: candidate.bio || '',
      avatar: candidate.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeCandidate) return;

    try {
      const skillsArray = typeof formData.skills === 'string'
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : formData.skills;

      const languagesArray = typeof formData.languages === 'string'
        ? formData.languages.split(',').map((l) => l.trim()).filter(Boolean)
        : formData.languages;

      const updates = {
        ...formData,
        skills: skillsArray,
        languages: languagesArray,
        yearsOfExperience: Number(formData.yearsOfExperience) || 1,
        experienceYears: `${formData.yearsOfExperience}+`,
        experienceLevel: `${formData.yearsOfExperience}+ Years Experience`,
      };

      const updated = await candidateService.update(activeCandidate.id, updates);
      setCandidates((prev) => prev.map((c) => (c.id === activeCandidate.id ? { ...c, ...updated } : c)));
      setIsEditModalOpen(false);
      showToast(`✓ Candidate "${updated.fullName || activeCandidate.fullName}" updated successfully!`);
    } catch (err) {
      showToast(`✕ Error updating candidate: ${err.message}`);
    }
  };

  // 3. Open Delete Confirmation Modal
  const openDeleteModal = (candidate) => {
    setActiveCandidate(candidate);
    setIsDeleteModalOpen(true);
  };

  // Submit Delete
  const handleDeleteConfirm = async () => {
    if (!activeCandidate) return;
    try {
      await candidateService.delete(activeCandidate.id);
      setCandidates((prev) => prev.filter((c) => c.id !== activeCandidate.id));
      setIsDeleteModalOpen(false);
      showToast(`✓ Candidate "${activeCandidate.fullName}" removed from platform.`);
      setActiveCandidate(null);
    } catch (err) {
      showToast(`✕ Error deleting candidate: ${err.message}`);
    }
  };

  // 4. Quick Verification Toggle (1-click cycle: verified -> pending_review -> unverified -> verified)
  const toggleVerificationStatus = async (candidate, e) => {
    e.stopPropagation();
    const nextStatusMap = {
      verified: 'pending_review',
      pending_review: 'unverified',
      unverified: 'verified',
    };
    const nextStatus = nextStatusMap[candidate.verificationStatus] || 'verified';
    try {
      await candidateService.update(candidate.id, {
        verificationStatus: nextStatus,
        isVerified: nextStatus === 'verified',
      });
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidate.id ? { ...c, verificationStatus: nextStatus, isVerified: nextStatus === 'verified' } : c
        )
      );
      showToast(`Updated ${candidate.fullName}'s status to ${nextStatus.replace('_', ' ')}`);
    } catch (err) {
      showToast(`✕ Status update failed: ${err.message}`);
    }
  };

  // 5. Open Quick View
  const openQuickView = (candidate) => {
    setActiveCandidate(candidate);
    setIsQuickViewModalOpen(true);
  };

  const renderVerificationBadge = (candidate) => {
    const status = candidate.verificationStatus;
    if (status === 'verified') {
      return (
        <button
          type="button"
          onClick={(e) => toggleVerificationStatus(candidate, e)}
          title="Click to toggle status"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Verified</span>
        </button>
      );
    }
    if (status === 'pending_review') {
      return (
        <button
          type="button"
          onClick={(e) => toggleVerificationStatus(candidate, e)}
          title="Click to toggle status"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
        >
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending Review</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => toggleVerificationStatus(candidate, e)}
        title="Click to toggle status"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-300 hover:bg-neutral-200 transition-colors cursor-pointer"
      >
        <AlertCircle className="w-3 h-3 text-neutral-500" />
        <span>Unverified</span>
      </button>
    );
  };

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-bounce duration-300 bg-[#18191C] border border-[#FA5A36]/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-[#FA5A36]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Action Bar */}
      <div className="space-y-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#FA5A36]/10 text-[#FA5A36] border border-[#FA5A36]/20">
                Admin Control
              </span>
              <span className="text-xs text-neutral-500">• Performer Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-sans tracking-tight">
              Talent & Candidate Directory
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Full CRUD management: Create, review, update profiles, toggle verification, and remove performers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold transition-all shadow-md shadow-[#FA5A36]/20 active:translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add New Candidate</span>
            </button>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Total Talent</span>
              <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-black mt-2">{stats.total}</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Registered Performers</div>
          </div>

          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Verified</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">{stats.verified}</div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">Ready for Casting</div>
          </div>

          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Pending Review</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2">{stats.pending}</div>
            <div className="text-[11px] text-amber-600/80 mt-0.5">Needs Verification</div>
          </div>

          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500">Senior Artists</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-indigo-600 mt-2">{stats.senior}</div>
            <div className="text-[11px] text-indigo-600/80 mt-0.5">5+ Years Experience</div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by actor name, headline, location, or skills (e.g. Action, Kathak, Combat)..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black cursor-pointer text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 focus:outline-none focus:border-black cursor-pointer"
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedExperience}
                onChange={(e) => {
                  setSelectedExperience(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 focus:outline-none focus:border-black cursor-pointer"
              >
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <option key={exp.value} value={exp.value}>
                    {exp.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedVerification}
                onChange={(e) => {
                  setSelectedVerification(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-700 focus:outline-none focus:border-black cursor-pointer"
              >
                {VERIFICATION_OPTIONS.map((v) => (
                  <option key={v.value} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>

              {(search || selectedLocation !== 'all' || selectedExperience !== 'all' || selectedVerification !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main CRUD Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-black font-sans">No candidates match your filters</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your search keyword or clearing location and verification status filters.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-neutral-100 text-black text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Clear All Filters
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 bg-[#FA5A36] text-white text-xs font-bold rounded-xl hover:bg-[#E64825] transition-colors"
              >
                + Add New Candidate
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Performer Name &amp; Role</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Experience</th>
                  <th className="py-3 px-3">Key Skills</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">CRUD Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-neutral-50/70 transition-colors group">
                    {/* Candidate Name & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={candidate.avatar} name={candidate.fullName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              onClick={() => openQuickView(candidate)}
                              className="font-bold text-sm text-black hover:text-[#FA5A36] cursor-pointer truncate max-w-[180px] transition-colors"
                            >
                              {candidate.fullName}
                            </span>
                            {candidate.contactPermissionGranted && (
                              <span title="Direct contact authorized" className="text-emerald-600">
                                <Mail className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 truncate block max-w-[210px]">
                            {candidate.headline || candidate.category || 'Actor'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 whitespace-nowrap text-neutral-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{candidate.location?.split('/')[0]?.trim() || 'Worldwide'}</span>
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-black">{candidate.yearsOfExperience || 2} yrs</span>
                      <span className="text-[10px] text-neutral-500 block">
                        {candidate.experienceLevel?.split('/')[0]?.trim() || 'Experienced'}
                      </span>
                    </td>

                    {/* Skills */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(Array.isArray(candidate.skills) ? candidate.skills : []).slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-semibold whitespace-nowrap"
                          >
                            {skill}
                          </span>
                        ))}
                        {(candidate.skills?.length || 0) > 2 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-bold">
                            +{(candidate.skills?.length || 0) - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Verification Status with 1-Click Toggle */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {renderVerificationBadge(candidate)}
                    </td>

                    {/* CRUD Actions Column */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Quick View Button */}
                        <button
                          type="button"
                          onClick={() => openQuickView(candidate)}
                          title="Quick View Performer"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(candidate)}
                          title="Edit Candidate Details"
                          className="p-1.5 rounded-lg border border-neutral-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => openDeleteModal(candidate)}
                          title="Delete Candidate"
                          className="p-1.5 rounded-lg border border-neutral-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Full Profile Link */}
                        <Link
                          to={`/admin/candidates/${candidate.id}`}
                          title="Open Full Dossier"
                          className="p-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 transition-colors inline-flex items-center"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredCandidates.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-neutral-500 font-medium">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(currentPage * PAGE_SIZE, filteredCandidates.length)} of{' '}
              <strong className="text-black">{filteredCandidates.length}</strong> performers
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-black font-bold text-xs disabled:opacity-30 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        pageNum === currentPage
                          ? 'bg-black text-white'
                          : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-black font-bold text-xs disabled:opacity-30 hover:bg-neutral-100 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- CREATE CANDIDATE MODAL --- */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Performer Profile"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Aryan Malhotra"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="e.g. aryan@stagelink.com"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +91 98200 12345"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Primary Craft / Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black cursor-pointer bg-white"
                >
                  <option value="Actor">Actor</option>
                  <option value="Model">Model</option>
                  <option value="Voiceover">Voiceover Artist</option>
                  <option value="Dancer">Dancer / Choreographer</option>
                  <option value="Performer">Stunt Performer</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Headline / Specialty
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Lead Theatrical Actor • Method Acting & Screen Presence"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Mumbai, India"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Verification Status
                </label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black cursor-pointer bg-white"
                >
                  <option value="verified">Verified (Approved)</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Availability
                </label>
                <select
                  value={formData.availabilityStatus}
                  onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black cursor-pointer bg-white"
                >
                  <option value="Available for Auditions">Available for Auditions</option>
                  <option value="In Production">In Production</option>
                  <option value="Selective Projects">Selective Projects</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="e.g. Method Acting, Screen Combat, Horse Riding, Voice Dubbing"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Languages (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  placeholder="e.g. Hindi, English, Punjabi"
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Profile Avatar URL
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#FA5A36] hover:bg-[#E64825] rounded-xl shadow-md transition-all cursor-pointer"
              >
                Create Candidate
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- EDIT CANDIDATE MODAL --- */}
      {isEditModalOpen && activeCandidate && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Candidate: ${activeCandidate.fullName}`}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Craft / Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black cursor-pointer bg-white"
                >
                  <option value="Actor">Actor</option>
                  <option value="Model">Model</option>
                  <option value="Voiceover">Voiceover Artist</option>
                  <option value="Dancer">Dancer / Choreographer</option>
                  <option value="Performer">Stunt Performer</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Verification Status
                </label>
                <select
                  value={formData.verificationStatus}
                  onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black cursor-pointer bg-white"
                >
                  <option value="verified">Verified (Approved)</option>
                  <option value="pending_review">Pending Review</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Availability
                </label>
                <select
                  value={formData.availabilityStatus}
                  onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black cursor-pointer bg-white"
                >
                  <option value="Available for Auditions">Available for Auditions</option>
                  <option value="In Production">In Production</option>
                  <option value="Selective Projects">Selective Projects</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Languages
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isDeleteModalOpen && activeCandidate && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Candidate Deletion"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-900">Irreversible Action</h4>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  Are you sure you want to permanently delete performer <strong>{activeCandidate.fullName}</strong>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
              <Avatar src={activeCandidate.avatar} name={activeCandidate.fullName} size="md" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-black truncate">{activeCandidate.fullName}</div>
                <div className="text-[11px] text-neutral-500 truncate">{activeCandidate.headline || 'Candidate'}</div>
                <div className="text-[10px] text-neutral-400">{activeCandidate.location}</div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-500">
              This will remove the candidate's portfolio, audition history, and active submissions from the platform.
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Delete Candidate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- QUICK VIEW MODAL --- */}
      {isQuickViewModalOpen && activeCandidate && (
        <Modal
          isOpen={isQuickViewModalOpen}
          onClose={() => setIsQuickViewModalOpen(false)}
          title="Performer Quick Dossier"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <Avatar src={activeCandidate.avatar} name={activeCandidate.fullName} size="xl" />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-black">{activeCandidate.fullName}</h3>
                  {renderVerificationBadge(activeCandidate)}
                </div>
                <p className="text-xs text-neutral-600">{activeCandidate.headline}</p>
                <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    {activeCandidate.location}
                  </span>
                  <span>•</span>
                  <span>{activeCandidate.yearsOfExperience || 2} Years Experience</span>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white border border-neutral-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Email</span>
                <span className="text-neutral-800 font-medium">
                  {activeCandidate.contactEmail || activeCandidate.email || 'Private / Managed'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Phone</span>
                <span className="text-neutral-800 font-medium">
                  {activeCandidate.phone || activeCandidate.phoneNumber || 'Available upon call'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Status</span>
                <span className="text-neutral-800 font-medium">{activeCandidate.availabilityStatus || 'Available'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">Registered</span>
                <span className="text-neutral-800 font-medium">{activeCandidate.registeredDate || 'Recent'}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(activeCandidate.skills) ? activeCandidate.skills : []).map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            {activeCandidate.bio && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Bio</span>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {activeCandidate.bio}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickViewModalOpen(false);
                    openEditModal(activeCandidate);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickViewModalOpen(false);
                    openDeleteModal(activeCandidate);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

              <Link
                to={`/admin/candidates/${activeCandidate.id}`}
                className="px-4 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Full Profile Dossier</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};

export default CandidatesPage;
