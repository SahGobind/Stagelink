import React from 'react';

const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) => {
  return (
    <div
      role="tablist"
      aria-label="Navigation Tabs"
      className={`flex border-b border-brand-border overflow-x-auto no-scrollbar gap-2 sm:gap-4 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`py-3 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-150 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              isActive
                ? 'border-brand-pink text-brand-pink'
                : 'border-transparent text-brand-text-secondary hover:text-brand-navy hover:border-gray-300'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 text-[11px] rounded-full font-bold transition-colors ${
                  isActive
                    ? 'bg-brand-pink-light text-brand-pink'
                    : 'bg-gray-100 text-brand-text-secondary'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
