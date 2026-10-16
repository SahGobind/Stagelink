import React from 'react';
import { Sparkles } from 'lucide-react';

const ProfileProgress = ({ percentage = 85 }) => {
  return (
    <div className="bg-brand-pink-light/40 border border-brand-pink/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-pink" />
          <h4 className="text-sm font-bold text-brand-navy">Profile Strength</h4>
        </div>
        <span className="text-sm font-bold text-brand-pink">{percentage}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-brand-pink h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Complete your showreel upload and body measurements to reach 100% and appear in top searches.
      </p>
    </div>
  );
};

export default ProfileProgress;
