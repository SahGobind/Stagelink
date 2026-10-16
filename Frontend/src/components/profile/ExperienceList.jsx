import React from 'react';
import { Film, Clapperboard, Calendar, User } from 'lucide-react';

const ExperienceList = ({ experience = [] }) => {
  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-brand-navy" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">
              Acting Credits & Previous Projects
            </h2>
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Screen, television, and theatrical productions
          </p>
        </div>
        <span className="text-xs font-semibold text-brand-navy bg-gray-100 px-3 py-1 rounded-full">
          {experience.length} Credits
        </span>
      </div>

      {experience.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-xs">
          <Film className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No previous projects recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((exp, idx) => (
            <div
              key={exp.id || idx}
              className="group p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-gray-300 bg-gray-50/50 hover:bg-white transition-all shadow-2xs hover:shadow-subtle"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-brand-navy">
                      {exp.project}
                    </h3>
                    {exp.type && (
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-pink-light text-brand-pink text-[10px] font-bold">
                        {exp.type}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-brand-pink flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Role: {exp.role}</span>
                  </p>
                  {exp.director && (
                    <p className="text-[11px] text-gray-500">
                      Director / Production: {exp.director}
                    </p>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg self-start">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>{exp.year}</span>
                </span>
              </div>

              {exp.description && (
                <p className="text-xs text-brand-text-secondary mt-3 leading-relaxed pt-2 border-t border-gray-100/80">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceList;
