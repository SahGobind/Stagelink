/**
 * applicationService.js
 * Manages candidate audition applications, status transitions, duplicate checks, and withdrawal.
 * Bridges local storage with MongoDB Atlas backed Django REST Framework endpoints.
 */

import {
  getAllApplications,
  saveCandidateApplication,
  updateApplicationStatus,
} from '../data/mockApplications';
import { apiRequest } from './api';

const STORAGE_KEY_APPS = 'starcast_all_applications';

export const applicationService = {
  /**
   * Check if candidate has already applied to an opportunity
   */
  hasAlreadyApplied: (candidateId, opportunityId) => {
    const all = getAllApplications();
    const existing = all.find(
      (a) =>
        (a.candidateId === candidateId || a.candidate_id === candidateId) &&
        (a.opportunityId === opportunityId || a.opportunity_id === opportunityId) &&
        a.status !== 'withdrawn'
    );
    return existing || null;
  },

  /**
   * Submit a new audition application
   */
  apply: async (applicationData) => {
    const { candidateId, opportunityId } = applicationData;

    // 1. Prevent duplicate applications locally
    const duplicate = applicationService.hasAlreadyApplied(candidateId, opportunityId);
    if (duplicate) {
      return {
        success: false,
        isDuplicate: true,
        existingApplication: duplicate,
        message: `You have already applied for this casting call on ${duplicate.appliedDate || 'recently'}. Status: ${duplicate.status.toUpperCase()}`,
      };
    }

    // 2. Build full application record
    const newApp = {
      id: `app-${Date.now()}`,
      opportunityId,
      opportunityTitle: applicationData.opportunityTitle || 'Casting Call',
      productionCompany: applicationData.productionCompany || 'Production Studio',
      location: applicationData.location || 'Open',
      candidateId: candidateId || 'cand-current',
      candidateName: applicationData.candidateName || 'Candidate Artist',
      candidateAvatar: applicationData.candidateAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      candidateHeadline: applicationData.candidateHeadline || 'Performer / Screen Artist',
      roleAppliedFor: applicationData.roleAppliedFor || 'Primary Role',
      roleId: applicationData.roleId || 'role-1',
      status: 'submitted',
      appliedDate: new Date().toISOString().split('T')[0],
      appliedTimestamp: new Date().toISOString(),
      coverMessage: applicationData.coverMessage || '',
      submittedMaterials: {
        portfolioUrl: applicationData.portfolioUrl || '',
        videoAuditionUrl: applicationData.videoAuditionUrl || '',
        resumeFileName: applicationData.resumeFileName || '',
        headshotUrl: applicationData.headshotUrl || applicationData.candidateAvatar || '',
      },
      answers: applicationData.answers || {},
      statusHistory: [
        {
          status: 'submitted',
          changedAt: new Date().toISOString(),
          note: 'Audition application submitted successfully by candidate.',
          changedBy: applicationData.candidateName || 'Candidate',
        },
      ],
      internalNotes: [],
    };

    // 3. Save locally in localStorage
    saveCandidateApplication(newApp);

    // 4. Save dynamically to MongoDB Atlas backend (/api/applications/)
    try {
      const res = await apiRequest('/api/applications/', {
        method: 'POST',
        body: JSON.stringify({
          opportunity_id: opportunityId,
          role_id: newApp.roleId,
          candidate_id: candidateId,
          cover_message: newApp.coverMessage,
          video_audition_url: newApp.submittedMaterials.videoAuditionUrl,
          answers: newApp.answers,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          newApp.id = data.id;
          saveCandidateApplication(newApp);
        }
      }
    } catch {
      // offline/mock fallback
    }

    return {
      success: true,
      application: newApp,
      message: 'Application submitted successfully! Your materials have been transmitted to the casting directors.',
    };
  },

  /**
   * Withdraw an active application
   */
  withdraw: async (applicationId, candidateId) => {
    try {
      await apiRequest(`/api/applications/${applicationId}/withdraw/`, {
        method: 'POST',
      });
    } catch {
      // offline fallback
    }

    const all = getAllApplications();
    const app = all.find((a) => a.id === applicationId);

    if (!app) {
      return { success: false, message: 'Application not found.' };
    }

    if (app.status === 'selected' || app.status === 'rejected') {
      return {
        success: false,
        message: `Cannot withdraw an application that has already been marked as ${app.status}.`,
      };
    }

    const updated = updateApplicationStatus(
      applicationId,
      'withdrawn',
      'Candidate voluntarily withdrew this audition application.'
    );

    return {
      success: true,
      message: 'Your application has been withdrawn.',
      applications: updated,
    };
  },

  /**
   * Get all applications for a specific candidate
   */
  getByCandidate: async (candidateId) => {
    try {
      const res = await apiRequest(`/api/applications/my/?candidate_id=${encodeURIComponent(candidateId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.applications && Array.isArray(data.applications)) {
          return data.applications;
        }
      }
    } catch {
      // fallback
    }

    const all = getAllApplications();
    return all.filter((a) => a.candidateId === candidateId || a.candidate_id === candidateId);
  },

  /**
   * Get all applications for an opportunity (recruiter view)
   */
  getByOpportunity: async (opportunityId) => {
    try {
      const res = await apiRequest(`/api/applications/?opportunity_id=${encodeURIComponent(opportunityId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results;
        }
      }
    } catch {
      // fallback
    }

    const all = getAllApplications();
    return all.filter((a) => a.opportunityId === opportunityId || a.opportunity_id === opportunityId);
  },

  /**
   * Update application status (recruiter / admin action)
   */
  updateStatus: async (applicationId, newStatus, recruiterNote = '', extraDetails = null) => {
    try {
      await apiRequest(`/api/applications/${applicationId}/status/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note: recruiterNote }),
      });
    } catch {
      // fallback
    }

    const updated = updateApplicationStatus(applicationId, newStatus, recruiterNote, extraDetails);
    return { success: true, updated };
  },
};
