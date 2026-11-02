import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AppContext = createContext(null);
const SAVED_OPPS_STORAGE_KEY = 'starcast_saved_opportunities';

export const AppProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_OPPS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : ['opp-1'];
    } catch {
      return ['opp-1'];
    }
  });

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  const toggleSaveOpportunity = useCallback((id) => {
    setSavedOpportunityIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      try {
        localStorage.setItem(SAVED_OPPS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  const isOpportunitySaved = useCallback((id) => savedOpportunityIds.includes(id), [savedOpportunityIds]);

  const value = useMemo(
    () => ({
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      savedOpportunityIds,
      toggleSaveOpportunity,
      isOpportunitySaved,
    }),
    [sidebarOpen, savedOpportunityIds, toggleSidebar, toggleSaveOpportunity, isOpportunitySaved]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
