const SETTINGS_STORAGE_KEY = 'starcast_candidate_settings';

export const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  return {
    allowCastingContact: true,
    notificationPreferences: {
      newMessages: { email: true, inApp: true },
      applicationUpdates: { email: true, inApp: true },
      interviewInvitations: { email: true, inApp: true },
      matchingOpportunities: { email: false, inApp: true },
      reminders: { email: true, inApp: true },
    },
  };
};

export const saveStoredSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
};
