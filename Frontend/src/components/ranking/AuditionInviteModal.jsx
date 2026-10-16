import React, { useState } from 'react';
import { Calendar, Clock, Video, FileText, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

const AuditionInviteModal = ({
  isOpen,
  onClose,
  application,
  onConfirm,
}) => {
  const [date, setDate] = useState('2026-10-25');
  const [time, setTime] = useState('14:00');
  const [mode, setMode] = useState('In-Studio Chemistry Read');
  const [notes, setNotes] = useState('Prepare Scene 3 monologue and dialogue sides. Bring two physical headshots.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) return null;

  const candidate = application.candidate || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm({
        date,
        time,
        mode,
        notes,
      });
      onClose();
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
      title="Invite Candidate to Audition / Callback"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
        <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
          <Avatar
            src={candidate.avatar || application.candidateAvatar}
            name={candidate.fullName || application.candidateName}
            size="md"
          />
          <div>
            <h4 className="font-bold text-neutral-900 text-xs">
              {candidate.fullName || application.candidateName}
            </h4>
            <p className="text-[11px] text-neutral-500">
              Role: <strong className="text-brand-pink">{application.roleAppliedFor}</strong> • {application.opportunityTitle || 'Casting Call'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              Audition Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
              Call Time (IST / Local)
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
            Audition Mode / Location
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-brand-pink cursor-pointer"
          >
            <option value="In-Studio Chemistry Read">In-Studio Chemistry Read (Mumbai Studio)</option>
            <option value="Live Video Callback (Zoom/Meet)">Live Video Callback (Zoom / Google Meet)</option>
            <option value="Self-Tape Requested with Script Sides">Self-Tape Requested with Script Sides</option>
            <option value="Director 1-on-1 Monologue Review">Director 1-on-1 Monologue Review</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
            Performer Preparation Notes &amp; Script Sides
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Specify sides, monologue scene, attire, or dialect expectations..."
            className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <div className="p-3 bg-pink-50/50 border border-pink-100 rounded-xl text-[11px] text-pink-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-brand-pink shrink-0" />
          <span>The candidate will receive an immediate audition invitation in their Talent Dashboard.</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
          <Button type="button" variant="outline" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="text-xs bg-brand-pink hover:bg-rose-700 text-white font-bold"
          >
            {isSubmitting ? 'Sending Invitation...' : 'Send Audition Invitation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AuditionInviteModal;
