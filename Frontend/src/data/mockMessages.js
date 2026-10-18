/**
 * Centralized Mock Messages Data for StageLink In-Website Messaging
 */

export const initialMockMessages = [
  {
    id: 'conv-ops',
    isOperationsTeam: true,
    participant: {
      id: 'ops-team',
      name: 'StageLink Operations Team',
      organization: 'StageLink HQ • Operations & Talent Support',
      role: 'Operations Desk',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      initials: 'OP',
      verified: true,
      badge: 'Official StageLink Operations',
    },
    opportunity: null,
    unreadCount: 0,
    isArchived: false,
    lastMessage: 'Hi! Welcome to StageLink. Text our operations team anytime with any questions about auditions, verification, or payouts.',
    lastMessageTime: 'Active now',
    sharedFiles: [
      {
        id: 'file-ops-guide',
        name: 'StageLink_Performer_Operations_Guide.pdf',
        size: '1.2 MB',
        date: 'Oct 15, 2026',
        type: 'pdf',
      },
    ],
    messages: [
      {
        id: 'm-ops-1',
        senderId: 'ops-team',
        senderName: 'StageLink Operations Team',
        text: 'Hello and welcome! Our Operations Team is here to help you navigate auditions, contract verification, shoot logistics, and banking or compensation queries.',
        timestamp: 'Today 9:00 AM',
        isOwn: false,
        readStatus: 'read',
      },
      {
        id: 'm-ops-2',
        senderId: 'ops-team',
        senderName: 'StageLink Operations Team',
        text: 'Feel free to text us directly using the message box below or click any quick topic prompt.',
        timestamp: 'Today 9:01 AM',
        isOwn: false,
        readStatus: 'read',
      },
    ],
  },
  {
    id: 'conv-1',
    participant: {
      id: 'prod-1',
      name: 'Claire Moreau',
      organization: 'Auteur Pictures',
      role: 'Casting Director',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      initials: 'CM',
      verified: true,
    },
    opportunity: {
      id: 'opp-1',
      title: 'Female Lead — Web Series',
      role: 'Dr. Tanya Roy',
      productionCompany: 'Rising Star Productions',
      category: 'Web Series / OTT Drama',
      compensation: '₹4,50,000 - ₹6,00,000',
      location: 'Mumbai, India',
      deadline: '20 Oct 2026',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    unreadCount: 1,
    isArchived: false,
    lastMessage: 'We reviewed your reel and would love to schedule a Scene 4 self-tape callback.',
    lastMessageTime: '10:45 AM',
    sharedFiles: [
      {
        id: 'file-1',
        name: 'Scene4_Sides_TanyaRoy.pdf',
        size: '1.4 MB',
        date: 'Oct 11, 2026',
        type: 'pdf',
      },
      {
        id: 'file-2',
        name: 'Series_Character_Brief_2026.pdf',
        size: '890 KB',
        date: 'Oct 10, 2026',
        type: 'pdf',
      },
    ],
    messages: [
      {
        id: 'm1',
        senderId: 'prod-1',
        senderName: 'Claire Moreau',
        text: 'Hello Sophia, thank you for submitting your casting materials for Dr. Tanya Roy.',
        timestamp: 'Yesterday 3:15 PM',
        isOwn: false,
        readStatus: 'read',
      },
      {
        id: 'm2',
        senderId: 'cand-1',
        senderName: 'Sophia Bennett',
        text: 'Thank you Claire! I am thrilled about this psychological crime-thriller storyline.',
        timestamp: 'Yesterday 3:30 PM',
        isOwn: true,
        readStatus: 'read',
      },
      {
        id: 'm3',
        senderId: 'prod-1',
        senderName: 'Claire Moreau',
        text: 'We reviewed your reel and would love to schedule a Scene 4 self-tape callback. I have attached the sides in our project folder.',
        timestamp: '10:45 AM',
        isOwn: false,
        readStatus: 'unread',
        attachment: {
          name: 'Scene4_Sides_TanyaRoy.pdf',
          size: '1.4 MB',
          type: 'document',
        },
      },
    ],
  },
  {
    id: 'conv-2',
    participant: {
      id: 'prod-2',
      name: 'Marcus Vance',
      organization: 'Globe Theatre London',
      role: 'Associate Casting Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      initials: 'MV',
      verified: true,
    },
    opportunity: {
      id: 'opp-2',
      title: 'Supporting Lead — Cyber Noir Series',
      role: 'Detective Marcus Kane',
      productionCompany: 'Nova Stream Studios',
      category: 'Web Series',
      compensation: '₹3,00,000 - ₹4,50,000',
      location: 'Bangalore / Hyderabad',
      deadline: '28 Oct 2026',
      image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    },
    unreadCount: 0,
    isArchived: false,
    lastMessage: 'The audition packet has been shared with executive producers for second round reads.',
    lastMessageTime: 'Yesterday',
    sharedFiles: [
      {
        id: 'file-3',
        name: 'CyberNoir_Audition_Packet.pdf',
        size: '2.1 MB',
        date: 'Oct 08, 2026',
        type: 'pdf',
      },
    ],
    messages: [
      {
        id: 'm2-1',
        senderId: 'cand-1',
        senderName: 'Sophia Bennett',
        text: 'Hi Marcus, just checking in regarding the Cyber Noir second round schedule.',
        timestamp: 'Oct 08 2:10 PM',
        isOwn: true,
        readStatus: 'read',
      },
      {
        id: 'm2-2',
        senderId: 'prod-2',
        senderName: 'Marcus Vance',
        text: 'The audition packet has been shared with executive producers for second round reads. We should have dates finalized by this Friday.',
        timestamp: 'Yesterday 4:20 PM',
        isOwn: false,
        readStatus: 'read',
      },
    ],
  },
  {
    id: 'conv-3',
    participant: {
      id: 'prod-3',
      name: 'Elena Rostova',
      organization: 'Lumina Pictures',
      role: 'Executive Producer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      initials: 'ER',
      verified: true,
    },
    opportunity: {
      id: 'opp-3',
      title: 'Lead Artist — "The Velvet Horizon"',
      role: 'Elena Ward',
      productionCompany: 'Auteur Pictures',
      category: 'Feature Film',
      compensation: 'Booked & Wrapped',
      location: 'London, UK / Vienna',
      deadline: 'Completed',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    },
    unreadCount: 0,
    isArchived: true,
    lastMessage: 'Thank you for your exceptional performance on the festival cut wrap.',
    lastMessageTime: 'Sep 28',
    sharedFiles: [
      {
        id: 'file-4',
        name: 'Production_Wrap_Notice_Echoes.pdf',
        size: '420 KB',
        date: 'Sep 28, 2026',
        type: 'pdf',
      },
    ],
    messages: [
      {
        id: 'm3-1',
        senderId: 'prod-3',
        senderName: 'Elena Rostova',
        text: 'Thank you for your exceptional performance on the festival cut wrap.',
        timestamp: 'Sep 28 6:00 PM',
        isOwn: false,
        readStatus: 'read',
      },
      {
        id: 'm3-2',
        senderId: 'cand-1',
        senderName: 'Sophia Bennett',
        text: 'It was an absolute honour working with your entire team Elena. See you at the premiere!',
        timestamp: 'Sep 28 6:45 PM',
        isOwn: true,
        readStatus: 'read',
      },
    ],
  },
];

const MESSAGES_STORAGE_KEY = 'starcast_candidate_messages';

export const getStoredMessages = () => {
  try {
    const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure conv-ops is included
        const hasOps = parsed.some((c) => c.id === 'conv-ops');
        if (!hasOps) {
          return [initialMockMessages[0], ...parsed];
        }
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return initialMockMessages;
};

export const saveStoredMessages = (updatedMessages) => {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(updatedMessages));
  } catch {
    // ignore
  }
};

export const mockMessages = initialMockMessages;
