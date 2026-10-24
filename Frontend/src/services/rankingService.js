import { mockApplications, getAllApplications, updateApplicationStatus } from '../data/mockApplications';
import { mockOpportunities } from '../data/mockOpportunities';
import { mockCandidates } from '../data/mockCandidates';
import { calculateCandidateMatchScore } from './scoringEngine';
import { API_BASE, apiRequest } from './api';

// Local storage key for shortlists
const SHORTLIST_STORAGE_KEY = 'starcast_shortlisted_apps';

export const getStoredShortlists = () => {
  try {
    const raw = localStorage.getItem(SHORTLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ['app-1', 'app-3', 'app-7'];
  } catch {
    return ['app-1', 'app-3', 'app-7'];
  }
};

export const setStoredShortlists = (ids) => {
  try {
    localStorage.setItem(SHORTLIST_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save shortlist state:', e);
  }
};

export const rankingService = {
  /**
   * Fetch ranked candidates for an opportunity
   */
  getRankedCandidates: async (opportunityId, params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.skill && params.skill !== 'all') query.set('skill', params.skill);
    if (params.language && params.language !== 'all') query.set('language', params.language);
    if (params.location && params.location !== 'all') query.set('location', params.location);
    if (params.availability && params.availability !== 'all') query.set('availability', params.availability);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.sortBy) query.set('sort_by', params.sortBy);
    if (params.page) query.set('page', params.page);
    if (params.pageSize) query.set('page_size', params.pageSize);

    try {
      const res = await apiRequest(`/api/ranking/opportunities/${opportunityId}/?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.applications) {
          return {
            opportunity: data.results.opportunity,
            applications: data.results.applications,
            count: data.count || data.results.applications.length,
            totalPages: Math.ceil((data.count || data.results.applications.length) / (params.pageSize || 10)),
            currentPage: params.page || 1,
            isBackend: true,
          };
        }
      }
    } catch (err) {
      console.warn('Backend ranked-candidates fetch fallback to client-side scoring engine:', err);
    }

    // Fallback: Client-Side Scoring Engine
    return rankingService.getClientSideRankedCandidates(opportunityId, params);
  },

  /**
   * Client-side fallback ranking computation
   */
  getClientSideRankedCandidates: (opportunityId, params = {}) => {
    const opp = mockOpportunities.find(o => o.id === opportunityId) || mockOpportunities[0];
    const allApps = getAllApplications();
    const shortlistedIds = getStoredShortlists();

    // Filter to this opportunity or all if 'all'
    let relevantApps = opportunityId === 'all' ? allApps : allApps.filter(a => a.opportunityId === opportunityId);

    // If no applications exist for this opportunity, synthesize mock candidate applications so recruiter can review candidates
    if (relevantApps.length === 0) {
      relevantApps = mockCandidates.slice(0, 4).map((cand, idx) => ({
        id: `mock-app-${opp.id}-${cand.id}`,
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        productionCompany: opp.productionCompany,
        location: opp.location,
        candidateId: cand.id,
        candidateName: cand.fullName,
        candidateAvatar: cand.avatar,
        candidateHeadline: cand.headline,
        candidateLocation: cand.location,
        candidateExperience: cand.experienceLevel || `${cand.yearsOfExperience || 2}+ Years`,
        roleAppliedFor: opp.roles?.[0]?.name || opp.title,
        status: idx === 0 ? 'shortlisted' : 'submitted',
        appliedDate: '2026-10-12',
        coverMessage: `Applying for ${opp.title}. Enclosed is my complete acting portfolio and credits.`,
        submittedMaterials: {
          headshot: cand.avatar,
          videoAudition: { title: 'Callback Slate', url: 'https://vimeo.com/76979871' },
          resume: { fileName: `${cand.fullName.replace(/\s+/g, '_')}_CV.pdf`, fileSize: '1.8 MB' },
        },
        statusHistory: [{ status: 'submitted', changedAt: '2026-10-12T10:00:00Z', note: 'Application submitted.' }],
        internalNotes: [],
      }));
    }

    // Augment with Candidate data and dynamically calculate transparent match scores
    const enriched = relevantApps.map(app => {
      const cand = mockCandidates.find(c => c.id === app.candidateId) || {
        id: app.candidateId,
        fullName: app.candidateName,
        headline: app.candidateHeadline,
        location: app.candidateLocation,
        avatar: app.candidateAvatar,
        skills: ['Acting', 'Dialogue Delivery'],
        languages: ['Hindi', 'English'],
        yearsOfExperience: 3,
        profileCompletion: 80,
      };

      const matchScore = calculateCandidateMatchScore(cand, opp);
      const isShortlisted = shortlistedIds.includes(app.id) || app.status === 'shortlisted';

      return {
        ...app,
        candidate: {
          id: cand.id,
          fullName: cand.fullName,
          headline: cand.headline,
          location: cand.location,
          avatar: cand.avatar || app.candidateAvatar,
          talentCategories: cand.categories || ['Actor'],
          skills: cand.skills || [],
          languages: cand.languages || ['Hindi', 'English'],
          yearsOfExperience: cand.yearsOfExperience || 2,
          experienceLevel: cand.experienceLevel || `${cand.yearsOfExperience || 2}+ Years`,
          availabilityStatus: cand.availability || cand.availabilityStatus || 'Available for Projects',
          travelStatus: cand.travelStatus || 'Open to travel internationally',
          portfolio: cand.portfolio || {},
          experienceCredits: cand.experience || [],
          profileCompleteness: cand.profileCompletion || 75,
        },
        match_score: {
          total_score: matchScore.totalScore,
          status: matchScore.status,
          confidence_level: matchScore.confidenceLevel,
          missing_fields: matchScore.missingFields,
          improvement_suggestions: matchScore.improvementSuggestions,
          calculation_summary: matchScore.calculationSummary,
          calculated_at: matchScore.calculatedAt,
          breakdowns: matchScore.breakdowns.map(b => ({
            criterion_key: b.criterionKey,
            criterion_name: b.criterionName,
            max_points: b.maxPoints,
            points_awarded: b.pointsAwarded,
            evidence_used: b.evidenceUsed,
            missing_or_uncertainty: b.missingOrUncertainty,
          })),
        },
        is_shortlisted: isShortlisted,
      };
    });

    // Apply Filters
    let filtered = enriched.filter(app => {
      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase();
        const mName = (app.candidate?.fullName || '').toLowerCase().includes(q);
        const mRole = (app.roleAppliedFor || '').toLowerCase().includes(q);
        const mSkill = (app.candidate?.skills || []).some(s => s.toLowerCase().includes(q));
        if (!mName && !mRole && !mSkill) return false;
      }

      if (params.category && params.category !== 'all') {
        const cats = app.candidate?.talentCategories || [];
        if (!cats.some(c => c.toLowerCase().includes(params.category.toLowerCase()))) return false;
      }

      if (params.skill && params.skill !== 'all') {
        const skills = app.candidate?.skills || [];
        if (!skills.some(s => s.toLowerCase().includes(params.skill.toLowerCase()))) return false;
      }

      if (params.language && params.language !== 'all') {
        const langs = app.candidate?.languages || [];
        if (!langs.some(l => l.toLowerCase().includes(params.language.toLowerCase()))) return false;
      }

      if (params.location && params.location !== 'all') {
        if (!((app.candidate?.location || '').toLowerCase().includes(params.location.toLowerCase()))) return false;
      }

      if (params.availability && params.availability !== 'all') {
        const av = (app.candidate?.availabilityStatus || '').toLowerCase();
        if (!av.includes(params.availability.toLowerCase())) return false;
      }

      if (params.status && params.status !== 'all') {
        if (app.status !== params.status) return false;
      }

      return true;
    });

    // Apply Sorting
    const sortBy = params.sortBy || 'match_score';
    if (sortBy === 'match_score') {
      filtered.sort((a, b) => (b.match_score?.total_score || 0) - (a.match_score?.total_score || 0));
    } else if (sortBy === 'latest_application') {
      filtered.sort((a, b) => new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0));
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => (b.candidate?.yearsOfExperience || 0) - (a.candidate?.yearsOfExperience || 0));
    }

    // Pagination
    const page = parseInt(params.page || 1, 10);
    const pageSize = parseInt(params.pageSize || 10, 10);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      opportunity: {
        id: opp.id,
        title: opp.title,
        category: opp.category,
        production_company: opp.productionCompany,
        location: opp.location,
        requirements_summary: opp.requirementsSummary,
        languages: opp.languages,
        total_applications: relevantApps.length,
        total_shortlisted: enriched.filter(a => a.is_shortlisted).length,
      },
      applications: paginated,
      count: totalCount,
      totalPages,
      currentPage: page,
      isBackend: false,
    };
  },

  /**
   * Recalculate transparent match score
   */
  recalculateScore: async (applicationId, triggerReason = 'Manual recalculation') => {
    try {
      const res = await apiRequest(`/api/ranking/applications/${applicationId}/recalculate/`, {
        method: 'POST',
        body: JSON.stringify({ reason: triggerReason, trigger_event: 'manual_recalculate' }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend recalculate fallback:', e);
    }

    // Fallback: recompute score
    const allApps = getAllApplications();
    const app = allApps.find(a => a.id === applicationId);
    if (!app) return null;
    const opp = mockOpportunities.find(o => o.id === app.opportunityId) || mockOpportunities[0];
    const cand = mockCandidates.find(c => c.id === app.candidateId) || mockCandidates[0];
    const matchScore = calculateCandidateMatchScore(cand, opp);

    return {
      message: `Score recalculated: ${matchScore.totalScore}/100`,
      application: {
        ...app,
        match_score: {
          total_score: matchScore.totalScore,
          status: matchScore.status,
          confidence_level: matchScore.confidenceLevel,
          missing_fields: matchScore.missingFields,
          improvement_suggestions: matchScore.improvementSuggestions,
          calculation_summary: matchScore.calculationSummary,
          calculated_at: new Date().toISOString(),
          breakdowns: matchScore.breakdowns,
        },
      },
    };
  },

  /**
   * Toggle shortlist status
   */
  shortlistCandidate: async (applicationId, action = 'shortlist', notes = '') => {
    try {
      const res = await fetch(`${API_BASE}/applications/${applicationId}/shortlist/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend shortlist fallback:', e);
    }

    const currentShortlists = getStoredShortlists();
    let updated;
    if (action === 'unshortlist') {
      updated = currentShortlists.filter(id => id !== applicationId);
      updateApplicationStatus(applicationId, 'under_review', notes || 'Removed from shortlist.');
    } else {
      updated = Array.from(new Set([...currentShortlists, applicationId]));
      updateApplicationStatus(applicationId, 'shortlisted', notes || 'Shortlisted by casting team.');
    }
    setStoredShortlists(updated);
    return {
      message: action === 'unshortlist' ? 'Candidate unshortlisted.' : 'Candidate shortlisted!',
      application_id: applicationId,
      is_shortlisted: action !== 'unshortlist',
    };
  },

  /**
   * Bulk shortlist multiple candidates
   */
  bulkShortlist: async (applicationIds = [], notes = 'Bulk shortlisted by casting team.') => {
    try {
      const res = await apiRequest('/api/ranking/bulk-shortlist/', {
        method: 'POST',
        body: JSON.stringify({ application_ids: applicationIds, notes }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend bulk shortlist fallback:', e);
    }

    const current = getStoredShortlists();
    const merged = Array.from(new Set([...current, ...applicationIds]));
    setStoredShortlists(merged);
    applicationIds.forEach(id => {
      updateApplicationStatus(id, 'shortlisted', notes);
    });
    return {
      message: `Successfully shortlisted ${applicationIds.length} candidate(s).`,
      updated_ids: applicationIds,
    };
  },

  /**
   * Invite to Audition
   */
  inviteAudition: async (applicationId, auditionData = {}) => {
    try {
      const res = await apiRequest(`/api/applications/${applicationId}/invite-audition/`, {
        method: 'POST',
        body: JSON.stringify(auditionData),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend invite audition fallback:', e);
    }

    updateApplicationStatus(
      applicationId,
      'audition_requested',
      `Audition arranged for ${auditionData.date} (${auditionData.mode || 'Studio Read'}).`,
      { interviewDetails: auditionData, notes: auditionData.notes }
    );
    return {
      message: `Audition invitation recorded for ${auditionData.date}.`,
      status: 'audition_requested',
    };
  },

  /**
   * Reject application with reason
   */
  rejectApplication: async (applicationId, reason = 'Role filled by alternate candidate profile.') => {
    try {
      const res = await apiRequest(`/api/applications/${applicationId}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', note: reason }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend reject fallback:', e);
    }

    updateApplicationStatus(applicationId, 'rejected', reason);
    return {
      message: 'Application marked as rejected.',
      status: 'rejected',
    };
  },

  /**
   * Candidate Comparison (Side-by-side)
   */
  compareCandidates: async (applicationIds = []) => {
    const idsParam = applicationIds.join(',');
    try {
      const res = await apiRequest(`/api/ranking/compare/?app_ids=${encodeURIComponent(idsParam)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend comparison fallback:', e);
    }

    // Client fallback: assemble compared candidates
    const allApps = getAllApplications();
    const apps = allApps.filter(a => applicationIds.includes(a.id));
    const compared = apps.map(app => {
      const cand = mockCandidates.find(c => c.id === app.candidateId) || mockCandidates[0];
      const opp = mockOpportunities.find(o => o.id === app.opportunityId) || mockOpportunities[0];
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

    return {
      candidates_compared: compared,
      criteria_definitions: [
        { key: 'skills', name: 'Required Skills & Role-Specific Abilities', weight: 30 },
        { key: 'portfolio', name: 'Portfolio, Showreel & Work Samples', weight: 25 },
        { key: 'experience', name: 'Relevant Experience & Credits', weight: 15 },
        { key: 'language', name: 'Language & Communication', weight: 10 },
        { key: 'availability', name: 'Availability for Schedule', weight: 10 },
        { key: 'location', name: 'Location & Travel Feasibility', weight: 10 },
      ],
    };
  },

  /**
   * Talent Dashboard: Privacy-Safe Applications List
   */
  getTalentApplications: async (candidateId = 'cand-1') => {
    try {
      const res = await apiRequest(`/api/applications/my/?candidate_id=${encodeURIComponent(candidateId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          return data.applications;
        }
      }
    } catch (e) {
      console.warn('Backend talent applications fallback:', e);
    }

    const allApps = getAllApplications().filter(a => a.candidateId === candidateId || candidateId === 'all');
    return allApps.map(app => {
      const opp = mockOpportunities.find(o => o.id === app.opportunityId) || mockOpportunities[0];
      const cand = mockCandidates.find(c => c.id === app.candidateId) || mockCandidates[0];
      const score = calculateCandidateMatchScore(cand, opp);

      return {
        id: app.id,
        opportunity_id: opp.id,
        opportunity_title: opp.title,
        production_company: opp.productionCompany,
        location: opp.location,
        role_applied_for: app.roleAppliedFor,
        status: app.status,
        applied_date: app.appliedDate,
        requirements_summary: opp.requirementsSummary,
        matched_requirements: score.breakdowns
          .filter(b => b.pointsAwarded > 0)
          .map(b => ({ criterion: b.criterionName, evidence: b.evidenceUsed })),
        profile_improvement_tips: score.improvementSuggestions,
        interview_invitation: app.interviewDetails || null,
        submitted_materials: app.submittedMaterials,
      };
    });
  },
};
