/**
 * Centralized Mock Notifications Data for StageLink
 */

export const initialMockNotifications = [
  {
    id: 'notif-1',
    title: 'Interview Invitation Received',
    message: 'Rising Star Productions invited you to submit a Scene 4 self-tape callback for "Dr. Tanya Roy".',
    timestamp: '2 hours ago',
    read: false,
    type: 'interview_invitation',
    category: 'applications',
    link: '/candidate/applications/app-1',
    actionLabel: 'Audition Details',
  },
  {
    id: 'notif-2',
    title: 'New Casting Message',
    message: 'Claire Moreau (Auteur Pictures): "We reviewed your reel and would love to schedule a callback tape."',
    timestamp: '3 hours ago',
    read: false,
    type: 'new_message',
    category: 'messages',
    link: '/candidate/messages?conversationId=conv-1',
    actionLabel: 'Open Conversation',
  },
  {
    id: 'notif-3',
    title: 'Candidate Shortlisted',
    message: 'Elena Rostova shortlisted you for the female lead role in "The Velvet Horizon".',
    timestamp: 'Yesterday',
    read: false,
    type: 'shortlisted',
    category: 'applications',
    link: '/candidate/applications/app-3',
    actionLabel: 'View Status',
  },
  {
    id: 'notif-4',
    title: 'Self-Tape Deadline Reminder',
    message: 'Reminder: Scene 4 audition callback tape for "Dr. Tanya Roy" is due by Oct 20.',
    timestamp: 'Yesterday',
    read: true,
    type: 'reminder',
    category: 'reminders',
    link: '/candidate/applications/app-1',
    actionLabel: 'Submit Audition',
  },
  {
    id: 'notif-5',
    title: 'Application Under Review',
    message: 'Nova Stream Studios is now reviewing your dramatic showreel for Detective Marcus Kane.',
    timestamp: '2 days ago',
    read: true,
    type: 'application_under_review',
    category: 'applications',
    link: '/candidate/applications/app-2',
    actionLabel: 'Review Application',
  },
  {
    id: 'notif-6',
    title: 'New Matching Opportunity',
    message: 'New casting call matching your dramatic experience: Supporting Lead in Cyber Noir Series.',
    timestamp: '3 days ago',
    read: true,
    type: 'matching_opportunity',
    category: 'opportunities',
    link: '/opportunities/opp-2',
    actionLabel: 'View Opportunity',
  },
  {
    id: 'notif-7',
    title: 'Application Submitted',
    message: 'Your application and composite card for National Commercial Campaign were successfully submitted.',
    timestamp: '4 days ago',
    read: true,
    type: 'application_submitted',
    category: 'applications',
    link: '/candidate/applications/app-4',
    actionLabel: 'View Submission',
  },
  {
    id: 'notif-8',
    title: 'Casting Decision Finalized',
    message: 'Congratulations! You have been accepted for the London West End Globe Theatre 2026 repertory company.',
    timestamp: '1 week ago',
    read: true,
    type: 'application_decision',
    category: 'applications',
    link: '/candidate/applications/app-3',
    actionLabel: 'View Decision',
  },
];

const NOTIFICATIONS_STORAGE_KEY = 'starcast_notifications';

export const getStoredNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // fallback
  }
  return initialMockNotifications;
};

export const saveStoredNotifications = (notifications) => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // ignore
  }
};

export const mockNotifications = initialMockNotifications;
