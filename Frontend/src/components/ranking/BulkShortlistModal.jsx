import React, { useState } from 'react';
import { Star, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const BulkShortlistModal = ({
  isOpen,
  onClose,
  selectedApplications = [],
  onConfirm,
}) => {
  const [notes, setNotes] = useState('Bulk shortlisted for executive casting review.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(selectedApplications.map(a => a.id), notes);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm Bulk Shortlist (${selectedApplications.length} Candidates)`}
      size="md"
    >
      <div className="space-y-4 text-xs text-left">
        <p className="text-neutral-600">
          You are about to shortlist <strong className="text-neutral-900 font-bold">{selectedApplications.length} selected applicants</strong> for this casting call.
        </p>

        {/* Selected candidates list summary */}
        <div className="max-h-48 overflow-y-auto divide-y divide-neutral-100 border border-neutral-200 rounded-xl bg-neutral-50/50 p-2">
          {selectedApplications.map((app) => (
            <div key={app.id} className="flex items-center justify-between py-2 px-2">
              <div className="flex items-center gap-2.5">
                <Avatar
                  src={app.candidate?.avatar || app.candidateAvatar}
                  name={app.candidate?.fullName || app.candidateName}
                  size="sm"
                />
                <div>
                  <p className="font-bold text-neutral-900 text-xs">
                    {app.candidate?.fullName || app.candidateName}
                  </p>
                  <p className="text-[10px] text-neutral-500">
                    Applying for: {app.roleAppliedFor}
                  </p>
                </div>
              </div>
              <span className="font-mono font-bold text-xs text-neutral-800">
                {Math.round(app.match_score?.total_score || 0)}/100
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
            Shortlist Note (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
            placeholder="Add note for casting team..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="text-xs bg-brand-pink hover:bg-rose-700 text-white font-bold space-x-1.5"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{isSubmitting ? 'Shortlisting...' : `Shortlist ${selectedApplications.length} Candidates`}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BulkShortlistModal;
