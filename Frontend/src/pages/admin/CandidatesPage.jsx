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
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Avatar from '../../components/common/Avatar';
import CandidateAccessLock from '../../components/common/CandidateAccessLock';
import { hasCompletedPostingPayment, EVENT_PAYMENT_STATE_CHANGED } from '../../utils/paymentAccess';
import { getCandidatesList } from '../../data/mockCandidates';

const PAGE_SIZE = 5;

const LOCATION_OPTIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'mumbai', label: 'Mumbai, India' },
  { value: 'london', label: 'London, UK' },
  { value: 'new york', label: 'New York, NY' },
  { value: 'los angeles', label: 'Los Angeles, CA' },
  { value: 'toronto', label: 'Toronto, Canada' },
  { value: 'berlin', label: 'Berlin, Germany' },
  { value: 'paris', label: 'Paris, France' },
  { value: 'delhi', label: 'Delhi, India' },
  { value: 'dublin', label: 'Dublin, Ireland' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'all', label: 'All Experience Levels' },
  { value: 'junior', label: '1 - 2 Years (Junior)' },
  { value: 'mid', label: '3 - 5 Years (Mid-Level)' },
  { value: 'senior', label: '6+ Years (Senior)' },
];

const SKILL_OPTIONS = [
  { value: 'all', label: 'All Skills' },
  { value: 'method acting', label: 'Method Acting' },
  { value: 'screen combat', label: 'Screen Combat' },
  { value: 'action stunts', label: 'Action Stunts' },
  { value: 'kathak dance', label: 'Kathak Dance' },
  { value: 'contemporary dance', label: 'Contemporary Dance' },
  { value: 'high-fashion runway', label: 'High-Fashion Runway' },
  { value: 'musical theatre', label: 'Musical Theatre' },
  { value: 'voice acting', label: 'Voice Acting' },
  { value: 'improv comedy', label: 'Improv Comedy' },
  { value: 'physical theatre', label: 'Physical Theatre' },
];

const VERIFICATION_OPTIONS = [
  { value: 'all', label: 'All Verification Statuses' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'unverified', label: 'Unverified' },
];

const CandidatesPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [hasPaid, setHasPaid] = useState(() => hasCompletedPostingPayment());

  useEffect(() => {
    const checkPayment = () => setHasPaid(hasCompletedPostingPayment());
    window.addEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
    window.addEventListener('storage', checkPayment);
    return () => {
      window.removeEventListener(EVENT_PAYMENT_STATE_CHANGED, checkPayment);
      window.removeEventListener('storage', checkPayment);
    };
  }, []);

  const [candidates] = useState(() => getCandidatesList());
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);

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

      // 4. Skills Filter
      if (selectedSkill !== 'all') {
        const hasSkill = c.skills?.some((s) =>
          s.toLowerCase().includes(selectedSkill.toLowerCase())
        );
        if (!hasSkill) return false;
      }

      // 5. Verification Status Filter
      if (selectedVerification !== 'all') {
        if (c.verificationStatus !== selectedVerification) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, search, selectedLocation, selectedExperience, selectedSkill, selectedVerification]);

  // Reset page when filters change
  const handleFilterChange = (setter, val) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedLocation('all');
    setSelectedExperience('all');
    setSelectedSkill('all');
    setSelectedVerification('all');
    setCurrentPage(1);
  };

  const isFiltering =
    search.trim() !== '' ||
    selectedLocation !== 'all' ||
    selectedExperience !== 'all' ||
    selectedSkill !== 'all' ||
    selectedVerification !== 'all';

  // Pagination calculation
  const totalPages = Math.ceil(filteredCandidates.length / PAGE_SIZE) || 1;
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredCandidates.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCandidates, currentPage]);

  const renderVerificationBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified</span>
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Review</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200">
            <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>Unverified</span>
          </span>
        );
    }
  };

  if (!hasPaid) {
    return (
      <PageContainer maxWidth="7xl" className="space-y-6 text-left pb-12">
        <div className="space-y-1 pb-2 border-b border-neutral-200/80">
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight">
            Candidate &amp; Talent Directory
          </h1>
          <p className="text-xs text-neutral-500">
            Browse, search, and discover verified performer profiles across StageLink.
          </p>
        </div>
        <CandidateAccessLock
          title="Candidate Profiles are Locked"
          subtitle="You must announce work and complete the posting payment via JuicePay Credit Card or PayPal to view performer profiles and contact details."
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl" className="space-y-6 text-left pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-black tracking-tight">
              Candidate & Talent Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-200">
              {filteredCandidates.length} performers
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Search, verify, review, and shortlist actors, dancers, models, and performing artists.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFiltering && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-xs space-y-3">
        {/* Row 1: Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            placeholder="Search candidate by name, headline, skill, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black focus:bg-white transition-all"
          />
        </div>

        {/* Row 2: Filter Select Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Location */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => handleFilterChange(setSelectedLocation, e.target.value)}
              className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black cursor-pointer"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              Experience
            </label>
            <select
              value={selectedExperience}
              onChange={(e) => handleFilterChange(setSelectedExperience, e.target.value)}
              className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black cursor-pointer"
            >
              {EXPERIENCE_OPTIONS.map((exp) => (
                <option key={exp.value} value={exp.value}>
                  {exp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              Primary Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => handleFilterChange(setSelectedSkill, e.target.value)}
              className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black cursor-pointer"
            >
              {SKILL_OPTIONS.map((sk) => (
                <option key={sk.value} value={sk.value}>
                  {sk.label}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
              Verification Status
            </label>
            <select
              value={selectedVerification}
              onChange={(e) => handleFilterChange(setSelectedVerification, e.target.value)}
              className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-black focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black cursor-pointer"
            >
              {VERIFICATION_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Denser Admin Candidate Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-black font-serif">No candidates match your filters</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Try adjusting your search keyword or clearing location and verification status filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                <tr>
                  <th className="py-3.5 px-4">Candidate Name</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Experience</th>
                  <th className="py-3.5 px-3">Skills</th>
                  <th className="py-3.5 px-3">Profile Completion</th>
                  <th className="py-3.5 px-3">Verification</th>
                  <th className="py-3.5 px-3">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {paginatedCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Candidate */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={candidate.avatar} name={candidate.fullName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              to={`/admin/candidates/${candidate.id}`}
                              className="font-bold text-sm text-black hover:underline truncate max-w-[170px]"
                            >
                              {candidate.fullName}
                            </Link>
                            {candidate.contactPermissionGranted ? (
                              <span title="Contact permission granted" className="text-emerald-600">
                                <Mail className="w-3 h-3" />
                              </span>
                            ) : (
                              <span title="Private contact protected" className="text-neutral-400">
                                <Lock className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 truncate block max-w-[200px]">
                            {candidate.headline}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-neutral-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span>{candidate.location.split('/')[0].trim()}</span>
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-black">{candidate.yearsOfExperience} yrs</span>
                      <span className="text-[10px] text-neutral-500 block">
                        {candidate.experienceLevel.split('/')[0].trim()}
                      </span>
                    </td>

                    {/* Skills */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {candidate.skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px] font-semibold whitespace-nowrap"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-500 text-[10px] font-bold">
                            +{candidate.skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Profile Completion */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              candidate.profileCompletion >= 85
                                ? 'bg-emerald-600'
                                : candidate.profileCompletion >= 60
                                ? 'bg-amber-500'
                                : 'bg-neutral-400'
                            }`}
                            style={{ width: `${candidate.profileCompletion}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-black">
                          {candidate.profileCompletion}%
                        </span>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {renderVerificationBadge(candidate.verificationStatus)}
                    </td>

                    {/* Registration Date */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-neutral-600 font-medium">
                      {candidate.registeredDate}
                    </td>

                    {/* View Profile Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/candidates/${candidate.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination & Status Footer */}
        {filteredCandidates.length > 0 && (
          <div className="p-4 border-t border-neutral-200 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-neutral-500 font-medium">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{' '}
              {Math.min(currentPage * PAGE_SIZE, filteredCandidates.length)} of{' '}
              <strong className="text-black">{filteredCandidates.length}</strong> candidates
            </span>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-black font-bold text-xs disabled:opacity-30 hover:bg-neutral-100 flex items-center gap-1"
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
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
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
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white text-black font-bold text-xs disabled:opacity-30 hover:bg-neutral-100 flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default CandidatesPage;
