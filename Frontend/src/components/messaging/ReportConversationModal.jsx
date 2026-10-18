import React, { useState } from 'react';
import { Flag, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

const ReportConversationModal = ({
  isOpen,
  onClose,
  participant,
  onConfirmReport,
}) => {
  const [reason, setReason] = useState('unprofessional');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onConfirmReport?.({
        reason,
        details,
        participantId: participant?.id,
        participantName: participant?.name,
      });
      setIsSubmitted(false);
      onClose();
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-navy font-serif">
                Report Conversation
              </h3>
              <p className="text-[11px] text-gray-500">
                Liaison: {participant?.name || 'Casting Representative'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              StageLink strictly enforces casting professional standards. Verified teams will never solicit personal upfront fees or unauthorized contact.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
              Reason for Report
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-navy outline-none focus:border-black"
            >
              <option value="unprofessional">Unprofessional communication / conduct</option>
              <option value="suspicious_fees">Suspicious request for payment or fees</option>
              <option value="spam">Spam or irrelevant solicitation</option>
              <option value="harassment">Inappropriate or personal inquiries</option>
              <option value="other">Other safety concern</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any context to assist our talent trust & safety review..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-navy placeholder-gray-400 outline-none focus:border-black resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitted}
            >
              Cancel
            </Button>
            <button
              type="submit"
              disabled={isSubmitted}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isSubmitted ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportConversationModal;
