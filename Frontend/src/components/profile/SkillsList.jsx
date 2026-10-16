import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Clapperboard,
  Camera,
  Music,
  Mic,
  Drama,
  Activity,
  Globe,
  Tag,
  Edit2,
  Plus,
} from 'lucide-react';

const SkillsList = ({ skills = [], skillsByCategory, languages = [] }) => {
  const [viewMode, setViewMode] = useState('categorized'); // 'categorized' | 'all'

  // Default categorized skills if not passed or empty
  const categories = [
    {
      key: 'acting',
      label: 'Acting Disciplines',
      icon: Clapperboard,
      items: skillsByCategory?.acting || [
        'Method Acting',
        'Classical Verse',
        'Meisner Technique',
        'Improvisation',
        'Monologue Delivery',
      ],
    },
    {
      key: 'theatre',
      label: 'Theatre & Stage',
      icon: Drama,
      items: skillsByCategory?.theatre || [
        'West End Repertoire',
        'Shakespearean Diction',
        'Stage Combat',
      ],
    },
    {
      key: 'voiceActing',
      label: 'Voice & Dialects',
      icon: Mic,
      items: skillsByCategory?.voiceActing || [
        'British RP Accent',
        'Transatlantic Accent',
        'Audiobook Narration',
        'Commercial VO',
      ],
    },
    {
      key: 'dance',
      label: 'Dance & Movement',
      icon: Sparkles,
      items: skillsByCategory?.dance || [
        'Contemporary Dance',
        'Ballet Basics',
        'Stage Movement',
      ],
    },
    {
      key: 'singing',
      label: 'Singing & Vocal',
      icon: Music,
      items: skillsByCategory?.singing || ['Mezzo-Soprano', 'Musical Theatre', 'Folk'],
    },
    {
      key: 'modeling',
      label: 'Modeling & Editorial',
      icon: Camera,
      items: skillsByCategory?.modeling || ['Editorial Print', 'Commercial Print', 'Runway Walk'],
    },
    {
      key: 'otherSkills',
      label: 'Special Stunts & Athletic',
      icon: Activity,
      items: skillsByCategory?.otherSkills || [
        'Horseback Riding',
        'Screen Combat',
        'Fencing',
        'Swimming',
      ],
    },
  ].filter((c) => c.items && c.items.length > 0);

  // Flattened all unique skills
  const allSkillsList = Array.from(
    new Set([
      ...skills,
      ...categories.flatMap((c) => c.items),
    ])
  );

  return (
    <div className="bg-white rounded-3xl border border-brand-border p-6 sm:p-8 shadow-card space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-navy" />
            <h2 className="text-xl font-bold text-brand-navy font-serif">
              Performance Skills & Spoken Dialects
            </h2>
          </div>
          <p className="text-xs text-brand-text-secondary mt-0.5">
            Verified casting attributes and athletic performance disciplines
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('categorized')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'categorized'
                  ? 'bg-white text-brand-navy shadow-xs font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              By Category
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-brand-navy shadow-xs font-bold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              All Skills ({allSkillsList.length})
            </button>
          </div>

          <Link
            to="/candidate/profile/edit?tab=skills"
            className="px-3.5 py-1.5 rounded-xl bg-brand-navy text-white hover:opacity-90 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-opacity"
            title="Edit Skills & Dropdown"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Skills</span>
          </Link>
        </div>
      </div>

      {/* Spoken Languages Bar */}
      {languages && languages.length > 0 && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-navy">
            <Globe className="w-4 h-4 text-brand-navy" />
            <span>Spoken Languages & Accents on Camera</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {languages.map((lang, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-brand-navy shadow-2xs"
              >
                🗣️ {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categorized Skills View */}
      {viewMode === 'categorized' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.key}
                className="p-4 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-brand-navy">
                  <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-brand-navy shadow-2xs">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{cat.label}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200/80 text-[11px] font-medium text-brand-navy shadow-2xs hover:border-brand-navy transition-colors"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat All Skills View */
        <div className="flex flex-wrap gap-2">
          {allSkillsList.map((skill, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-brand-navy text-xs font-medium border border-gray-200 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Tag className="w-3 h-3 text-gray-400" />
              <span>{skill}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsList;
