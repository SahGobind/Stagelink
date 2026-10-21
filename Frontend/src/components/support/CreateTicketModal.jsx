import React, { useState } from 'react';
import {
  X,
  Send,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc', '.mp4'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const { user, role } = useAuth();
  const categories = supportService.getCategories(role);

  const [category, setCategory] = useState(categories[0] || 'Account & Login');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicketInfo, setCreatedTicketInfo] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({
        ...prev,
        attachment: 'File size exceeds 10MB limit. Please upload a smaller file.',
      }));
      return;
    }

    // Validate extension
    const fileName = file.name.toLowerCase();
    const isValid = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        attachment: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      }));
      return;
    }

    // Clear error & store attachment metadata
    setErrors((prev) => {
      const next = { ...prev };
      delete next.attachment;
      return next;
    });

    // Format size
    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setAttachment({
      name: file.name,
      size: sizeStr,
      type: file.type || 'application/octet-stream',
    });
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.attachment;
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!category) errs.category = 'Please select a support category.';
    if (!subject.trim()) {
      errs.subject = 'Subject is required.';
    } else if (subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters.';
    }
    if (!message.trim()) {
      errs.message = 'Please describe the problem you are experiencing.';
    } else if (message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters long.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const newTicket = await supportService.createTicket({
        category,
        subject: subject.trim(),
        message: message.trim(),
        attachment,
        user,
      });

      setCreatedTicketInfo(newTicket);
      if (onTicketCreated) {
        onTicketCreated(newTicket);
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err.message || 'Failed to submit support ticket. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedTicketInfo(null);
    setSubject('');
    setMessage('');
    setAttachment(null);
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border border-brand-border shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest block">
              StageLink Operations Support
            </span>
            <h2 id="ticket-modal-title" className="text-xl font-bold font-serif text-brand-navy">
              {createdTicketInfo ? 'Ticket Submitted' : 'Contact Operation Team'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Close modal"
            className="p-2 text-gray-400 hover:text-brand-navy rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {createdTicketInfo ? (
            /* SUCCESS STATE */
            <div className="space-y-6 text-center py-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-brand-navy font-serif">
                  Your ticket has been logged
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Our dedicated Operations Desk is reviewing your inquiry. We have assigned you
                  the tracking reference below:
                </p>
              </div>

              {/* Reference Box */}
              <div className="p-4 bg-gray-50 border border-brand-border rounded-2xl max-w-sm mx-auto text-center space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Support Reference Number
                </span>
                <span className="text-2xl font-mono font-bold text-brand-pink tracking-tight block">
                  {createdTicketInfo.ticketNumber || createdTicketInfo.id}
                </span>
                <span className="text-[11px] text-gray-500 block">
                  Category: <strong>{createdTicketInfo.category}</strong>
                </span>
              </div>

              <p className="text-[11px] text-gray-400">
                You can track updates and post replies directly inside{' '}
                <strong className="text-brand-navy">My Support Tickets</strong>.
              </p>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-brand-pink hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Done &amp; View My Tickets
                </button>
              </div>
            </div>
          ) : (
            /* TICKET FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Prefilled Profile Info Summary */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                    Account Details (Prefilled)
                  </span>
                  <p className="font-bold text-brand-navy">
                    {user?.fullName || 'StageLink Member'}{' '}
                    <span className="text-gray-400 font-normal">({user?.email})</span>
                  </p>
                  {user?.companyName && (
                    <p className="text-[11px] text-gray-500">{user.companyName}</p>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-pink-50 text-brand-pink border border-pink-200 uppercase">
                  {role === 'recruiter' || role === 'admin' ? 'Studio / Recruiter' : 'Candidate Performer'}
                </span>
              </div>

              {/* Submit Error Banner if any */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errors.submit}</span>
                </div>
              )}

              {/* 1. Category Dropdown (Required) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Support Category <span className="text-brand-pink">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-brand-navy focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-[11px] text-red-500 font-semibold">{errors.category}</p>
                )}
              </div>

              {/* 2. Subject (Required) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Subject <span className="text-brand-pink">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of your question or issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all"
                />
                {errors.subject && (
                  <p className="text-[11px] text-red-500 font-semibold">{errors.subject}</p>
                )}
              </div>

              {/* 3. Message (Required) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Describe Your Problem <span className="text-brand-pink">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide all relevant details (e.g. casting call title, payment order ID, or steps to reproduce)..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all resize-y"
                />
                {errors.message && (
                  <p className="text-[11px] text-red-500 font-semibold">{errors.message}</p>
                )}
              </div>

              {/* 4. Optional Attachment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-navy">
                  Optional Attachment{' '}
                  <span className="text-gray-400 font-normal">(Screenshots, receipts, PDF — Max 10MB)</span>
                </label>

                {attachment ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-brand-pink shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-brand-navy truncate">{attachment.name}</p>
                        <p className="text-[10px] text-gray-400">{attachment.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 hover:border-brand-pink/50 rounded-2xl bg-gray-50/50 hover:bg-pink-50/20 text-xs font-semibold text-gray-600 cursor-pointer transition-colors">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                    <span>Choose file to upload</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf,.docx,.doc,.mp4"
                    />
                  </label>
                )}

                {errors.attachment && (
                  <p className="text-[11px] text-red-500 font-semibold">{errors.attachment}</p>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed opacity-75'
                      : 'bg-brand-pink hover:bg-rose-700 active:scale-95'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Submitting Ticket...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Ticket</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTicketModal;
