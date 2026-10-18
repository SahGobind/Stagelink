import { getCandidatesList, getCandidateById, getCandidateProfile, saveCandidateProfile } from '../data/mockCandidates';

export const candidateService = {
  getAll: async () => {
    return getCandidatesList();
  },
  getById: async (id) => {
    if (!id || id === 'me' || id === 'cand-1') {
      return getCandidateProfile();
    }
    return getCandidateById(id);
  },
  updateProfile: async (id, data, user) => {
    return saveCandidateProfile(data, user);
  },
};
