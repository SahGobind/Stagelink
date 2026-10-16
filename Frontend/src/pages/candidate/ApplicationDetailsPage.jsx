import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  Video,
  FileText,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import ApplicationTimeline from '../../components/applications/ApplicationTimeline';
import { getApplicationById, getAllApplications } from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';
import { initialCandidateProfile } from '../../data/mockCandidates';
import { calculateCandidateMatchScore } from '../../services/scoringEngine';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);

  useEffect(() => {
    const found = getApplicationById(id) || getAllApplications()[0];
    setApplication(found);
  }, [id]);

  const opportunity = useMemo(() => {
    if (!application) return null;
    return mockOpportunities.find((o) => o.id === application.opportunityId) || null;
  }, [application]);

  // Compute matched requirements & improvement suggestions for this candidate
  const matchResult = useMemo(() => {
    if (!opportunity) return null;
    return calculateCandidateMatchScore(initialCandidateProfile, opportunity);
  }, [opportunity]);

  if (!application) {
    return (
      <PageContainer maxWidth="lg" className="py-12 text-center">
        <p className="text-gray-500">Loading application details...</p>
      </PageContainer>
    );
  }

  const interview = application.interviewDetails || null;

  return (
    <PageContainer maxWidth="lg" className="space-y-6 text-left">
      <Link
        to="/candidate/applications"
        className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-brand-pink transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to My Applications</span>
      </Link>

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-card space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ApplicationStatusBadge status={application.status} />
              <span className="text-xs text-gray-400 font-mono">Ref #{application.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
              {application.opportunityTitle}
            </h1>
            <p className="text-xs text-gray-500">
              Applied for: <strong className="text-brand-pink font-semibold">{application.roleAppliedFor}</strong> in {application.productionCompany}
            </p>
          </div>

          <Link to={`/candidate/messages?opp=${application.opportunityId}`}>
            <Button variant="outline" size="sm" className="space-x-2 text-xs">
              <MessageSquare className="w-4 h-4 text-brand-pink" />
              <span>Contact Casting Studio</span>
            </Button>
          </Link>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Audition Status Timeline
          </h3>
          <ApplicationTimeline currentStatus={application.status} />
        </div>

        {/* Scheduled Audition / Callback Invitation Card */}
        {interview && (
          <div className="p-5 bg-pink-50/50 border border-pink-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-brand-pink font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Audition Callback Invitation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-pink-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Date &amp; Time</span>
                <span className="font-bold text-gray-900">{interview.date} at {interview.time}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-pink-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Callback Mode</span>
                <span className="font-bold text-gray-900">{interview.mode}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-pink-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Studio Location</span>
                <span className="font-bold text-gray-900">{application.location || 'Mumbai, India'}</span>
              </div>
            </div>
            {interview.notes && (
              <div className="p-3 bg-white/80 rounded-xl border border-pink-100 text-xs text-gray-700">
                <strong className="text-gray-900">Preparation Instructions: </strong>
                {interview.notes}
              </div>
            )}
          </div>
        )}

        {/* Matched Role Requirements Section */}
        {matchResult && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-pink" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Role Requirements You Matched
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchResult.breakdowns
                .filter((b) => b.pointsAwarded > 0)
                .map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-neutral-50/80 rounded-2xl border border-neutral-150 flex items-start gap-2.5 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-900 text-xs">{b.criterionName}</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{b.evidenceUsed}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Profile Improvement Recommendations */}
        {matchResult?.improvementSuggestions && matchResult.improvementSuggestions.length > 0 && (
          <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-sky-900 font-bold">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Recommended Profile Enhancements for Future Applications</span>
            </div>
            <p className="text-[11px] text-sky-800">
              Adding the following items to your StarCast performer profile will strengthen compatibility evaluations across casting opportunities:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-sky-900 font-medium pl-1">
              {matchResult.improvementSuggestions.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submitted Materials */}
        {application.submittedMaterials && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Your Submitted Audition Materials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {application.submittedMaterials.resume && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-pink" />
                  <span className="font-medium text-gray-800">{application.submittedMaterials.resume.fileName}</span>
                </div>
              )}
              {application.submittedMaterials.videoAudition && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-pink" />
                  <span className="font-medium text-gray-800">{application.submittedMaterials.videoAudition.title}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Privacy Statement */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-150 text-[10.5px] text-neutral-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Candidate Privacy Protected: Confidential casting reviews and internal ranking numbers are restricted to authorized casting directors.
          </span>
        </div>
      </div>
    </PageContainer>
  );
};

export default ApplicationDetailsPage;
