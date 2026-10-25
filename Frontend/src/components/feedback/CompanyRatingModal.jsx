import React, { useState } from 'react';
import { Star, Building2, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { feedbackService } from '../../services/feedbackService';

const CompanyRatingModal = ({
  isOpen,
  onClose,
  companyName = 'Production House',
  companyId = '',
  opportunityId = '',
  opportunityTitle = '',
  candidateId = 'cand-1',
  candidateName = 'Candidate Artist',
  candidateAvatar = '',
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [castingExperience, setCastingExperience] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ratingDescriptions = {
    1: 'Poor Casting Experience',
    2: 'Below Average',
    3: 'Satisfactory / Standard',
    4: 'Very Good & Professional',
    5: 'Exceptional & Highly Respectful Studio',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await feedbackService.submitCompanyReview({
        companyId: companyId || companyName.toLowerCase().replace(/\s+/g, '-'),
        companyName,
        candidateId,
        candidateName,
        candidateAvatar,
        rating,
        feedback,
        categories: {
          casting_experience: castingExperience,
          communication,
          professionalism,
        },
        opportunityId,
        opportunityTitle,
      });

      if (res.success) {
        setSubmitted(true);
        if (onReviewSubmitted) {
          onReviewSubmitted(res.review);
        }
        setTimeout(() => {
          setSubmitted(false);
          setFeedback('');
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
              Review Submitted Successfully!
            </h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Your verified rating and feedback for <span className="font-semibold text-black">{companyName}</span> has been published.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-neutral-100 text-black">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Candidate Feedback on Production House
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif text-black">
                Rate & Review {companyName}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Share your casting experience to help fellow actors and artists make informed decisions.
              </p>
            </div>

            {/* Overall Star Rating */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 text-center">
              <span className="text-xs font-semibold text-neutral-700 block mb-2">
                Overall Casting Experience
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
              <span className="text-xs font-bold text-black mt-2 block">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>

            {/* Detailed Categories */}
            <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-neutral-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block">
                Category Ratings (1 - 5)
              </span>

              {/* Casting Process */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Casting Audition Process</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCastingExperience(s)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg border transition-colors ${
                        s <= castingExperience
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Communication */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Studio Communication & Updates</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCommunication(s)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg border transition-colors ${
                        s <= communication
                          ? 'bg-black text-white border-black'
                          : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Professionalism */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-700">Professionalism & Respect</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setProfessionalism(s)}
                      className={`w-7 h-7 text-xs font-bold rounded-lg border transition-colors ${
                        s <= professionalism
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

            {/* Written Feedback Textarea */}
            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                Your Feedback & Review <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe your experience with this studio (e.g. audition sides provided in advance, callback environment, respectful directors)..."
                className="w-full text-xs p-3 rounded-xl border border-neutral-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-black focus:border-black transition-colors resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
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
                Submit Company Review
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default CompanyRatingModal;
