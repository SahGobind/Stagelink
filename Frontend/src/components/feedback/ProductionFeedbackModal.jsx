import React, { useState } from 'react';
import { Star, Clapperboard, CheckCircle2, Award, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { feedbackService } from '../../services/feedbackService';

const ProductionFeedbackModal = ({
  isOpen,
  onClose,
  applicationId = '',
  candidateId = '',
  candidateName = 'Candidate Performer',
  productionCompany = 'Production House',
  opportunityTitle = 'Casting Opportunity',
  roleTitle = 'Character Role',
  existingFeedback = null,
  onFeedbackSaved,
}) => {
  const [rating, setRating] = useState(existingFeedback?.rating || 4.8);
  const [hoverRating, setHoverRating] = useState(0);
  const [acting, setActing] = useState(existingFeedback?.breakdown?.acting || 5);
  const [screenPresence, setScreenPresence] = useState(existingFeedback?.breakdown?.screen_presence || 4.8);
  const [vocalQuality, setVocalQuality] = useState(existingFeedback?.breakdown?.vocal_quality || 4.7);
  const [professionalism, setProfessionalism] = useState(existingFeedback?.breakdown?.professionalism || 5);
  const [feedback, setFeedback] = useState(existingFeedback?.feedback || '');
  const [reviewerName, setReviewerName] = useState(existingFeedback?.reviewer_name || 'Rohan Mehra');
  const [reviewerRole, setReviewerRole] = useState(
    existingFeedback?.reviewer_role || `Lead Casting Director • ${productionCompany}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await feedbackService.submitProductionFeedback(applicationId, {
        rating,
        feedback,
        breakdown: {
          acting,
          screen_presence: screenPresence,
          vocal_quality: vocalQuality,
          professionalism,
        },
        reviewerName,
        reviewerRole,
        candidateId,
        candidateName,
        productionCompany,
        opportunityTitle,
        roleTitle,
      });

      if (res.success) {
        setSubmitted(true);
        if (onFeedbackSaved) {
          onFeedbackSaved(res.feedback);
        }
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 1600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
    >
      <div className="p-1 text-left">
        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold font-serif text-black">
              Production Feedback & Rating Saved!
            </h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Your verified review of <span className="font-semibold text-black">{candidateName}</span>&apos;s audition submission has been recorded and delivered.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-black text-white">
                  <Clapperboard className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Studio Evaluation on Audition & Production
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif text-black">
                Rate & Review {candidateName}&apos;s Audition
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Role: <span className="font-semibold text-black">{roleTitle}</span> • {productionCompany}
              </p>
            </div>

            {/* Overall Rating */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center">
              <span className="text-xs font-semibold text-neutral-700 block mb-1">
                Overall Audition & Performance Rating
              </span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-115 focus:outline-hidden"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-neutral-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-sm font-bold font-serif text-black mt-1 block">
                {(hoverRating || rating).toFixed(1)} / 5.0 Stars
              </span>
            </div>

            {/* Performance Metric Sliders */}
            <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-neutral-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                Performance Evaluation Criteria
              </span>

              {/* Acting & Depth */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-black block">Acting & Emotional Depth</span>
                  <span className="text-[10px] text-neutral-500">Character embodiment & nuance</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setActing(s)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg border transition-colors ${
                        s <= acting
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screen Presence */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-black block">Screen Presence & Charisma</span>
                  <span className="text-[10px] text-neutral-500">Eye contact, frame control, stillness</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScreenPresence(s)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg border transition-colors ${
                        s <= screenPresence
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vocal Delivery */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-black block">Vocal Delivery & Diction</span>
                  <span className="text-[10px] text-neutral-500">Tone, projection, pacing, dialogue clarity</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setVocalQuality(s)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg border transition-colors ${
                        s <= vocalQuality
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Constructive Studio Feedback */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Constructive Studio Feedback for Candidate <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Give constructive notes on their audition scene, dialogue pacing, eye contact, and recommendations for the chemistry callback..."
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Reviewer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 mb-1">
                  Reviewer Role / Studio
                </label>
                <input
                  type="text"
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                disabled={isSubmitting || !feedback.trim()}
              >
                Save Production Rating & Feedback
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ProductionFeedbackModal;
