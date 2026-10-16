import React from 'react';
import Select from '../common/Select';
import { OPPORTUNITY_TYPES } from '../../utils/constants';

const OpportunityFilters = ({ selectedType, onTypeChange, selectedStatus, onStatusChange }) => {
  const typeOptions = Object.values(OPPORTUNITY_TYPES);
  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Open Castings', value: 'open' },
    { label: 'Closing Soon', value: 'closing_soon' },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
      <div className="w-full sm:w-64">
        <Select
          placeholder="Filter by Production Type"
          options={typeOptions}
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-48">
        <Select
          placeholder="Filter by Status"
          options={statusOptions}
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default OpportunityFilters;
