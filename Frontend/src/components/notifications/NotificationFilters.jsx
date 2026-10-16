import React from 'react';
import {
  Bell,
  MessageSquare,
  Briefcase,
  Film,
  Calendar,
} from 'lucide-react';

const NotificationFilters = ({
  activeFilter,
  onFilterChange,
  counts = {},
}) => {
  const filters = [
    { id: 'all', label: 'All', icon: Bell, count: counts.all },
    { id: 'messages', label: 'Messages', icon: MessageSquare, count: counts.messages },
    { id: 'applications', label: 'Application Updates', icon: Briefcase, count: counts.applications },
    { id: 'opportunities', label: 'Opportunities', icon: Film, count: counts.opportunities },
    { id: 'reminders', label: 'Reminders', icon: Calendar, count: counts.reminders },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl">
      {filters.map((f) => {
        const Icon = f.icon;
        const isActive = activeFilter === f.id;

        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onFilterChange(f.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-black text-white shadow-xs font-bold'
                : 'text-gray-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{f.label}</span>
            {f.count !== undefined && f.count > 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white text-black' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {f.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default NotificationFilters;
