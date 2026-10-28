import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  LayoutList,
  Kanban,
  Search,
  RotateCcw,
  Calendar,
  Building,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  Video,
  FileText,
  MessageSquare,
  Plus,
  AlertTriangle,
  Play,
  Briefcase,
  Eye,
  Sparkles,
  ArrowRight,
  Filter,
  X,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import BackButton from '../../components/common/BackButton';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import ScoreBadge from '../../components/ranking/ScoreBadge';
import ScoreBreakdownModal from '../../components/ranking/ScoreBreakdownModal';
import { formatDate } from '../../utils/formatters';
import { calculateCandidateMatchScore } from '../../services/scoringEngine';
import { rankingService } from '../../services/rankingService';
import { applicationService } from '../../services/applicationService';
import { mockCandidates } from '../../data/mockCandidates';
import ProductionFeedbackModal from '../../components/feedback/ProductionFeedbackModal';
import ProductionFeedbackCard from '../../components/feedback/ProductionFeedbackCard';

import {
  getAllApplications,
  updateApplicationStatus,
  addApplicationInternalNote,
} from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';

// Kanban column definitions
const KANBAN_COLUMNS = [
  { key: 'applied', label: 'Applied', color: 'border-neutral-300 bg-neutral-50/50', badgeVariant: 'default' },
  { key: 'under_review', label: 'Under Review', color: 'border-sky-300 bg-sky-50/30', badgeVariant: 'info' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'border-amber-300 bg-amber-50/30', badgeVariant: 'warning' },
  { key: 'interview', label: 'Interview', color: 'border-purple-300 bg-purple-50/30', badgeVariant: 'primary' },
  { key: 'selected', label: 'Selected', color: 'border-emerald-300 bg-emerald-50/30', badgeVariant: 'success' },
  { key: 'not_selected', label: 'Not Selected', color: 'border-rose-300 bg-rose-50/30', badgeVariant: 'danger' },
];

