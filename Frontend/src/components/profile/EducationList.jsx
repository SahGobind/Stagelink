import React from 'react';
import { GraduationCap, Calendar, BookOpen } from 'lucide-react';

const EducationList = ({ education = [] }) => {
  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-navy" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">
              Training & Acting Education
            </h2>
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Conservatory programs, certifications, and masterclasses
          </p>
        </div>
        <span className="text-xs font-semibold text-brand-navy bg-gray-100 px-3 py-1 rounded-full">
          {education.length} Programs
        </span>
      </div>

      {education.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-xs">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No training history listed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu, idx) => (
            <div
              key={edu.id || idx}
              className="p-4 sm:p-5 rounded-2xl border border-gray-100 hover:border-gray-300 bg-gray-50/50 hover:bg-white transition-all shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-brand-navy flex items-center gap-2">
                    <span>{edu.institution}</span>
                  </h3>
                  <p className="text-xs font-semibold text-brand-pink mt-0.5">
                    {edu.degree || edu.program}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-lg self-start">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>{edu.year}</span>
                </span>
              </div>

              {edu.notes && (
                <p className="text-xs text-brand-text-secondary mt-3 leading-relaxed pt-2 border-t border-gray-100/80">
                  {edu.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationList;
