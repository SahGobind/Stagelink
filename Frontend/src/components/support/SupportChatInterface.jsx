import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Paperclip,
  CheckCheck,
  Check,
  ShieldCheck,
  FileText,
  Download,
  AlertCircle,
  Lock,
  RotateCcw,
  User,
  Calendar,
  Sparkles,
  Info,
  Clock,
  PlusCircle,
} from 'lucide-react';
import SupportStatusBadge from './SupportStatusBadge';
import SupportPriorityBadge from './SupportPriorityBadge';
import { formatDate } from '../../utils/formatters';

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf', '.docx', '.doc', '.mp4'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const SupportChatInterface = ({
  ticket,
  currentUser,
  onSendReply,
  onReopenTicket,
  onAddInternalNote,
  onUpdateTicket,
  backLink = '/candidate/support',
  backLabel = 'Back to My Tickets',
  isStaff = false,
}) => {
  const [replyText, setReplyText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Internal Note state (staff only)
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages?.length, ticket?.notes?.length]);

  if (!ticket) return null;

  const isResolvedOrClosed =
    ticket.status === 'resolved' || ticket.status === 'closed';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage('Attachment exceeds 10MB limit.');
      return;
    }

    const fileName = file.name.toLowerCase();
    const isValid = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
    if (!isValid) {
      setErrorMessage(`Unsupported format. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    setErrorMessage('');
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

  const handleSend = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;

    if (!replyText.trim() && !attachment) {
      setErrorMessage('Please type a message before sending.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await onSendReply({
        content: replyText.trim(),
        attachment,
        sender: currentUser,
      });
      setReplyText('');
      setAttachment(null);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send message. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInternalNoteSubmit = async (e) => {
    e?.preventDefault();
    if (!internalNoteText.trim() || isSubmittingNote) return;

    setIsSubmittingNote(true);
    try {
      await onAddInternalNote({
        note: internalNoteText.trim(),
        author: currentUser,
      });
      setInternalNoteText('');
      setIsAddingNote(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add internal note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-brand-border shadow-card overflow-hidden flex flex-col min-h-[640px] text-left">
      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-white sticky top-0 z-20 space-y-4">
        {/* Navigation & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-brand-navy hover:bg-gray-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-brand-pink bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
              {ticket.ticketNumber || ticket.id}
            </span>
            <SupportPriorityBadge priority={ticket.priority} size="sm" />
            <SupportStatusBadge status={ticket.status} size="sm" />
          </div>
        </div>

        {/* Title & Ticket Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-bold font-serif text-brand-navy truncate">
              {ticket.subject}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span>
                Category: <strong className="text-gray-700">{ticket.category}</strong>
              </span>
              <span>•</span>
              <span>
                Opened: <strong className="text-gray-700">{formatDate(ticket.createdAt)}</strong>
              </span>
              {ticket.assignedTo && (
                <>
                  <span>•</span>
                  <span>
                    Assigned: <strong className="text-gray-700">{ticket.assignedTo}</strong>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Action: Reopen or Staff Controls */}
          {isResolvedOrClosed && (
            <button
              type="button"
              onClick={onReopenTicket}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
              <span>Reopen Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CONVERSATION MESSAGE THREAD */}
      <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto bg-gray-50/40">
        {/* Ticket Creation Banner */}
        <div className="text-center my-2">
          <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold border border-gray-200">
            Ticket {ticket.ticketNumber || ticket.id} opened on {formatDate(ticket.createdAt)}
          </span>
        </div>

        {/* Message Bubbles */}
        {(ticket.messages || []).map((msg, idx) => {
          const isFromCurrentUser =
            msg.senderId === currentUser?.id ||
            (msg.senderRole === currentUser?.role && !isStaff && msg.senderRole !== 'operations');

          const isStaffMessage =
            msg.senderRole === 'operations' || msg.senderRole === 'admin';

          return (
            <div
              key={msg.id || idx}
              className={`flex flex-col ${
                isFromCurrentUser ? 'items-end' : 'items-start'
              } group`}
            >
              {/* Sender Name & Role Tag */}
              <div
                className={`flex items-center gap-1.5 mb-1 text-[11px] font-bold ${
                  isFromCurrentUser ? 'text-gray-500 mr-1' : 'text-gray-600 ml-1'
                }`}
              >
                <span>{msg.senderName}</span>
                {isStaffMessage ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] bg-pink-100 text-brand-pink font-bold border border-pink-200">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Operation Staff</span>
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-gray-200 text-gray-700">
                    {msg.senderRole === 'recruiter' ? 'Studio Recruiter' : 'Candidate'}
                  </span>
                )}
              </div>

              {/* Bubble Body */}
              <div
                className={`max-w-lg sm:max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs space-y-2.5 transition-all ${
                  isFromCurrentUser
                    ? 'bg-black text-white rounded-br-xs'
                    : isStaffMessage
                    ? 'bg-white border-2 border-brand-pink/30 text-brand-navy rounded-bl-xs'
                    : 'bg-white border border-gray-200 text-brand-navy rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Attachment Card if attached */}
                {msg.attachment && (
                  <div
                    className={`p-2.5 rounded-xl flex items-center justify-between gap-3 border ${
                      isFromCurrentUser
                        ? 'bg-neutral-900 border-neutral-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-brand-navy'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isFromCurrentUser
                            ? 'bg-neutral-800 text-white'
                            : 'bg-pink-50 text-brand-pink border border-pink-200'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{msg.attachment.name}</p>
                        <p
                          className={`text-[10px] ${
                            isFromCurrentUser ? 'text-neutral-400' : 'text-gray-400'
                          }`}
                        >
                          {msg.attachment.size || 'Attachment file'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        alert(`Opening demo attachment file: ${msg.attachment.name}`);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFromCurrentUser
                          ? 'hover:bg-neutral-800 text-neutral-300'
                          : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      title="Download or preview file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div
                className={`flex items-center gap-1 text-[10px] text-gray-400 mt-1 px-1 ${
                  isFromCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <span>{formatDate(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}

        {/* Private Internal Notes (Visible strictly to Operation Staff / Admin) */}
        {isStaff && (ticket.notes || []).length > 0 && (
          <div className="my-6 space-y-3 p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Internal Staff Notes (Private — Hidden from User)</span>
            </div>
            {ticket.notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-white border border-amber-200 rounded-xl text-xs text-gray-800 space-y-1 shadow-2xs"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                  <span>{note.authorName}</span>
                  <span>{formatDate(note.timestamp)}</span>
                </div>
                <p className="text-gray-800 font-medium">{note.note}</p>
              </div>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. REPLY & ACTIONS COMPOSER BAR */}
      <div className="p-4 sm:p-5 border-t border-brand-border bg-white space-y-3">
        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-xs font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Resolved notice banner */}
        {isResolvedOrClosed ? (
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-900">
                This ticket has been marked as {ticket.status.toUpperCase()}.
              </p>
              <p className="text-emerald-700 text-[11px]">
                If your issue is not completely resolved, you can reopen this ticket to continue the conversation.
              </p>
            </div>
            <button
              type="button"
              onClick={onReopenTicket}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all shrink-0 cursor-pointer"
            >
              Reopen &amp; Reply
            </button>
          </div>
        ) : (
          /* ACTIVE REPLY INPUT */
          <form onSubmit={handleSend} className="space-y-3">
            {/* Attachment preview if selected */}
            {attachment && (
              <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-brand-pink shrink-0" />
                  <span className="font-bold text-brand-navy truncate">{attachment.name}</span>
                  <span className="text-[10px] text-gray-400">({attachment.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="text-xs text-red-500 hover:underline font-bold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Attachment Button */}
              <label className="p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 cursor-pointer transition-colors shrink-0">
                <Paperclip className="w-4 h-4" />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf,.docx,.doc,.mp4"
                />
              </label>

              {/* Textarea */}
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  placeholder={`Reply to ${
                    isStaff ? ticket.userName : 'StageLink Operation Team'
                  }...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-brand-navy placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20 transition-all resize-none"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`p-3 rounded-2xl text-white font-bold transition-all shrink-0 cursor-pointer ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed opacity-75'
                    : 'bg-brand-pink hover:bg-rose-700 active:scale-95 shadow-xs'
                }`}
                title="Send reply"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Staff Internal Note Trigger (Only for Operations staff) */}
            {isStaff && (
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(!isAddingNote)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isAddingNote ? 'Cancel Private Note' : '+ Add Private Internal Note (Staff Only)'}</span>
                </button>
              </div>
            )}
          </form>
        )}

        {/* Staff Internal Note Input Drawer */}
        {isStaff && isAddingNote && (
          <form
            onSubmit={handleInternalNoteSubmit}
            className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Lock className="w-3.5 h-3.5 text-amber-700" />
              <span>Add Private Staff Note</span>
            </div>
            <textarea
              rows={2}
              placeholder="Internal note for team members (will NEVER be seen by candidate or recruiter)..."
              value={internalNoteText}
              onChange={(e) => setInternalNoteText(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingNote(false)}
                className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-bold text-gray-700 hover:bg-amber-100/50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingNote}
                className="px-4 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmittingNote ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SupportChatInterface;