// Quick Status Filter Tabs
const STATUS_TABS = [
  { key: 'all', label: 'All Submissions' },
  { key: 'applied', label: 'Applied' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview Callbacks' },
  { key: 'selected', label: 'Selected' },
  { key: 'not_selected', label: 'Not Selected' },
];

// Helper to normalize status into one of the 6 canonical columns
const normalizeStatus = (status) => {
  if (status === 'submitted' || status === 'applied') return 'applied';
  if (status === 'under_review') return 'under_review';
  if (status === 'shortlisted') return 'shortlisted';
  if (status === 'interview' || status === 'audition_requested') return 'interview';
  if (status === 'selected' || status === 'accepted') return 'selected';
  if (status === 'not_selected' || status === 'rejected') return 'not_selected';
  return 'applied';
};

const AdminApplicationsPage = () => {
  const [searchParams] = useSearchParams();
  const initialOpp = searchParams.get('opp') || 'all';

  // State
  const [applications, setApplications] = useState(() => getAllApplications());
  const [viewMode, setViewMode] = useState('table'); // default table view
  const [notification, setNotification] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedOpportunity, setSelectedOpportunity] = useState(initialOpp);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // Drawer / Details modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Score Breakdown modal state
  const [selectedScoreApp, setSelectedScoreApp] = useState(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  // Production Evaluation & Feedback modal state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Consequential Confirmation Modals
  const [isConfirmDecisionOpen, setIsConfirmDecisionOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null); // 'selected' | 'not_selected'
  const [decisionApp, setDecisionApp] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');

  // Interview Invitation Modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewApp, setInterviewApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('2026-10-22');
  const [interviewTime, setInterviewTime] = useState('14:00');
  const [interviewMode, setInterviewMode] = useState('In-Studio Chemistry Read');
  const [interviewPrepNotes, setInterviewPrepNotes] = useState('Prepare Scene 3 monologue and character slate.');

  // Note creation form state in drawer
  const [newNoteText, setNewNoteText] = useState('');

  // Drag and drop state
  const [draggedAppId, setDraggedAppId] = useState(null);

  // Enriched applications with match scores
  const enrichedApplications = useMemo(() => {
    return applications.map((app) => {
      if (app.match_score) return app;
      const cand = mockCandidates.find((c) => c.id === app.candidateId) || mockCandidates[0];
      const opp = mockOpportunities.find((o) => o.id === app.opportunityId) || mockOpportunities[0];
      const score = calculateCandidateMatchScore(cand, opp);
      return {
        ...app,
        candidate: {
          id: cand.id,
          fullName: cand.fullName,
          avatar: cand.avatar,
          headline: cand.headline,
          location: cand.location,
          skills: cand.skills || [],
          languages: cand.languages || [],
          yearsOfExperience: cand.yearsOfExperience || 2,
          availabilityStatus: cand.availabilityStatus || 'Available for Projects',
          portfolio: cand.portfolio || {},
          experienceCredits: cand.experience || [],
        },
        match_score: {
          total_score: score.totalScore,
          status: score.status,
          confidence_level: score.confidenceLevel,
          missing_fields: score.missingFields,
          improvement_suggestions: score.improvementSuggestions,
          calculation_summary: score.calculationSummary,
          breakdowns: score.breakdowns.map(b => ({
            criterion_key: b.criterionKey,
            criterion_name: b.criterionName,
            max_points: b.maxPoints,
            points_awarded: b.pointsAwarded,
            evidence_used: b.evidenceUsed,
            missing_or_uncertainty: b.missingOrUncertainty,
          })),
        },
      };
    });
  }, [applications]);

  // Initial database/API fetch & sync
  useEffect(() => {
    let isMounted = true;
    applicationService.getAll().then((data) => {
      if (isMounted && data && Array.isArray(data) && data.length > 0) {
        setApplications(data);
      }
    }).catch(() => {
      // offline fallback
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync latest applications
  const refreshApplications = async () => {
    try {
      const fresh = await applicationService.getAll();
      if (fresh && Array.isArray(fresh) && fresh.length > 0) {
        setApplications(fresh);
        if (selectedApp) {
          const updatedCurr = fresh.find((a) => a.id === selectedApp.id);
          if (updatedCurr) setSelectedApp(updatedCurr);
        }
        return;
      }
    } catch {
      // fallback
    }
    const fresh = getAllApplications();
    setApplications(fresh);
    if (selectedApp) {
      const updatedCurr = fresh.find((a) => a.id === selectedApp.id);
      if (updatedCurr) setSelectedApp(updatedCurr);
    }
  };

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Status counts for quick filter pills
  const statusCounts = useMemo(() => {
    const counts = { all: applications.length };
    KANBAN_COLUMNS.forEach((col) => {
      counts[col.key] = applications.filter((a) => normalizeStatus(a.status) === col.key).length;
    });
    return counts;
  }, [applications]);

  // Distinct Filter Options
  const uniqueOpportunities = useMemo(() => {
    const opps = mockOpportunities.map((o) => ({ id: o.id, title: o.title }));
    return opps;
  }, []);

  const uniqueLocations = useMemo(() => {
    const locs = Array.from(new Set(applications.map((a) => a.location).filter(Boolean)));
    return ['all', ...locs];
  }, [applications]);

  // Filtered List
  const filteredApplications = useMemo(() => {
    return enrichedApplications.filter((app) => {
      // 1. Search by candidate or role
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchCandidate = app.candidateName?.toLowerCase().includes(query);
        const matchRole = app.roleAppliedFor?.toLowerCase().includes(query);
        const matchOpp = app.opportunityTitle?.toLowerCase().includes(query);
        if (!matchCandidate && !matchRole && !matchOpp) return false;
      }

      // 2. Opportunity
      if (selectedOpportunity !== 'all') {
        if (app.opportunityId !== selectedOpportunity) return false;
      }

      // 3. Location
      if (selectedLocation !== 'all') {
        if (app.location !== selectedLocation) return false;
      }

      // 4. Status
      if (selectedStatus !== 'all') {
        if (normalizeStatus(app.status) !== selectedStatus) return false;
      }

      // 5. Date filter
      if (selectedDateRange !== 'all') {
        const appDate = new Date(app.appliedDate);
        const now = new Date('2026-10-13');
        const diffDays = (now - appDate) / (1000 * 60 * 60 * 24);
        if (selectedDateRange === '7' && diffDays > 7) return false;
        if (selectedDateRange === '14' && diffDays > 14) return false;
        if (selectedDateRange === '30' && diffDays > 30) return false;
      }

      return true;
    });
  }, [applications, search, selectedOpportunity, selectedLocation, selectedStatus, selectedDateRange]);

  const isFiltering =
    search.trim() !== '' ||
    selectedOpportunity !== 'all' ||
    selectedLocation !== 'all' ||
    selectedStatus !== 'all' ||
    selectedDateRange !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setSelectedOpportunity('all');
    setSelectedLocation('all');
    setSelectedStatus('all');
    setSelectedDateRange('all');
  };

  // Status Change Handlers
  const handleDirectStatusChange = async (app, newStatus, optionalNote = '') => {
    if (newStatus === 'selected' || newStatus === 'not_selected') {
      // Trigger confirmation modal for final decision
      setDecisionApp(app);
      setDecisionType(newStatus);
      setDecisionNote('');
      setIsConfirmDecisionOpen(true);
      return;
    }

    if (newStatus === 'interview') {
      // Trigger interview details modal
      setInterviewApp(app);
      setIsInterviewModalOpen(true);
      return;
    }

    // Normal transition (under_review, shortlisted, applied)
    await applicationService.updateStatus(app.id, newStatus, optionalNote);
    await refreshApplications();
    showToast(`Updated ${app.candidateName}’s status to "${newStatus.replace('_', ' ')}".`);
  };

  // Confirm Final Decision (Selected or Not Selected)
  const handleConfirmDecision = async () => {
    if (!decisionApp || !decisionType) return;

    await applicationService.updateStatus(decisionApp.id, decisionType, decisionNote);
    await refreshApplications();
    setIsConfirmDecisionOpen(false);

    showToast(
      decisionType === 'selected'
        ? `Marked ${decisionApp.candidateName} as Officially Selected!`
        : `Marked ${decisionApp.candidateName} as Not Selected.`
    );
    setDecisionApp(null);
    setDecisionType(null);
  };

  // Confirm Interview Invitation
  const handleConfirmInterview = async () => {
    if (!interviewApp) return;

    const interviewPayload = {
      interviewDetails: {
        date: interviewDate,
        time: interviewTime,
        mode: interviewMode,
        notes: interviewPrepNotes,
      },
      notes: `Audition interview scheduled for ${interviewDate} (${interviewMode}).`,
    };

    await applicationService.updateStatus(
      interviewApp.id,
      'interview',
      `Audition interview arranged for ${interviewDate}.`,
      interviewPayload
    );
    await refreshApplications();
    setIsInterviewModalOpen(false);
    showToast(`Interview recorded for ${interviewApp.candidateName} on ${interviewDate}.`);
    setInterviewApp(null);
  };

  // Add Internal Note in Details Drawer
  const handleAddInternalNote = async (e) => {
    e.preventDefault();
    if (!selectedApp || !newNoteText.trim()) return;

    await applicationService.addInternalNote(selectedApp.id, newNoteText.trim(), 'StageLink Admin');
    setNewNoteText('');
    await refreshApplications();
    showToast('Internal casting note recorded.');
  };

  // Drag and Drop
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnKey) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    const app = applications.find((a) => a.id === appId);
    if (app && normalizeStatus(app.status) !== targetColumnKey) {
      handleDirectStatusChange(app, targetColumnKey);
    }
    setDraggedAppId(null);
  };

  return (
    <PageContainer maxWidth="full" className="space-y-6 pb-12 text-left">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border bg-brand-navy text-white border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Top Navigation & Back Button */}
      <div className="flex items-center justify-between">
        <BackButton to="/admin/candidates" label="Back to Candidates" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
              Application & Audition Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
              {filteredApplications.length} Submissions
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            Audit performer self-tapes, move candidates through casting stages, record callbacks, and track hiring decisions.
          </p>
        </div>
      </div>

      {/* Quick Status Filter Tabs (Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.key;
          const count = statusCounts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatus(tab.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-navy text-white shadow-xs scale-[1.02]'
                  : 'bg-white border border-slate-200/90 text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Row 1: Search & Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidate name, role, or opportunity..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-brand-navy placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink focus:bg-white transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Opportunity Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedOpportunity}
              onChange={(e) => setSelectedOpportunity(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-brand-navy focus:outline-hidden focus:ring-2 focus:ring-brand-pink cursor-pointer"
            >
              <option value="all">All Opportunities</option>
              {uniqueOpportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title}
                </option>
              ))}
            </select>
          </div>

          {/* Location Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-brand-navy focus:outline-hidden focus:ring-2 focus:ring-brand-pink cursor-pointer"
            >
              <option value="all">All Locations</option>
              {uniqueLocations.filter((l) => l !== 'all').map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-brand-navy focus:outline-hidden focus:ring-2 focus:ring-brand-pink cursor-pointer"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 Days</option>
              <option value="14">Last 14 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Reset Filter Button */}
        {isFiltering && (
          <div className="flex items-center justify-between pt-1 text-xs border-t border-slate-100">
            <span className="text-slate-500">
              Filtered to <strong className="text-brand-navy">{filteredApplications.length}</strong> matching candidates
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-brand-pink hover:text-brand-pink-dark font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: KANBAN BOARD VIEW
      ========================================================================= */}
      {viewMode === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-[1100px]">
            {KANBAN_COLUMNS.map((col) => {
              const columnApps = filteredApplications.filter(
                (app) => normalizeStatus(app.status) === col.key
              );

              return (
                <div
                  key={col.key}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.key)}
                  className={`flex flex-col rounded-2xl border ${col.color} p-3.5 min-h-[520px] transition-colors`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-serif text-brand-navy uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-white border border-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center">
                        {columnApps.length}
                      </span>
                    </div>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[720px] pr-1">
                    {columnApps.length === 0 ? (
                      <div className="h-32 border-2 border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-center p-3 text-[11px] text-neutral-400">
                        Drag applications here or change status
                      </div>
                    ) : (
                      columnApps.map((app) => (
                        <div
                          key={app.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          className="bg-white rounded-xl border border-neutral-200 p-3.5 shadow-2xs hover:shadow-subtle transition-all cursor-grab active:cursor-grabbing space-y-2.5 group"
                        >
                          {/* Top: Candidate Avatar & Name */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Avatar
                                src={app.candidateAvatar}
                                name={app.candidateName}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <Link
                                  to={`/admin/candidates/${app.candidateId}`}
                                  className="text-xs font-bold text-brand-navy hover:text-brand-pink truncate block"
                                >
                                  {app.candidateName}
                                </Link>
                                <p className="text-[10px] text-neutral-400 truncate">
                                  {app.candidateLocation || app.location}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedApp(app);
                                setIsDetailsOpen(true);
                              }}
                              className="text-neutral-400 hover:text-brand-navy p-1 rounded-md hover:bg-neutral-100 transition-colors"
                              title="View Full Application Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Role & Opportunity */}
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-semibold text-brand-pink">
                              Role: {app.roleAppliedFor}
                            </h4>
                            <p className="text-[11px] text-brand-navy font-medium truncate">
                              {app.opportunityTitle}
                            </p>
                            <p className="text-[10px] text-neutral-500 truncate flex items-center gap-1">
                              <Building className="w-2.5 h-2.5" />
                              <span>{app.productionCompany}</span>
                            </p>
                          </div>

                          {/* Footer: Date, Match Score & Status Badge */}
                          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 text-[10px]">
                            <span className="text-neutral-400 font-mono">
                              {formatDate(app.appliedDate)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <ScoreBadge
                                score={app.match_score?.total_score ?? app.match_score}
                                size="sm"
                                onClick={() => {
                                  setSelectedScoreApp(app);
                                  setIsScoreModalOpen(true);
                                }}
                              />
                              <ApplicationStatusBadge status={app.status} />
                            </div>
                          </div>

                          {/* Accessible button-based status transition control */}
                          <div className="pt-1.5 flex items-center justify-between gap-1.5 text-[10px]">
                            <select
                              aria-label="Move application status"
                              value={normalizeStatus(app.status)}
                              onChange={(e) =>
                                handleDirectStatusChange(app, e.target.value)
                              }
                              className="w-full text-[10px] font-semibold py-1 px-1.5 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-white cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-brand-pink"
                            >
                              <option value="applied">Move to: Applied</option>
                              <option value="under_review">Move to: Under Review</option>
                              <option value="shortlisted">Move to: Shortlisted</option>
                              <option value="interview">Move to: Interview</option>
                              <option value="selected">Move to: Selected</option>
                              <option value="not_selected">Move to: Not Selected</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: TABLE VIEW
      ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-neutral-300" />
              <h3 className="text-base font-bold text-brand-navy font-serif">
                No applications match your filter criteria
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Try clearing search terms or selecting "All Opportunities" to view the full pipeline.
              </p>
              <Button size="sm" variant="outline" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-3">Role & Production</th>
                    <th className="py-3.5 px-3">Match Score</th>
                    <th className="py-3.5 px-3">Location</th>
                    <th className="py-3.5 px-3">Applied Date</th>
                    <th className="py-3.5 px-3">Stage / Status</th>
                    <th className="py-3.5 px-3">Move Stage</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Candidate */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            src={app.candidateAvatar}
                            name={app.candidateName}
                            size="md"
                          />
                          <div>
                            <Link
                              to={`/admin/candidates/${app.candidateId}`}
                              className="font-bold text-brand-navy hover:text-brand-pink"
                            >
                              {app.candidateName}
                            </Link>
                            <p className="text-[11px] text-neutral-400">
                              {app.candidateExperience || 'Screen Artist'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Opportunity */}
                      <td className="py-3 px-3">
                        <p className="font-semibold text-brand-pink">
                          {app.roleAppliedFor}
                        </p>
                        <p className="text-[11px] text-brand-navy font-medium">
                          {app.opportunityTitle}
                        </p>
                        <p className="text-[10px] text-neutral-500">
                          {app.productionCompany}
                        </p>
                      </td>

                      {/* Match Score */}
                      <td className="py-3 px-3">
                        <ScoreBadge
                          score={app.match_score?.total_score ?? app.match_score}
                          size="sm"
                          onClick={() => {
                            setSelectedScoreApp(app);
                            setIsScoreModalOpen(true);
                          }}
                        />
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3 text-neutral-600">
                        {app.location || '—'}
                      </td>

                      {/* Applied Date */}
                      <td className="py-3 px-3 font-mono text-neutral-500">
                        {formatDate(app.appliedDate)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <ApplicationStatusBadge status={app.status} />
                      </td>

                      {/* Accessible quick stage selector */}
                      <td className="py-3 px-3">
                        <select
                          aria-label="Change status"
                          value={normalizeStatus(app.status)}
                          onChange={(e) =>
                            handleDirectStatusChange(app, e.target.value)
                          }
                          className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-brand-pink cursor-pointer shadow-2xs"
                        >
                          <option value="applied">Applied</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="selected">Selected</option>
                          <option value="not_selected">Not Selected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApp(app);
                              setIsDetailsOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-brand-navy text-[11px] font-semibold shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Details</span>
                          </button>

                          <Link
                            to={`/admin/messages?candidateId=${app.candidateId}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-pink hover:bg-slate-100 transition-colors"
                            title="Direct Platform Message"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          APPLICATION DETAILS MODAL / DRAWER
      ========================================================================= */}
      <Modal
        isOpen={isDetailsOpen && Boolean(selectedApp)}
        onClose={() => setIsDetailsOpen(false)}
        title={selectedApp ? `Application #${selectedApp.id} — ${selectedApp.candidateName}` : 'Application Details'}
        size="xl"
      >
        {selectedApp && (
          <div className="p-6 space-y-6 text-xs text-left max-h-[82vh] overflow-y-auto">
            {/* Top Overview Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedApp.candidateAvatar}
                  name={selectedApp.candidateName}
                  size="lg"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-brand-navy font-serif">
                      {selectedApp.candidateName}
                    </h2>
                    <ApplicationStatusBadge status={selectedApp.status} />
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Applying for: <strong className="text-brand-pink">{selectedApp.roleAppliedFor}</strong> in {selectedApp.opportunityTitle}
                  </p>
                  <p className="text-[10px] text-neutral-400">
                    Production: {selectedApp.productionCompany} • Shoot Location: {selectedApp.location}
                  </p>
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/admin/candidates/${selectedApp.candidateId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 text-brand-navy hover:bg-white text-xs font-semibold shadow-2xs transition-all"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Full Profile</span>
                </Link>

                <Link
                  to={`/admin/messages?candidateId=${selectedApp.candidateId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-pink text-white hover:bg-brand-pink-dark text-xs font-semibold shadow-2xs transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Platform Chat</span>
                </Link>
              </div>
            </div>

            {/* Match Score Assessment */}
            {selectedApp.match_score && (
              <div className="p-4 rounded-2xl border border-neutral-200 bg-linear-to-r from-neutral-50 to-pink-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Role-Specific Match Score
                  </span>
                  <div className="flex items-center gap-2.5">
                    <ScoreBadge
                      score={selectedApp.match_score?.total_score ?? selectedApp.match_score}
                      size="md"
                      onClick={() => {
                        setSelectedScoreApp(selectedApp);
                        setIsScoreModalOpen(true);
                      }}
                    />
                    <p className="text-xs text-neutral-600">
                      {selectedApp.match_score.status === 'insufficient_data'
                        ? 'Candidate profile is missing required information for a full rating.'
                        : `Evaluated against role specifications (${selectedApp.match_score.confidence_level} confidence).`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedScoreApp(selectedApp);
                    setIsScoreModalOpen(true);
                  }}
                  className="text-xs shrink-0 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-pink" />
                  Inspect Breakdown
                </Button>
              </div>
            )}

            {/* STUDIO AUDITION & PRODUCTION EVALUATION */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Studio Audition & Performance Rating
                  </span>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Evaluate {selectedApp.candidateName}&apos;s audition tape / performance submission with 1–5 stars and feedback.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="text-xs bg-black hover:bg-neutral-800 text-white shrink-0 self-start sm:self-auto gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>
                    {selectedApp.production_feedback || selectedApp.productionFeedback
                      ? 'Edit Audition Rating'
                      : 'Evaluate / Rate Submission'}
                  </span>
                </Button>
              </div>

              {(selectedApp.production_feedback || selectedApp.productionFeedback) && (
                <ProductionFeedbackCard
                  feedback={selectedApp.production_feedback || selectedApp.productionFeedback}
                  className="border-neutral-200/80 bg-neutral-50/50"
                />
              )}
            </div>

            {/* Quick Status Action Bar */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Audited Casting Decisions & Stage Movement
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirectStatusChange(selectedApp, 'under_review')}
                  className="text-xs"
                >
                  Mark Under Review
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDirectStatusChange(selectedApp, 'shortlisted')}
                  className="text-xs"
                >
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDirectStatusChange(selectedApp, 'interview')}
                  className="text-xs border-purple-300 text-purple-900 bg-purple-50/50 hover:bg-purple-100"
                >
                  Record Interview Callback
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleDirectStatusChange(selectedApp, 'selected')}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Mark Selected
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDirectStatusChange(selectedApp, 'not_selected')}
                  className="text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Not Selected
                </Button>
              </div>
            </div>

            {/* Grid: Details, Materials & Cover Message */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cover Message & Pitch */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-2">
                <h3 className="font-bold font-serif text-brand-navy flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-brand-pink" />
                  <span>Candidate Cover Message</span>
                </h3>
                <p className="text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100 italic">
                  "{selectedApp.coverMessage || 'No personalized cover message submitted.'}"
                </p>
              </div>

              {/* Submitted Materials */}
              <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-2.5">
                <h3 className="font-bold font-serif text-brand-navy flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-brand-pink" />
                  <span>Submitted Audition Materials</span>
                </h3>

                <div className="space-y-2">
                  {/* Headshot reference */}
                  {selectedApp.submittedMaterials?.headshot && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 bg-neutral-50">
                      <div className="flex items-center gap-2">
                        <img
                          src={selectedApp.submittedMaterials.headshot}
                          alt="Audition Headshot"
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-semibold text-brand-navy block">Primary Headshot Photo</span>
                          <span className="text-[10px] text-neutral-400">High-Resolution Theatrical</span>
                        </div>
                      </div>
                      <a
                        href={selectedApp.submittedMaterials.headshot}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-pink font-semibold hover:underline text-[11px]"
                      >
                        View Full
                      </a>
                    </div>
                  )}

                  {/* Resume reference */}
                  {selectedApp.submittedMaterials?.resume && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 bg-neutral-50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-brand-pink" />
                        <div>
                          <span className="font-semibold text-brand-navy block">
                            {selectedApp.submittedMaterials.resume.fileName}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {selectedApp.submittedMaterials.resume.fileSize}
                          </span>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                        Attached
                      </span>
                    </div>
                  )}

                  {/* Video Reel reference */}
                  {selectedApp.submittedMaterials?.videoAudition && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 bg-neutral-50">
                      <div className="flex items-center gap-2">
                        <Video className="w-5 h-5 text-purple-600" />
                        <div>
                          <span className="font-semibold text-brand-navy block">
                            {selectedApp.submittedMaterials.videoAudition.title}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            Duration: {selectedApp.submittedMaterials.videoAudition.duration}
                          </span>
                        </div>
                      </div>
                      <a
                        href={selectedApp.submittedMaterials.videoAudition.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 font-semibold hover:underline text-[11px] inline-flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Watch Tape
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scheduled Interview Details if present */}
            {selectedApp.interviewDetails && (
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-950 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold uppercase tracking-wider text-[11px] text-purple-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>Scheduled Callback / Audition Interview</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900 font-bold text-[10px]">
                    Confirmed Slot
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div>
                    <span className="text-purple-700 block text-[10px]">Date & Time:</span>
                    <strong className="text-purple-900">
                      {selectedApp.interviewDetails.date} at {selectedApp.interviewDetails.time}
                    </strong>
                  </div>
                  <div>
                    <span className="text-purple-700 block text-[10px]">Format:</span>
                    <strong className="text-purple-900">{selectedApp.interviewDetails.mode}</strong>
                  </div>
                  <div>
                    <span className="text-purple-700 block text-[10px]">Preparation:</span>
                    <strong className="text-purple-900">
                      {selectedApp.interviewDetails.notes || 'Scene study'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Application Timeline & Previous Status Changes */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
              <h3 className="font-bold font-serif text-brand-navy flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-pink" />
                <span>Status Change Audit History & Timeline</span>
              </h3>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 pl-8">
                {(selectedApp.statusHistory || []).map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-8 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-brand-pink flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-pink" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-navy uppercase text-[10px]">
                          {step.status.replace('_', ' ')}
                        </span>
                        <span className="text-neutral-400 font-mono text-[10px]">
                          {formatDate(step.changedAt)}
                        </span>
                      </div>
                      <p className="text-neutral-600 text-[11px]">{step.note}</p>
                      <p className="text-[10px] text-neutral-400">By: {step.changedBy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Internal Notes Section */}
            <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
              <h3 className="font-bold font-serif text-brand-navy flex items-center justify-between">
                <span>Internal Casting Team Notes</span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {(selectedApp.internalNotes || []).length} notes
                </span>
              </h3>

              {/* Add Note Input */}
              <form onSubmit={handleAddInternalNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Add private casting review note (e.g. Great vocal resonance, confirm availability)..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50 text-brand-navy focus:outline-hidden focus:ring-1 focus:ring-brand-pink focus:bg-white"
                />
                <Button size="sm" variant="primary" type="submit" disabled={!newNoteText.trim()}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Note
                </Button>
              </form>

              {/* Existing notes list */}
              <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
                {(selectedApp.internalNotes || []).length === 0 ? (
                  <p className="text-[11px] text-neutral-400 italic">No internal notes added yet.</p>
                ) : (
                  (selectedApp.internalNotes || []).map((note) => (
                    <div key={note.id} className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                      <p className="text-neutral-700 text-xs">{note.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400">
                        <span>{note.author}</span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          MODAL: CONFIRM FINAL DECISION (SELECTED / NOT SELECTED)
      ========================================================================= */}
      <Modal
        isOpen={isConfirmDecisionOpen && Boolean(decisionApp)}
        onClose={() => setIsConfirmDecisionOpen(false)}
        title={
          decisionType === 'selected'
            ? 'Confirm Final Selection Decision'
            : 'Confirm Not Selected Status'
        }
        size="md"
      >
        <div className="p-6 space-y-4 text-xs text-left">
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
              decisionType === 'selected'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 shrink-0 ${
                decisionType === 'selected' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            />
            <div className="space-y-1">
              <h4 className="font-bold">
                {decisionType === 'selected'
                  ? `Select ${decisionApp?.candidateName} for Role`
                  : `Mark ${decisionApp?.candidateName} as Not Selected`}
              </h4>
              <p>
                {decisionType === 'selected'
                  ? `Are you sure you want to mark ${decisionApp?.candidateName} as Selected for "${decisionApp?.roleAppliedFor}"? This records the final casting hire internally.`
                  : `Are you sure you want to mark ${decisionApp?.candidateName} as Not Selected for this casting opportunity?`}
              </p>
            </div>
          </div>

          <p className="text-neutral-500 italic">
            * Note: In demo mode, external emails are not sent automatically. The decision will be recorded in the shared mock application state and appear on the performer's portal.
          </p>

          <div className="space-y-1.5">
            <label className="font-semibold text-brand-navy block">
              Internal Audit / Decision Note (Optional)
            </label>
            <textarea
              rows={2}
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="e.g. Unanimously approved by producers; formal contract negotiations to begin."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-brand-navy focus:outline-hidden focus:ring-1 focus:ring-brand-pink"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmDecisionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={decisionType === 'selected' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleConfirmDecision}
            >
              {decisionType === 'selected' ? 'Confirm Selection' : 'Confirm Not Selected'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL: RECORD INTERVIEW INVITATION
      ========================================================================= */}
      <Modal
        isOpen={isInterviewModalOpen && Boolean(interviewApp)}
        onClose={() => setIsInterviewModalOpen(false)}
        title={`Record Interview / Audition Callback — ${interviewApp?.candidateName}`}
        size="md"
      >
        <div className="p-6 space-y-4 text-xs text-left">
          <p className="text-neutral-600">
            Record the scheduled interview callback details for{' '}
            <strong>{interviewApp?.candidateName}</strong> for role{' '}
            <strong>{interviewApp?.roleAppliedFor}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-brand-navy block">Callback Date *</label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-brand-navy focus:outline-hidden focus:ring-1 focus:ring-brand-pink"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-brand-navy block">Callback Time *</label>
              <input
                type="text"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                placeholder="14:30 IST / GMT"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-brand-navy focus:outline-hidden focus:ring-1 focus:ring-brand-pink"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-brand-navy block">Interview / Audition Mode *</label>
            <input
              type="text"
              value={interviewMode}
              onChange={(e) => setInterviewMode(e.target.value)}
              placeholder="e.g. In-Studio Chemistry Read / Virtual Callback"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-brand-navy focus:outline-hidden focus:ring-1 focus:ring-brand-pink"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-brand-navy block">Preparation Notes for Performer</label>
            <textarea
              rows={2}
              value={interviewPrepNotes}
              onChange={(e) => setInterviewPrepNotes(e.target.value)}
              placeholder="e.g. Prepare Scene 3 monologue; cold reading script will be provided at the studio."
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-white text-brand-navy focus:outline-hidden focus:ring-1 focus:ring-brand-pink"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInterviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmInterview}
            >
              Save Interview Schedule
            </Button>
          </div>
        </div>
      </Modal>

      {/* SCORE BREAKDOWN MODAL */}
      {isScoreModalOpen && selectedScoreApp && (
        <ScoreBreakdownModal
          isOpen={isScoreModalOpen}
          onClose={() => {
            setIsScoreModalOpen(false);
            setSelectedScoreApp(null);
          }}
          application={selectedScoreApp}
          onRecalculate={async (appId) => {
            try {
              const res = await rankingService.recalculateMatchScore(appId);
              if (res && res.match_score) {
                setApplications((prev) =>
                  prev.map((a) => (a.id === appId ? { ...a, match_score: res.match_score } : a))
                );
              }
              showToast('Candidate match score recalculated using latest role criteria.');
            } catch (err) {
              console.error(err);
              showToast('Score refreshed with current criteria.');
            }
          }}
        />
      )}

      {/* STUDIO PRODUCTION & AUDITION FEEDBACK MODAL */}
      {selectedApp && (
        <ProductionFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          applicationId={selectedApp.id}
          candidateId={selectedApp.candidateId}
          candidateName={selectedApp.candidateName}
          productionCompany={selectedApp.productionCompany}
          opportunityTitle={selectedApp.opportunityTitle}
          roleTitle={selectedApp.roleAppliedFor}
          existingFeedback={selectedApp.production_feedback || selectedApp.productionFeedback}
          onFeedbackSaved={(newFb) => {
            setSelectedApp((prev) => ({
              ...prev,
              production_feedback: newFb,
              productionFeedback: newFb,
            }));
            setApplications((prev) =>
              prev.map((a) =>
                a.id === selectedApp.id
                  ? { ...a, production_feedback: newFb, productionFeedback: newFb }
                  : a
              )
            );
            showToast(`Audition evaluation and rating saved for ${selectedApp.candidateName}`);
          }}
        />
      )}
    </PageContainer>
  );
};

export default AdminApplicationsPage;
