import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Star,
  Calendar,
  Languages,
  MapPin,
  Clock,
  Video,
  FileText,
  Award,
  ExternalLink,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import ScoreBadge from './ScoreBadge';

const CandidateComparisonModal = ({
  isOpen,
  onClose,
  applications = [],
  onShortlist,
  onInviteAudition,
}) => {
  if (!isOpen || applications.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Candidate Comparison Matrix (${applications.length} Candidates)`}
      size="xl"
    >
      <div className="space-y-6 text-xs text-left max-h-[82vh] overflow-y-auto">
        <p className="text-neutral-500">
          Comparing candidates side-by-side across all 6 transparent role criteria, verified credits, and audition materials.
        </p>

        {/* Comparison Table / Matrix */}
        <div className="overflow-x-auto border border-neutral-200 rounded-2xl shadow-2xs bg-white">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="p-4 text-left font-bold text-neutral-600 text-xs w-48 uppercase tracking-wider">
                  Criterion / Aspect
                </th>
                {applications.map((app) => (
                  <th key={app.id} className="p-4 text-left font-bold text-neutral-900 border-l border-neutral-200 min-w-[220px]">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        src={app.candidate?.avatar || app.candidateAvatar}
                        name={app.candidate?.fullName || app.candidateName}
                        size="md"
                      />
                      <div className="space-y-0.5">
                        <p className="font-bold text-xs text-neutral-900">
                          {app.candidate?.fullName || app.candidateName}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-normal">
                          {app.roleAppliedFor}
                        </p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {/* Overall Match Score */}
              <tr className="bg-pink-50/20">
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-pink" />
                    <span>Overall Match Score</span>
                  </div>
                </td>
                {applications.map((app) => {
                  const score = app.match_score?.total_score || 0;
                  return (
                    <td key={app.id} className="p-3.5 border-l border-neutral-200">
                      <ScoreBadge
                        score={score}
                        status={app.match_score?.status}
                        size="md"
                        showDetailsBtn={false}
                      />
                    </td>
                  );
                })}
              </tr>

              {/* 1. Skills (30 pts) */}
              <tr>
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Skills Match (30 pts)</span>
                  </div>
                </td>
                {applications.map((app) => {
                  const b = (app.match_score?.breakdowns || []).find(x => x.criterion_key === 'skills' || x.criterionKey === 'skills');
                  const skills = app.candidate?.skills || [];
                  return (
                    <td key={app.id} className="p-3.5 border-l border-neutral-200 space-y-1.5">
                      <div className="font-mono font-bold text-xs text-neutral-900">
                        {Math.round(b?.points_awarded || 0)} / 30 pts
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-700 text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* 2. Portfolio & Work Samples (25 pts) */}
              <tr>
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Portfolio &amp; Samples (25 pts)</span>
                  </div>
                </td>
                {applications.map((app) => {
                  const b = (app.match_score?.breakdowns || []).find(x => x.criterion_key === 'portfolio' || x.criterionKey === 'portfolio');
                  return (
                    <td key={app.id} className="p-3.5 border-l border-neutral-200 space-y-1">
                      <div className="font-mono font-bold text-xs text-neutral-900">
                        {Math.round(b?.points_awarded || 0)} / 25 pts
                      </div>
                      <p className="text-[11px] text-neutral-600 line-clamp-2">
                        {b?.evidence_used || 'Standard portfolio submitted.'}
                      </p>
                    </td>
                  );
                })}
              </tr>

              {/* 3. Relevant Experience & Credits (15 pts) */}
              <tr>
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Experience &amp; Credits (15 pts)</span>
                  </div>
                </td>
                {applications.map((app) => {
                  const b = (app.match_score?.breakdowns || []).find(x => x.criterion_key === 'experience' || x.criterionKey === 'experience');
                  return (
                    <td key={app.id} className="p-3.5 border-l border-neutral-200 space-y-1">
                      <div className="font-mono font-bold text-xs text-neutral-900">
                        {Math.round(b?.points_awarded || 0)} / 15 pts
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {app.candidate?.experienceLevel || `${app.candidate?.yearsOfExperience || 2}+ Yrs Exp`}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* 4. Language & Communication (10 pts) */}
              <tr>
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Language (10 pts)</span>
                  </div>
                </td>
                {applications.map((app) => {
                  const b = (app.match_score?.breakdowns || []).find(x => x.criterion_key === 'language' || x.criterionKey === 'language');
                  return (
                    <td key={app.id} className="p-3.5 border-l border-neutral-200 space-y-1">
                      <div className="font-mono font-bold text-xs text-neutral-900">
                        {Math.round(b?.points_awarded || 0)} / 10 pts
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        {(app.candidate?.languages || ['Hindi', 'English']).join(', ')}
                      </p>
                    </td>
                  );
                })}
              </tr>

              {/* 5. Availability (10 pts) */}
              <tr>
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Availability (10 pts)</span>
                  </div>
                </td>
                {applications.map((app) => {
                  const b = (app.match_score?.breakdowns || []).find(x => x.criterion_key === 'availability' || x.criterionKey === 'availability');
                  return (
                    <td key={app.id} className="p-3.5 border-l border-neutral-200 space-y-1">
                      <div className="font-mono font-bold text-xs text-neutral-900">
                        {Math.round(b?.points_awarded || 0)} / 10 pts
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        {app.candidate?.availabilityStatus || 'Available for Projects'}
                      </p>
                    </td>
                  );
                })}
              </tr>

              {/* 6. Location & Travel (10 pts) */}
              <tr>
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/50">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Location &amp; Travel (10 pts)</span>
                  </div>
                </td>
                {applications.map((app) => {
                  const b = (app.match_score?.breakdowns || []).find(x => x.criterion_key === 'location' || x.criterionKey === 'location');
                  return (
                    <td key={app.id} className="p-3.5 border-l border-neutral-200 space-y-1">
                      <div className="font-mono font-bold text-xs text-neutral-900">
                        {Math.round(b?.points_awarded || 0)} / 10 pts
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        {app.candidate?.location || 'Unspecified'}
                      </p>
                    </td>
                  );
                })}
              </tr>

              {/* Actions Row */}
              <tr className="bg-neutral-50/60">
                <td className="p-3.5 font-bold text-neutral-900 bg-neutral-50/80">
                  Recruiter Actions
                </td>
                {applications.map((app) => (
                  <td key={app.id} className="p-3.5 border-l border-neutral-200">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => onShortlist && onShortlist(app.id, app.is_shortlisted ? 'unshortlist' : 'shortlist')}
                        className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          app.is_shortlisted
                            ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            : 'bg-white border border-neutral-300 hover:border-brand-pink text-neutral-800'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${app.is_shortlisted ? 'fill-current text-amber-500' : ''}`} />
                        <span>{app.is_shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onInviteAudition && onInviteAudition(app)}
                        className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Audition Callback</span>
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="outline" className="text-xs">
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CandidateComparisonModal;
