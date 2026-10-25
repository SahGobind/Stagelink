/**
 * feedbackService.js
 * Two-way Rating & Feedback Service for StageLink
 * 
 * 1. Candidate -> Production Company:
 *    Candidates give ratings (1-5 stars) and feedback on production companies / casting experience.
 * 2. Production Company -> Candidate Production:
 *    Production companies / studios give ratings (1-5 stars), category breakdown, and constructive
 *    feedback on candidate audition tapes, self-tapes, and performance submissions.
 * 
 * Supports both MongoDB Atlas backend (/api/companies/:id/reviews, /api/applications/:id/feedback)
 * and rich local storage persistence for reliable offline-first demo capability.
 */

import { apiRequest } from './api';

const STORAGE_KEY_COMPANY_REVIEWS = 'stagelink_company_reviews';
const STORAGE_KEY_PRODUCTION_FEEDBACK = 'stagelink_production_feedback';

// Seed initial verified company reviews from candidates
const DEFAULT_COMPANY_REVIEWS = [
  {
    id: 'rev-c-1',
    company_id: 'dharma-productions',
    company_name: 'Dharma Productions',
    candidate_id: 'cand-1',
    candidate_name: 'Sophia Bennett',
    candidate_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: 4.9,
    feedback: 'Exceptional casting directors. The sides and character breakdown were provided 5 days in advance, and the chemistry read in Mumbai was run with utmost professionalism and warmth.',
    categories: {
      casting_experience: 5,
      communication: 4.8,
      professionalism: 5,
    },
    opportunity_id: 'opp-1',
    opportunity_title: 'Female Lead — Web Series',
    created_at: '2026-10-14T11:20:00Z',
  },
  {
    id: 'rev-c-2',
    company_id: 'netflix-studios',
    company_name: 'Netflix Studios',
    candidate_id: 'cand-2',
    candidate_name: 'Alexander Vance',
    candidate_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    rating: 5.0,
    feedback: 'Seamless self-tape submission process. The callback notification was prompt and the technical team gave clear lighting and audio specs for the virtual screen test.',
    categories: {
      casting_experience: 5,
      communication: 5,
      professionalism: 5,
    },
    opportunity_id: 'opp-2',
    opportunity_title: 'Anthology Feature Film',
    created_at: '2026-10-18T15:45:00Z',
  },
  {
    id: 'rev-c-3',
    company_id: 'yash-raj-films',
    company_name: 'Yash Raj Films',
    candidate_id: 'cand-3',
    candidate_name: 'Priya Patel',
    candidate_avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
    rating: 4.8,
    feedback: 'Highly organized dance audition and acting read. The studio environment at YRF Studios Andheri is top tier with respectful and clear feedback.',
    categories: {
      casting_experience: 4.9,
      communication: 4.7,
      professionalism: 5,
    },
    opportunity_id: 'opp-3',
    opportunity_title: 'Romantic Drama Callback',
    created_at: '2026-10-20T09:15:00Z',
  },
];

// Seed initial verified production feedback from studios to candidates
const DEFAULT_PRODUCTION_FEEDBACK = [
  {
    id: 'fb-p-1',
    application_id: 'app-1',
    candidate_id: 'cand-1',
    candidate_name: 'Sophia Bennett',
    production_company: 'Dharma Productions',
    opportunity_title: 'Female Lead — Web Series',
    role_title: 'Dr. Tanya Roy (Lead)',
    rating: 4.8,
    breakdown: {
      acting: 5.0,
      screen_presence: 4.8,
      vocal_quality: 4.6,
      professionalism: 5.0,
    },
    feedback: 'Commanding screen presence in Scene 4 monologue. Nuanced emotional transitions between vulnerability and intellectual authority. Highly recommended for primary chemistry callback reads.',
    reviewer_name: 'Rohan Mehra',
    reviewer_role: 'Lead Casting Director • Dharma Productions',
    given_at: '2026-10-12T14:30:00Z',
  },
  {
    id: 'fb-p-2',
    application_id: 'app-2',
    candidate_id: 'cand-2',
    candidate_name: 'Alexander Vance',
    production_company: 'Netflix Studios',
    opportunity_title: 'Anthology Feature Film',
    role_title: 'Julian Cross',
    rating: 4.9,
    breakdown: {
      acting: 4.9,
      screen_presence: 5.0,
      vocal_quality: 4.8,
      professionalism: 5.0,
    },
    feedback: 'Masterful vocal diction and authentic dramatic gravitas. The pacing in the callback self-tape showed deep script understanding and stillness on camera.',
    reviewer_name: 'Sarah Jenkins',
    reviewer_role: 'Senior Casting Associate • Netflix Global Originals',
    given_at: '2026-10-16T18:00:00Z',
  },
];

const loadStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const saveStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to persist to localStorage for ${key}`, err);
  }
};

export const feedbackService = {
  // =========================================================================
  // 1. CANDIDATE -> PRODUCTION COMPANY REVIEWS
  // =========================================================================

  /**
   * Get all reviews and statistics for a given production company
   */
  getCompanyReviews: async (companyIdOrName) => {
    const normalizedTarget = (companyIdOrName || '').toLowerCase().trim();
    const localAll = loadStorage(STORAGE_KEY_COMPANY_REVIEWS, DEFAULT_COMPANY_REVIEWS);
    const matchedLocal = localAll.filter((r) => {
      const cId = (r.company_id || '').toLowerCase();
      const cName = (r.company_name || '').toLowerCase();
      return cId.includes(normalizedTarget) || cName.includes(normalizedTarget) || normalizedTarget.includes(cName);
    });

    const calculateStats = (reviews) => {
      if (!reviews || reviews.length === 0) {
        return { averageRating: 4.9, totalReviews: 0, reviews: [] };
      }
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      const avg = Math.round((sum / reviews.length) * 10) / 10;
      return {
        averageRating: avg,
        totalReviews: reviews.length,
        reviews,
      };
    };

    // Try live Django backend first
    try {
      const res = await apiRequest(`/api/companies/${encodeURIComponent(companyIdOrName)}/reviews/`);
      if (res && Array.isArray(res.reviews)) {
        // Merge live with local unique reviews
        const merged = [...res.reviews];
        matchedLocal.forEach((loc) => {
          if (!merged.some((m) => m.id === loc.id)) {
            merged.push(loc);
          }
        });
        return calculateStats(merged);
      }
    } catch {
      // Fallback to local
    }

    return calculateStats(matchedLocal);
  },

  /**
   * Submit candidate review of a production company
   */
  submitCompanyReview: async (reviewData) => {
    const {
      companyId = 'production-studio',
      companyName = 'Production Studio',
      candidateId = 'cand-1',
      candidateName = 'Candidate Artist',
      candidateAvatar = '',
      rating = 5.0,
      feedback = '',
      categories = {
        casting_experience: 5,
        communication: 5,
        professionalism: 5,
      },
      opportunityId = '',
      opportunityTitle = '',
    } = reviewData;

    const newReview = {
      id: `rev-c-${Date.now()}`,
      company_id: companyId,
      company_name: companyName,
      candidate_id: candidateId,
      candidate_name: candidateName,
      candidate_avatar: candidateAvatar,
      rating: parseFloat(rating),
      feedback: feedback.trim(),
      categories,
      opportunity_id: opportunityId,
      opportunity_title: opportunityTitle,
      created_at: new Date().toISOString(),
    };

    // 1. Save to localStorage
    const localAll = loadStorage(STORAGE_KEY_COMPANY_REVIEWS, DEFAULT_COMPANY_REVIEWS);
    // Replace if same candidate reviewed same company, otherwise append
    const existingIdx = localAll.findIndex(
      (r) => r.company_id === companyId && r.candidate_id === candidateId
    );
    if (existingIdx >= 0) {
      localAll[existingIdx] = newReview;
    } else {
      localAll.unshift(newReview);
    }
    saveStorage(STORAGE_KEY_COMPANY_REVIEWS, localAll);

    // 2. Try live Django / MongoDB backend
    try {
      await apiRequest(`/api/companies/${encodeURIComponent(companyId)}/reviews/`, {
        method: 'POST',
        body: JSON.stringify({
          candidate_id: candidateId,
          candidate_name: candidateName,
          candidate_avatar: candidateAvatar,
          rating: parseFloat(rating),
          feedback: feedback.trim(),
          opportunity_id: opportunityId,
          opportunity_title: opportunityTitle,
          categories,
          company_name: companyName,
        }),
      });
    } catch {
      // Offline fallback succeeded
    }

    return {
      success: true,
      review: newReview,
    };
  },

  // =========================================================================
  // 2. PRODUCTION COMPANY -> CANDIDATE AUDITION / PRODUCTION FEEDBACK
  // =========================================================================

  /**
   * Get production feedback for a specific candidate application
   */
  getApplicationProductionFeedback: async (applicationId) => {
    const localAll = loadStorage(STORAGE_KEY_PRODUCTION_FEEDBACK, DEFAULT_PRODUCTION_FEEDBACK);
    const found = localAll.find((fb) => fb.application_id === applicationId);

    try {
      const res = await apiRequest(`/api/applications/${encodeURIComponent(applicationId)}/feedback/`);
      if (res && res.rating) {
        return res;
      }
    } catch {
      // Fallback
    }

    return found || null;
  },

  /**
   * Submit production company feedback & rating on candidate audition submission
   */
  submitProductionFeedback: async (applicationId, feedbackData) => {
    const {
      rating = 5.0,
      feedback = '',
      breakdown = {
        acting: 5.0,
        screen_presence: 5.0,
        vocal_quality: 5.0,
        professionalism: 5.0,
      },
      reviewerName = 'Casting Director',
      reviewerRole = 'Lead Studio Reviewer',
      candidateId = '',
      candidateName = '',
      productionCompany = 'Production House',
      opportunityTitle = '',
      roleTitle = '',
    } = feedbackData;

    const newFeedback = {
      id: `fb-p-${Date.now()}`,
      application_id: applicationId,
      candidate_id: candidateId,
      candidate_name: candidateName,
      production_company: productionCompany,
      opportunity_title: opportunityTitle,
      role_title: roleTitle,
      rating: parseFloat(rating),
      breakdown,
      feedback: feedback.trim(),
      reviewer_name: reviewerName,
      reviewer_role: reviewerRole,
      given_at: new Date().toISOString(),
    };

    // 1. Save locally
    const localAll = loadStorage(STORAGE_KEY_PRODUCTION_FEEDBACK, DEFAULT_PRODUCTION_FEEDBACK);
    const existingIdx = localAll.findIndex((f) => f.application_id === applicationId);
    if (existingIdx >= 0) {
      localAll[existingIdx] = newFeedback;
    } else {
      localAll.unshift(newFeedback);
    }
    saveStorage(STORAGE_KEY_PRODUCTION_FEEDBACK, localAll);

    // Also update in all applications cache so UI reflects immediately
    try {
      const apps = JSON.parse(localStorage.getItem('starcast_all_applications') || '[]');
      const targetApp = apps.find((a) => a.id === applicationId);
      if (targetApp) {
        targetApp.production_feedback = newFeedback;
        targetApp.productionFeedback = newFeedback;
        localStorage.setItem('starcast_all_applications', JSON.stringify(apps));
      }
    } catch {
      // Ignore
    }

    // 2. Send to live Django / MongoDB Atlas backend
    try {
      await apiRequest(`/api/applications/${encodeURIComponent(applicationId)}/feedback/`, {
        method: 'POST',
        body: JSON.stringify({
          rating: parseFloat(rating),
          feedback: feedback.trim(),
          breakdown,
          reviewer_name: reviewerName,
          reviewer_role: reviewerRole,
        }),
      });
    } catch {
      // Offline fallback succeeded
    }

    return {
      success: true,
      feedback: newFeedback,
    };
  },

  /**
   * Get all verified studio ratings & feedback for a candidate's public portfolio
   */
  getCandidateProductionReviews: async (candidateId) => {
    const localAll = loadStorage(STORAGE_KEY_PRODUCTION_FEEDBACK, DEFAULT_PRODUCTION_FEEDBACK);
    const matched = localAll.filter(
      (fb) => fb.candidate_id === candidateId || (!candidateId && fb.candidate_id === 'cand-1')
    );

    try {
      const res = await apiRequest(`/api/applications/candidate-reviews/${encodeURIComponent(candidateId)}/`);
      if (res && Array.isArray(res.reviews) && res.reviews.length > 0) {
        return res;
      }
    } catch {
      // Fallback
    }

    const avg = matched.length
      ? Math.round((matched.reduce((acc, m) => acc + (parseFloat(m.rating) || 5), 0) / matched.length) * 10) / 10
      : 4.9;

    return {
      candidate_id: candidateId,
      average_rating: avg,
      total_reviews: matched.length,
      reviews: matched,
    };
  },
};
