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
  XCircle,
  RotateCcw,
  Star,
  Building2,
  Quote,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import BackButton from '../../components/common/BackButton';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ApplicationStatusBadge from '../../components/applications/ApplicationStatusBadge';
import ApplicationTimeline from '../../components/applications/ApplicationTimeline';
import CompanyRatingModal from '../../components/feedback/CompanyRatingModal';
import ProductionFeedbackCard from '../../components/feedback/ProductionFeedbackCard';
import { getApplicationById, getAllApplications } from '../../data/mockApplications';
import { mockOpportunities } from '../../data/mockOpportunities';
import { initialCandidateProfile } from '../../data/mockCandidates';
import { applicationService } from '../../services/applicationService';
import { feedbackService } from '../../services/feedbackService';
import { calculateCandidateMatchScore } from '../../services/scoringEngine';

const ApplicationDetailsPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Two-way rating & feedback state
  const [productionFeedback, setProductionFeedback] = useState(null);
  const [isCompanyRatingModalOpen, setIsCompanyRatingModalOpen] = useState(false);
  const [companyStats, setCompanyStats] = useState({ averageRating: 4.9, totalReviews: 1 });
  const [myCompanyReview, setMyCompanyReview] = useState(null);

  useEffect(() => {
    const found = getApplicationById(id) || getAllApplications().find((a) => a.id === id) || getAllApplications()[0];
    setApplication(found);

    if (found) {
      // 1. Check if studio has evaluated this audition/production
      feedbackService.getApplicationProductionFeedback(found.id).then((fb) => {
        if (fb) {
          setProductionFeedback(fb);
        } else if (found.production_feedback || found.productionFeedback) {
          setProductionFeedback(found.production_feedback || found.productionFeedback);
        }
      });

      // 2. Fetch candidate's reviews of this production company
      const compName = found.productionCompany || found.production_company || 'Rising Star Productions';
      feedbackService.getCompanyReviews(compName).then((res) => {
        setCompanyStats({ averageRating: res.averageRating || 4.9, totalReviews: res.totalReviews || 0 });
        const mine = (res.reviews || []).find(
          (r) => r.candidate_id === (found.candidateId || 'cand-1')
        );
        if (mine) setMyCompanyReview(mine);
      });
    }
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

  const handleWithdrawConfirm = async () => {
    if (!application) return;
    setIsWithdrawing(true);
    try {
      const res = await applicationService.withdrawApplication(application.id);
      if (res.success) {
        setApplication((prev) => ({
          ...prev,
          status: 'withdrawn',
        }));
        setWithdrawSuccess(true);
        setTimeout(() => {
          setIsWithdrawModalOpen(false);
          setWithdrawSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!application) {
    return (
      <PageContainer maxWidth="lg" className="py-12 text-center">
        <p className="text-gray-500">Loading application details...</p>
      </PageContainer>
    );
  }

  const interview = application.interviewDetails || application.audition_invitation || null;
  const canWithdraw =
    application.status !== 'withdrawn' &&
    application.status !== 'rejected' &&
    application.status !== 'selected';

  return (
    <PageContainer maxWidth="lg" className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <BackButton fallback="/candidate/applications" label="Back to My Applications" variant="light" />

        {canWithdraw && (
          <button
            type="button"
            onClick={() => setIsWithdrawModalOpen(true)}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Withdraw Application
          </button>
        )}
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-3d-card specular-top space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ApplicationStatusBadge status={application.status} />
              <span className="text-xs text-slate-400 font-mono">Ref #{application.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
              {application.opportunityTitle}
            </h1>
            <p className="text-xs text-gray-500">
              Applied for:{' '}
              <strong className="text-brand-pink font-semibold">
                {application.roleAppliedFor}
              </strong>{' '}
              in {application.productionCompany}
            </p>
          </div>

          <Link to={`/candidate/messages?opp=${application.opportunityId}`}>
            <Button variant="outline" size="sm" className="space-x-2 text-xs">
              <MessageSquare className="w-4 h-4 text-brand-pink" />
              <span>Contact Operations Team</span>
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
        {interview && application.status === 'audition_requested' && (
          <div className="p-5 bg-pink-50/50 border border-pink-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-brand-pink font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Audition Callback Invitation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-pink-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Date &amp; Time
                </span>
                <span className="font-bold text-gray-900">
                  {interview.date} at {interview.time} {interview.timezone || 'IST'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-pink-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Callback Mode
                </span>
                <span className="font-bold text-gray-900">{interview.mode}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-pink-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Submission Deadline
                </span>
                <span className="font-bold text-gray-900">
                  {interview.deadline || interview.submission_deadline || 'Prior to callback call'}
                </span>
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

        {/* STUDIO PRODUCTION & AUDITION EVALUATION */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Studio Audition Evaluation & Performance Rating
              </h3>
            </div>
            {productionFeedback && (
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ★ {Number(productionFeedback.rating).toFixed(1)} / 5.0 Verified Score
              </span>
            )}
          </div>

          {productionFeedback ? (
            <ProductionFeedbackCard feedback={productionFeedback} />
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-left space-y-1">
              <span className="text-xs font-bold text-neutral-800">
                Evaluation Pending from {application.productionCompany || 'Production Studio'}
              </span>
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                The casting team reviews submitted showreels, self-tapes, and audition sides during stage progression. Once evaluated, your verified 1–5 star rating and director notes will appear directly in this section.
              </p>
            </div>
          )}
        </div>

        {/* CANDIDATE REVIEW OF PRODUCTION COMPANY */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-navy" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Your Review of {application.productionCompany || 'Production House'}
                </h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                StageLink studio rating: <span className="font-bold text-black">★ {companyStats.averageRating}</span> ({companyStats.totalReviews} performer {companyStats.totalReviews === 1 ? 'review' : 'reviews'})
              </p>
            </div>

            <Button
              size="sm"
              variant={myCompanyReview ? 'outline' : 'primary'}
              onClick={() => setIsCompanyRatingModalOpen(true)}
              className="text-xs shrink-0 self-start sm:self-auto gap-1.5"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{myCompanyReview ? 'Edit Your Studio Review' : 'Rate & Review Studio'}</span>
            </Button>
          </div>

          {myCompanyReview ? (
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Your Rating: {Number(myCompanyReview.rating).toFixed(1)} / 5.0
                </span>
                <span className="text-[10px] text-amber-800 font-medium">
                  {myCompanyReview.created_at ? new Date(myCompanyReview.created_at).toLocaleDateString() : 'Recently'}
                </span>
              </div>
              <p className="text-xs text-neutral-700 italic">
                &ldquo;{myCompanyReview.feedback}&rdquo;
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-neutral-50/60 border border-dashed border-neutral-200 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-neutral-600">
                Have you auditioned or communicated with <strong className="text-black">{application.productionCompany}</strong>? Leave feedback to support the actor community.
              </p>
              <button
                type="button"
                onClick={() => setIsCompanyRatingModalOpen(true)}
                className="text-xs font-bold text-black hover:underline shrink-0"
              >
                Write a Review →
              </button>
            </div>
          )}
        </div>

        {/* Profile Improvement Recommendations */}
        {matchResult?.improvementSuggestions && matchResult.improvementSuggestions.length > 0 && (
          <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-sky-900 font-bold">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Recommended Profile Enhancements for Future Applications</span>
            </div>
            <p className="text-[11px] text-sky-800">
              Adding the following items to your StageLink performer profile will strengthen compatibility evaluations across casting opportunities:
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
                  <span className="font-medium text-gray-800">
                    {application.submittedMaterials.resume.fileName || 'Elena_Rostova_Resume.pdf'}
                  </span>
                </div>
              )}
              {(application.submittedMaterials.videoAudition || application.submittedMaterials.portfolioUrl) && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2">
                  <Video className="w-4 h-4 text-brand-pink" />
                  <span className="font-medium text-gray-800 truncate">
                    {application.submittedMaterials.videoAudition?.title ||
                      application.submittedMaterials.portfolioUrl ||
                      'Verified Showreel Attached'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidate Privacy Statement - Note: Private recruiter notes are NEVER displayed here */}
        <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-150 text-[10.5px] text-neutral-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Candidate Privacy Protected: Confidential recruiter evaluation notes and competitor applicant rosters are strictly restricted to verified production decision makers.
          </span>
        </div>
      </div>

      {/* WITHDRAW APPLICATION CONFIRMATION MODAL */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Confirm Application Withdrawal"
      >
        <div className="space-y-4 text-left text-xs">
          {withdrawSuccess ? (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm text-gray-900">Application Withdrawn</p>
              <p className="text-gray-500 text-xs">
                Your application has been withdrawn from this casting call.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to withdraw your audition application for{' '}
                <strong className="text-gray-900 font-bold">{application.opportunityTitle}</strong>?
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center gap-2 text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  The production company will be notified that you are no longer available for this role.
                </span>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  disabled={isWithdrawing}
                  className="text-xs"
                >
                  Keep Application
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleWithdrawConfirm}
                  disabled={isWithdrawing}
                  className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* CANDIDATE COMPANY RATING & REVIEW MODAL */}
      <CompanyRatingModal
        isOpen={isCompanyRatingModalOpen}
        onClose={() => setIsCompanyRatingModalOpen(false)}
        companyName={application.productionCompany || 'Production Studio'}
        companyId={application.productionCompany?.toLowerCase().replace(/\s+/g, '-')}
        opportunityId={application.opportunityId}
        opportunityTitle={application.opportunityTitle}
        candidateId={application.candidateId || 'cand-1'}
        candidateName={application.candidateName || 'Candidate Artist'}
        onReviewSubmitted={(newRev) => {
          setMyCompanyReview(newRev);
          setCompanyStats((prev) => ({
            averageRating: newRev.rating,
            totalReviews: (prev.totalReviews || 0) + 1,
          }));
        }}
      />
    </PageContainer>
  );
};

export default ApplicationDetailsPage;
