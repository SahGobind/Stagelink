import { getCandidatesList, getCandidateById, getCandidateProfile, saveCandidateProfile } from '../data/mockCandidates';
import { apiRequest } from './api';

export const candidateService = {
  /**
   * Fetch all registered candidates / talent from MongoDB Atlas backend
   */
  getAll: async (publishedOnly = false) => {
    try {
      const url = `/api/users/?role=talent${publishedOnly ? '&published_only=true' : ''}`;
      const res = await apiRequest(url);
      if (res.ok) {
        const users = await res.json();
        if (Array.isArray(users) && users.length > 0) {
          const mockList = getCandidatesList();
          const formattedBackend = users.map((u) => {
            const loc = u.location || 'Mumbai, India';
            const city = u.city || (loc.includes(',') ? loc.split(',')[0].trim() : loc);
            const country = u.country || (loc.includes(',') ? loc.split(',')[1].trim() : 'India');
            const categories = u.categories && u.categories.length > 0 ? u.categories : [u.category || 'Actor'];
            const avatar = u.avatar || u.profile_photo || (u.portfolio?.headshots?.[0]) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
            const years = u.years_of_experience || u.yearsOfExperience || 2;

            return {
              id: u.id,
              fullName: u.fullName || u.full_name || 'Candidate Artist',
              email: u.email,
              headline: u.headline || `${categories.join(' • ')}`,
              category: u.category || categories[0],
              categories: categories,
              location: loc,
              city,
              country,
              avatar: avatar,
              bio: u.bio || `${u.fullName || 'Talent'} is an accomplished performer registered on StageLink.`,
              skills: u.skills && u.skills.length > 0 ? u.skills : ['Screen Acting', 'Dialogue Delivery'],
              languages: u.languages && u.languages.length > 0 ? u.languages : ['English', 'Hindi'],
              yearsOfExperience: years,
              experienceYears: u.experience_years || `${years}+`,
              experienceLevel: u.experience_level || `${years}+ Years`,
              availabilityStatus: u.availability_status || u.availability || 'Available for Projects',
              isVerified: u.is_verified || false,
              verificationStatus: u.is_verified ? 'verified' : (u.review_status || 'pending_review'),
              isPublished: Boolean(u.is_published),
              instagram: u.instagram || u.portfolio?.instagram || u.social_links?.instagram || '',
              portfolio: u.portfolio || { headshots: [avatar] },
              createdAt: u.created_at,
            };
          });

          // Merge: backend users first, supplemented by unique mock profiles not in backend
          const backendIds = new Set(formattedBackend.map((b) => b.id));
          const supplementaryMocks = mockList.filter((m) => !backendIds.has(m.id));

          return [...formattedBackend, ...supplementaryMocks];
        }
      }
    } catch (err) {
      console.warn('Failed to fetch candidate list from backend:', err);
    }

    return getCandidatesList();
  },

  /**
   * Fetch candidate profile by ID from MongoDB Atlas backend
   */
  getById: async (id) => {
    const targetId = !id || id === 'me' ? 'cand-aanya' : id;

    try {
      const res = await apiRequest(`/api/users/profile/?id=${encodeURIComponent(targetId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          const loc = data.location || 'Mumbai, India';
          const categories = data.categories && data.categories.length > 0 ? data.categories : [data.category || 'Actor'];
          const avatar = data.avatar || (data.portfolio?.headshots?.[0]) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
          const years = data.years_of_experience || data.yearsOfExperience || 2;

          return {
            ...data,
            fullName: data.fullName || data.full_name || 'Candidate Artist',
            headline: data.headline || categories.join(' • '),
            category: data.category || categories[0],
            categories: categories,
            location: loc,
            city: data.city || (loc.includes(',') ? loc.split(',')[0].trim() : loc),
            country: data.country || (loc.includes(',') ? loc.split(',')[1].trim() : 'India'),
            avatar: avatar,
            bio: data.bio || '',
            skills: data.skills || [],
            languages: data.languages || ['English'],
            yearsOfExperience: years,
            experienceYears: data.experience_years || `${years}+`,
            availabilityStatus: data.availability_status || data.availabilityStatus || 'Available for Projects',
            isPublished: Boolean(data.is_published),
            instagram: data.instagram || data.portfolio?.instagram || data.social_links?.instagram || '',
            portfolio: data.portfolio || { headshots: [avatar] },
          };
        }
      }
    } catch (err) {
      console.warn('Failed to load candidate profile from backend:', err);
    }

    if (!id || id === 'me' || id === 'cand-1' || id === 'cand-aanya') {
      return getCandidateProfile();
    }
    return getCandidateById(id);
  },

  /**
   * Update candidate profile on MongoDB Atlas backend
   */
  updateProfile: async (id, data, user) => {
    const targetId = id || user?.id || 'cand-aanya';

    const res = await apiRequest(`/api/users/profile/?id=${encodeURIComponent(targetId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMsg = 'Failed to save profile changes to database.';
      try {
        const errJson = await res.json();
        errorMsg = errJson.error || errJson.details || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }

    const resData = await res.json();
    const updated = resData.user || data;

    // Synchronize local storage cache
    const saved = saveCandidateProfile(updated, user);
    return saved;
  },

  /**
   * Validate and publish candidate profile to MongoDB Atlas backend
   */
  publishProfile: async (id, data, user) => {
    const targetId = id || user?.id || 'cand-aanya';

    const res = await apiRequest(`/api/users/profile/publish/?id=${encodeURIComponent(targetId)}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    const resJson = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(resJson.error || 'Failed to publish profile.');
      err.missingFields = resJson.missing_fields || [];
      err.missingLabels = resJson.missing_labels || [];
      err.code = resJson.code || 'PUBLISH_FAILED';
      throw err;
    }

    const publishedUser = resJson.user || { ...data, is_published: true };
    const saved = saveCandidateProfile(publishedUser, user);

    // Dispatch update events for all listening views
    window.dispatchEvent(new CustomEvent('starcast_profile_updated', { detail: saved }));
    window.dispatchEvent(new CustomEvent('starcast_candidate_published', { detail: saved }));

    return {
      success: true,
      message: resJson.message || 'Profile published successfully!',
      user: saved,
    };
  },

  /**
   * Unpublish candidate profile (take offline from Discover Talent)
   */
  unpublishProfile: async (id, user) => {
    const targetId = id || user?.id || 'cand-aanya';

    const res = await apiRequest(`/api/users/profile/unpublish/?id=${encodeURIComponent(targetId)}`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Failed to unpublish profile.');
    }

    const updated = saveCandidateProfile({ is_published: false }, user);
    window.dispatchEvent(new CustomEvent('starcast_profile_updated', { detail: updated }));
    return updated;
  },
};
