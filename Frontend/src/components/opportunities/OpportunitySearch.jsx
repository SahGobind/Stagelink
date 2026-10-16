import React from 'react';
import { Search } from 'lucide-react';

const OpportunitySearch = ({ value, onChange, placeholder = 'Search castings by title, company, or keyword...' }) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all shadow-subtle"
      />
    </div>
  );
};

export default OpportunitySearch;
