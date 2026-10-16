import { mockCandidates, getCandidateProfile, saveCandidateProfile } from '../data/mockCandidates';

export const candidateService = {
  getAll: async () => {
    const primary = getCandidateProfile();
    return [primary, ...mockCandidates.slice(1)];
  },
  getById: async (id) => {
    if (id === 'cand-1') return getCandidateProfile();
    return mockCandidates.find(c => c.id === id) || null;
  },
  updateProfile: async (id, data) => {
    if (id === 'cand-1' || !id) {
      return saveCandidateProfile(data);
    }
    return { ...mockCandidates[0], ...data };
  },
};
