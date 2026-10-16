import { mockApplications } from '../data/mockApplications';

export const applicationService = {
  getAll: async () => [...mockApplications],
  getByCandidateId: async (candidateId) => mockApplications.filter(a => a.candidateId === candidateId),
  getById: async (id) => mockApplications.find(a => a.id === id) || null,
  apply: async (data) => ({ id: `app-${Date.now()}`, ...data, status: 'submitted' }),
  updateStatus: async (id, status) => ({ id, status }),
};
