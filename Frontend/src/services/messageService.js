import { mockMessages } from '../data/mockMessages';

export const messageService = {
  getConversations: async () => [...mockMessages],
  getConversationById: async (id) => mockMessages.find(m => m.id === id) || null,
  sendMessage: async (conversationId, text) => ({
    id: `m-${Date.now()}`,
    text,
    timestamp: 'Just now',
    isOwn: true,
  }),
};
