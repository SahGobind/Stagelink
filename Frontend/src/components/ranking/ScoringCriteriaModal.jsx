import React from 'react';
import { ShieldCheck, Award, Video, Calendar, Languages, Clock, MapPin, AlertCircle, Info } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ScoringCriteriaModal = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="StarCast Transparent Role-Matching Engine Rubric"
      size="lg"
    >
      <div className="space-y-5 text-xs text-left max-h-[80vh] overflow-y-auto">
        <p className="text-neutral-600">
          StarCast's scoring engine evaluates candidate profiles strictly against the specific casting call requirements.
          Every applicant receives an explainable breakdown out of 100 points normalized across six key criteria:
        </p>

        {/* 6 Criteria Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-brand-pink" />
                Required Skills &amp; Abilities
              </span>
              <span className="font-mono font-bold text-brand-pink text-xs">30 Points</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Matches candidate abilities (dialogue delivery, method acting, screen combat, dance, etc.) against role requirements.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-brand-pink" />
                Portfolio &amp; Work Samples
              </span>
              <span className="font-mono font-bold text-brand-pink text-xs">25 Points</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Verifies headshot availability (7 pts), dramatic showreels or callback video audition (10 pts), personality slate (5 pts), and casting resume (3 pts).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                Relevant Experience &amp; Credits
              </span>
              <span className="font-mono font-bold text-brand-pink text-xs">15 Points</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Compares candidate professional experience years and listed screen/stage productions against role expectations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-brand-pink" />
                Language &amp; Communication
              </span>
              <span className="font-mono font-bold text-brand-pink text-xs">10 Points</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Evaluates dialogue fluency in required screenplay languages (e.g., Hindi, English, regional dialects).
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-pink" />
                Availability for Shooting Schedule
              </span>
              <span className="font-mono font-bold text-brand-pink text-xs">10 Points</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Assesses candidate schedule status and date flexibility for the designated shooting blocks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-white space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                Location &amp; Travel Feasibility
              </span>
              <span className="font-mono font-bold text-brand-pink text-xs">10 Points</span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Accounts for local residency vs verified domestic/international travel readiness with passport availability.
            </p>
          </div>
        </div>

        {/* Fairness & Ethics Guarantee */}
        <div className="p-4 rounded-2xl bg-neutral-900 text-white space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Non-Discrimination &amp; Algorithmic Fairness Standard</span>
          </div>
          <ul className="space-y-1 text-[11px] text-neutral-300 list-disc list-inside">
            <li><strong>Strict Protected Characteristics Exclusion:</strong> Race, ethnicity, religion, disability, gender, sexual orientation, facial attractiveness analysis, and physical popularity metrics are strictly omitted from calculations.</li>
            <li><strong>No Pay-to-Rank:</strong> Paid subscription tiers or platform payments have zero influence on scores.</li>
            <li><strong>Assistive Only:</strong> No candidate is ever automatically rejected based on match score. Recruiters make independent audition decisions.</li>
            <li><strong>Incomplete Data Protection:</strong> Missing information is not assumed to be lack of ability. Profiles below minimum thresholds display "Not enough information".</li>
          </ul>
        </div>

        <div className="flex justify-end pt-1">
          <Button onClick={onClose} className="text-xs bg-brand-navy hover:bg-neutral-800 text-white">
            Got It
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScoringCriteriaModal;
