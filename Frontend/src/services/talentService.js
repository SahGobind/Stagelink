/**
 * talentService.js
 * StageLink Talent Discovery, Saved Roster, and Casting Invitations Service.
 * 
 * Works seamlessly with mock development data and maintains compatibility
 * with Django REST Framework endpoints (/api/users/?role=talent, /api/invitations/).
 */

import { mockTalentProfiles } from '../data/mockTalentDirectory';
import { getCandidateById } from '../data/mockCandidates';
import { addStoredNotification } from '../data/mockNotifications';
import { apiRequest } from './api';

export const STORAGE_KEY_SAVED_TALENT = 'starcast_saved_talent';
export const STORAGE_KEY_INVITATIONS = 'starcast_talent_invitations';
export const EVENT_SAVED_TALENT_CHANGED = 'starcast_saved_talent_changed';
export const EVENT_INVITATIONS_CHANGED = 'starcast_invitations_changed';

// Initial realistic invitations seeded for demo experience
const INITIAL_SAMPLE_INVITATIONS = [
  {
    id: 'inv-seed-1',
    talentId: 'cand-1',
    talentName: 'Aanya Sharma',
    talentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    opportunityId: 'opp-1',
    opportunityTitle: 'Female Lead — Web Series',
    role: 'Dr. Tanya Roy (Lead Investigator)',
    location: 'Mumbai, India',
    shootDate: 'Nov 2026 - 45 Days Schedule',
    deadline: '20 Oct 2026',
    message: 'Aanya, our director loved your dramatic monologue and would like to invite you for the primary in-person screen test for Dr. Tanya Roy.',
    status: 'accepted',
    sentAt: '2026-10-18T10:30:00Z',
    sentBy: 'Rising Star Productions',
  },
  {
    id: 'inv-seed-2',
    talentId: 'cand-2',
    talentName: 'Alexander Vance',
    talentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    opportunityId: 'opp-2',
    opportunityTitle: 'Brand Advertisement Lead',
    role: 'Principal Campaign Spokesperson',
    location: 'Delhi, India',
    shootDate: 'Nov 2026 - 2 Days Shoot',
    deadline: '28 Oct 2026',
    message: 'Alexander, we believe your screen presence matches our international campaign visual tone. Please confirm your availability for a chemistry test.',
    status: 'pending',
    sentAt: '2026-10-19T14:15:00Z',
    sentBy: 'Vogue Media India',
  },
];

