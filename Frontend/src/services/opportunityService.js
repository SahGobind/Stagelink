import { mockOpportunities } from '../data/mockOpportunities';

export const opportunityService = {
  getAll: async () => [...mockOpportunities],
  getById: async (id) => mockOpportunities.find(o => o.id === id) || null,
  create: async (data) => ({ id: `opp-${Date.now()}`, ...data }),
  update: async (id, data) => ({ id, ...data }),
  delete: async (_id) => true,
};
