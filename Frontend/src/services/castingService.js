/**
 * castingService.js
 * Comprehensive service for Casting Calls / Opportunities management.
 * Bridges local storage repositories and Django backend /api/opportunities/ APIs.
 */

import { mockOpportunities } from '../data/mockOpportunities';
import { getCustomOpportunities } from '../utils/paymentAccess';

const STORAGE_KEY_CUSTOM_OPPS = 'starcast_custom_opportunities';
const STORAGE_KEY_DRAFTS = 'starcast_draft_opportunities';

export const castingService = {
  /**
   * Get all public published opportunities (strictly excludes drafts & pending payments)
   */
  getPublicOpportunities: async (filters = {}) => {
    try {
      // 1. Try backend API first
      const queryParams = new URLSearchParams();
      if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.location && filters.location !== 'all') queryParams.append('location', filters.location);
      if (filters.search) queryParams.append('search', filters.search);

      const res = await fetch(`/api/opportunities/?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const backendOpps = data.results || data.opportunities || [];
        if (Array.isArray(backendOpps) && backendOpps.length > 0) {
          // Merge custom local published
          const localCustom = getCustomOpportunities();
          const ids = new Set(localCustom.map((c) => c.id));
          const merged = [...localCustom, ...backendOpps.filter((b) => !ids.has(b.id))];
          return merged.filter((o) => o.status === 'published' || o.status === 'open' || o.listingStatus === 'published');
        }
      }
    } catch {
      // fallback to mock & local storage
    }

    const custom = getCustomOpportunities();
    const ids = new Set(custom.map((c) => c.id));
    const all = [...custom, ...mockOpportunities.filter((m) => !ids.has(m.id))];
    return all.filter((o) => o.status === 'published' || o.status === 'open' || o.listingStatus === 'published');
  },

  /**
   * Get recruiter opportunities (includes published, drafts, pending_payment, closed)
   */
  getRecruiterOpportunities: async () => {
    try {
      const res = await fetch('/api/opportunities/recruiter/');
      if (res.ok) {
        const data = await res.json();
        if (data.opportunities && Array.isArray(data.opportunities)) {
          const localCustom = getCustomOpportunities();
          const drafts = castingService.getDrafts();
          const ids = new Set([...localCustom.map((c) => c.id), ...drafts.map((d) => d.id)]);
          return [...localCustom, ...drafts, ...data.opportunities.filter((o) => !ids.has(o.id))];
        }
      }
    } catch {
      // fallback
    }

    const localCustom = getCustomOpportunities();
    const drafts = castingService.getDrafts();
    const ids = new Set([...localCustom.map((c) => c.id), ...drafts.map((d) => d.id)]);
    return [...localCustom, ...drafts, ...mockOpportunities.filter((m) => !ids.has(m.id))];
  },

  /**
   * Get a single opportunity by ID
   */
  getById: async (id) => {
    try {
      const res = await fetch(`/api/opportunities/${id}/`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) return data;
      }
    } catch {
      // fallback
    }

    const all = [
      ...getCustomOpportunities(),
      ...castingService.getDrafts(),
      ...mockOpportunities,
    ];
    return all.find((o) => o.id === id || o.refId === id) || null;
  },

  /**
   * Save an opportunity as draft
   */
  saveDraft: (oppData) => {
    try {
      const drafts = castingService.getDrafts();
      const draftOpp = {
        ...oppData,
        id: oppData.id || `draft-${Date.now()}`,
        refId: oppData.refId || `DFT-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'draft',
        listingStatus: 'draft',
        paymentStatus: 'not_required',
        updatedAt: new Date().toISOString(),
      };

      const filtered = drafts.filter((d) => d.id !== draftOpp.id);
      localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify([draftOpp, ...filtered]));
      return draftOpp;
    } catch (err) {
      console.error('Failed to save draft:', err);
      return null;
    }
  },

  /**
   * Get all saved drafts
   */
  getDrafts: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DRAFTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Error reading drafts:', err);
    }
    return [];
  },

  /**
   * Duplicate an opportunity into a new draft
   */
  duplicateOpportunity: (opp) => {
    const duplicated = {
      ...opp,
      id: `opp-copy-${Date.now()}`,
      refId: `PRD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: `${opp.title || 'Casting Call'} (Copy)`,
      status: 'draft',
      listingStatus: 'draft',
      paymentStatus: 'pending',
      applicantCount: 0,
      shortlistedCount: 0,
      createdAt: new Date().toISOString(),
    };
    return castingService.saveDraft(duplicated);
  },

  /**
   * Close an open opportunity
   */
  closeOpportunity: (id) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OPPS);
      if (raw) {
        const parsed = JSON.parse(raw);
        const updated = parsed.map((o) => (o.id === id ? { ...o, status: 'closed', listingStatus: 'closed' } : o));
        localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify(updated));
        return true;
      }
    } catch (err) {
      console.error('Failed to close opportunity:', err);
    }
    return false;
  },

  /**
   * Archive an opportunity
   */
  archiveOpportunity: (id) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_OPPS);
      if (raw) {
        const parsed = JSON.parse(raw);
        const updated = parsed.map((o) => (o.id === id ? { ...o, status: 'archived', listingStatus: 'archived' } : o));
        localStorage.setItem(STORAGE_KEY_CUSTOM_OPPS, JSON.stringify(updated));
        return true;
      }
    } catch (err) {
      console.error('Failed to archive opportunity:', err);
    }
    return false;
  },
};