export const talentService = {
  /**
   * Fetch talent list with comprehensive client-side filtering
   */
  getAllTalent: async (filters = {}) => {
    let talentList = [...mockTalentProfiles];

    try {
      const queryParams = new URLSearchParams();
      queryParams.append('role', 'talent');
      queryParams.append('published_only', 'true');
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category && filters.category !== 'All Categories') queryParams.append('category', filters.category);
      if (filters.location && filters.location !== 'All Locations') queryParams.append('location', filters.location);

      const res = await apiRequest(`/api/users/?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formattedBackend = data.map((u) => {
            const loc = u.location || 'Mumbai, India';
            const city = u.city || (loc.includes(',') ? loc.split(',')[0].trim() : loc);
            const country = u.country || (loc.includes(',') ? loc.split(',')[1].trim() : 'India');
            const categories = u.categories && u.categories.length > 0 ? u.categories : [u.category || 'Actor'];
            const avatar = u.avatar || u.profile_photo || (u.portfolio?.headshots?.[0]) || mockTalentProfiles[0].avatar;
            const years = u.years_of_experience || u.yearsOfExperience || 2;

            return {
              id: u.id,
              fullName: u.fullName || u.full_name || 'Candidate Artist',
              category: u.category || categories[0],
              categories: categories,
              headline: u.headline || `${categories.join(' • ')}`,
              location: loc,
              city,
              country,
              avatar: avatar,
              gender: u.gender || 'Not specified',
              age: u.age || 26,
              experienceLevel: u.experience_level || `${years}+ Years`,
              yearsOfExperience: years,
              experienceYears: u.experience_years || `${years}+`,
              availabilityStatus: u.availability_status || u.availability || 'Available for Projects',
              bio: u.bio || `${u.fullName || 'Talent'} is an accomplished performer registered on StageLink.`,
              skills: u.skills && u.skills.length > 0 ? u.skills : ['Screen Acting', 'Dialogue Delivery'],
              languages: u.languages && u.languages.length > 0 ? u.languages : ['English', 'Hindi'],
              verificationStatus: u.is_verified ? 'verified' : (u.review_status || 'verified'),
              isPublished: Boolean(u.is_published),
              portfolio: u.portfolio || { headshots: [avatar] },
              isBackendUser: true,
            };
          });

          // Place real database candidates first, supplemented by mock profiles not matching any backend ID or email
          const backendIds = new Set(formattedBackend.map((b) => b.id));
          const supplementaryMocks = mockTalentProfiles.filter((m) => !backendIds.has(m.id));

          talentList = [...formattedBackend, ...supplementaryMocks];
        }
      }
    } catch {
      // fallback to mock data
    }


    // Apply Client-Side Filters
    let results = talentList;

    // 1. Text Search (Name, Skill, Bio, Headline, Keyword)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter((t) => {
        const nameMatch = t.fullName?.toLowerCase().includes(q);
        const headlineMatch = t.headline?.toLowerCase().includes(q);
        const bioMatch = t.bio?.toLowerCase().includes(q);
        const cityMatch = t.city?.toLowerCase().includes(q);
        const skillsMatch = t.skills?.some((s) => s.toLowerCase().includes(q));
        const categoryMatch = t.category?.toLowerCase().includes(q) || t.categories?.some((c) => c.toLowerCase().includes(q));
        return nameMatch || headlineMatch || bioMatch || cityMatch || skillsMatch || categoryMatch;
      });
    }

    // 2. Talent Category Dropdown
    if (filters.category && filters.category !== 'All Categories') {
      const selectedCat = filters.category.toLowerCase().replace(/s$/, ''); // e.g. "actors" -> "actor"
      results = results.filter((t) => {
        const cat = (t.category || '').toLowerCase();
        const cats = (t.categories || []).map((c) => c.toLowerCase());
        return (
          cat === filters.category.toLowerCase() ||
          cat.includes(selectedCat) ||
          cats.some((c) => c === filters.category.toLowerCase() || c.includes(selectedCat))
        );
      });
    }

    // 3. Location Dropdown or search
    if (filters.location && filters.location !== 'All Locations') {
      const loc = filters.location.toLowerCase();
      results = results.filter((t) => {
        const fullLoc = (t.location || '').toLowerCase();
        const city = (t.city || '').toLowerCase();
        const country = (t.country || '').toLowerCase();
        return fullLoc.includes(loc) || loc.includes(city) || loc.includes(country);
      });
    }

    // 4. Experience Dropdown
    if (filters.experience && filters.experience !== 'All Experience') {
      const exp = filters.experience.toLowerCase();
      results = results.filter((t) => {
        const years = t.yearsOfExperience || 0;
        if (exp.includes('fresher') || exp.includes('0-1')) return years <= 1;
        if (exp.includes('1-2')) return years >= 1 && years <= 2;
        if (exp.includes('3-5') || exp.includes('2-5')) return years >= 2 && years <= 5;
        if (exp.includes('5+')) return years >= 5;
        if (exp.includes('8+')) return years >= 8;
        return true;
      });
    }

    // 5. Language Dropdown
    if (filters.language && filters.language !== 'All Languages') {
      const lang = filters.language.toLowerCase();
      results = results.filter((t) =>
        t.languages?.some((l) => l.toLowerCase().includes(lang))
      );
    }

    // 6. Availability Filter
    if (filters.availability && filters.availability !== 'All Availability') {
      const avail = filters.availability.toLowerCase();
      results = results.filter((t) => {
        const status = (t.availabilityStatus || t.availability || '').toLowerCase();
        if (avail.includes('immediate') || avail.includes('now')) {
          return status.includes('immediate') || status.includes('now') || status.includes('available');
        }
        if (avail.includes('audition')) return status.includes('audition') || status.includes('available');
        if (avail.includes('travel')) return status.includes('travel') || status.includes('international');
        if (avail.includes('flexible')) return status.includes('flexible') || status.includes('available');
        return status.includes(avail);
      });
    }

    return {
      talent: results,
      totalCount: results.length,
      allCount: talentList.length,
    };
  },

  /**
   * Get talent profile by ID (asynchronous with backend support)
   */
  fetchTalentById: async (id) => {
    if (!id) return null;
    const fromDirectory = mockTalentProfiles.find((t) => t.id === id);
    if (fromDirectory) return fromDirectory;

    try {
      const res = await apiRequest(`/api/users/profile/?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const u = await res.json();
        if (u && u.id) {
          const loc = u.location || 'Mumbai, India';
          const city = u.city || (loc.includes(',') ? loc.split(',')[0].trim() : loc);
          const country = u.country || (loc.includes(',') ? loc.split(',')[1].trim() : 'India');
          const categories = u.categories && u.categories.length > 0 ? u.categories : [u.category || 'Actor'];
          const avatar = u.avatar || u.profile_photo || (u.portfolio?.headshots?.[0]) || mockTalentProfiles[0].avatar;
          const years = u.years_of_experience || u.yearsOfExperience || 2;

          return {
            ...u,
            id: u.id,
            fullName: u.fullName || u.full_name || 'Candidate Artist',
            category: u.category || categories[0],
            categories: categories,
            headline: u.headline || categories.join(' • '),
            location: loc,
            city,
            country,
            avatar,
            bio: u.bio || '',
            skills: u.skills || [],
            languages: u.languages || ['English'],
            yearsOfExperience: years,
            experienceYears: u.experience_years || `${years}+`,
            availabilityStatus: u.availability_status || u.availability || 'Available for Projects',
            verificationStatus: u.is_verified ? 'verified' : (u.review_status || 'verified'),
            isPublished: Boolean(u.is_published),
            portfolio: u.portfolio || { headshots: [avatar] },
          };
        }
      }
    } catch (e) {
      console.warn('Failed to fetch talent by ID from backend:', e);
    }

    return getCandidateById(id);
  },

  /**
   * Synchronous get talent profile by ID fallback
   */
  getTalentById: (id) => {
    const fromDirectory = mockTalentProfiles.find((t) => t.id === id);
    if (fromDirectory) return fromDirectory;
    return getCandidateById(id);
  },


  /**
   * Saved Talent (Recruiter Roster)
   */
  getSavedTalent: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SAVED_TALENT);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  },

  isTalentSaved: (id) => {
    const list = talentService.getSavedTalent();
    return list.some((item) => (typeof item === 'string' ? item === id : item.id === id));
  },

  saveTalent: (talent) => {
    if (!talent || !talent.id) return talentService.getSavedTalent();
    const current = talentService.getSavedTalent();
    
    // Prevent duplicates
    if (current.some((item) => item.id === talent.id)) {
      return current;
    }

    const talentSummary = {
      id: talent.id,
      fullName: talent.fullName,
      headline: talent.headline,
      category: talent.category || (talent.categories && talent.categories[0]) || 'Actor',
      categories: talent.categories || [talent.category || 'Actor'],
      location: talent.location,
      city: talent.city,
      country: talent.country,
      avatar: talent.avatar,
      bio: talent.bio,
      skills: talent.skills || [],
      experienceYears: talent.experienceYears || `${talent.yearsOfExperience || 2}+`,
      yearsOfExperience: talent.yearsOfExperience || 2,
      availabilityStatus: talent.availabilityStatus || 'Available for Projects',
      savedAt: new Date().toISOString(),
    };

    const updated = [talentSummary, ...current];
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_TALENT, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_SAVED_TALENT_CHANGED, { detail: updated }));
    } catch {
      // ignore
    }
    return updated;
  },

  removeSavedTalent: (id) => {
    const current = talentService.getSavedTalent();
    const updated = current.filter((item) => item.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY_SAVED_TALENT, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_SAVED_TALENT_CHANGED, { detail: updated }));
    } catch {
      // ignore
    }
    return updated;
  },

  toggleSaveTalent: (talent) => {
    if (!talent) return false;
    const isSaved = talentService.isTalentSaved(talent.id);
    if (isSaved) {
      talentService.removeSavedTalent(talent.id);
      return false;
    } else {
      talentService.saveTalent(talent);
      return true;
    }
  },

  /**
   * Casting Invitations
   */
  getCastingInvitations: (filter = {}) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INVITATIONS);
      let list = raw ? JSON.parse(raw) : INITIAL_SAMPLE_INVITATIONS;
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(INITIAL_SAMPLE_INVITATIONS));
      }

      if (filter.talentId) {
        list = list.filter((inv) => inv.talentId === filter.talentId);
      }
      if (filter.status) {
        list = list.filter((inv) => inv.status === filter.status);
      }
      return list;
    } catch {
      return INITIAL_SAMPLE_INVITATIONS;
    }
  },

  sendCastingInvitation: async ({
    talentId,
    talentName,
    talentAvatar,
    opportunityId,
    opportunityTitle,
    role,
    shootDate,
    location,
    deadline,
    message,
    sentBy,
  }) => {
    if (!talentId || !opportunityId) {
      throw new Error('Talent ID and Casting Opportunity are required to send an invitation.');
    }

    const current = talentService.getCastingInvitations();

    const newInvitation = {
      id: `inv-${Date.now()}`,
      talentId,
      talentName: talentName || 'Artist',
      talentAvatar: talentAvatar || mockTalentProfiles[0].avatar,
      opportunityId,
      opportunityTitle: opportunityTitle || 'Casting Opportunity',
      role: role || 'Principal Role',
      shootDate: shootDate || 'Upcoming Production Schedule',
      location: location || 'Production Studio',
      deadline: deadline || 'Open',
      message: message ? message.trim() : '',
      status: 'pending',
      sentAt: new Date().toISOString(),
      sentBy: sentBy || 'Apex Vision Studios',
    };

    const updated = [newInvitation, ...current];
    try {
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_INVITATIONS_CHANGED, { detail: updated }));

      // Dispatch notification to candidate's notification feed
      addStoredNotification({
        title: `Audition Invitation: ${opportunityTitle}`,
        message: `${sentBy || 'Production Team'} invited you to audition for the role of ${role}.`,
        type: 'interview_invitation',
        category: 'applications',
        link: '/candidate/notifications',
        actionLabel: 'Review Audition Invite',
      });
    } catch (e) {
      console.error('Failed to save invitation:', e);
    }

    return {
      success: true,
      invitation: newInvitation,
    };
  },

  respondToInvitation: (invitationId, responseStatus) => {
    const list = talentService.getCastingInvitations();
    const updated = list.map((inv) =>
      inv.id === invitationId ? { ...inv, status: responseStatus, respondedAt: new Date().toISOString() } : inv
    );

    try {
      localStorage.setItem(STORAGE_KEY_INVITATIONS, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(EVENT_INVITATIONS_CHANGED, { detail: updated }));
    } catch {
      // ignore
    }

    return updated.find((i) => i.id === invitationId);
  },
};
