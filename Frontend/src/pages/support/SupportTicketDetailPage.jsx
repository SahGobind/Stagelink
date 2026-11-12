import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Lock,
  MessageSquare,
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Shield,
  ShieldAlert,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronDown,
  UserCheck,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supportService, normalizeTicket } from '../../services/supportService';

const SupportTicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'support_agent';
  const isAgent = role === 'support_agent';
  const isLead = role === 'support_lead' || role === 'super_admin' || role === 'admin';

  const [ticket, setTicket] = useState(null);
  const [customerContext, setCustomerContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState(null);

  // Input states
  const [activeTab, setActiveTab] = useState('reply'); // 'reply' or 'note'
  const [replyContent, setReplyContent] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [sending, setSending] = useState(false);

  // Status & Escalation modals/dropdowns
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignStaffName, setAssignStaffName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [copiedSnippetId, setCopiedSnippetId] = useState(null);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setForbiddenError(null);
    try {
      const data = await supportService.getTicketById(id, {
        role,
        userId: user?.id,
      });
      if (!data) {
        setForbiddenError('Ticket not found.');
      } else {
        setTicket(normalizeTicket(data));

        // Fetch PoLP Customer Context
        supportService.getCustomerContext(id)
          .then((ctx) => setCustomerContext(ctx))
          .catch((err) => console.log('PoLP context error:', err));
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('unauthorized') || err.message.toLowerCase().includes('forbidden')) {
        setForbiddenError(
          'Access Restricted (PoLP IDOR Protection): As a Level 1 Support Agent, you can only view tickets assigned to you. This ticket is assigned to another staff member or is unassigned.'
        );
      } else {
        setForbiddenError(err.message || 'Failed to load ticket details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    if (isLead) {
      supportService.getTeam().then((team) => setTeamMembers(team)).catch(() => {});
    }
  }, [id, role, user?.id]);

  // Handle Reply submission
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSending(true);
    try {
      const updated = await supportService.replyToTicket(ticket.id, {
        content: replyContent.trim(),
        sender: user,
      });
      setTicket(normalizeTicket(updated));
      setReplyContent('');
    } catch (err) {
      alert(err.message || 'Failed to send reply.');
    } finally {
      setSending(false);
    }
  };

  // Handle Internal Note submission
  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSending(true);
    try {
      const updated = await supportService.addInternalNote(ticket.id, {
        note: noteContent.trim(),
        author: user,
      });
      setTicket(normalizeTicket(updated));
      setNoteContent('');
    } catch (err) {
      alert(err.message || 'Failed to save internal note.');
    } finally {
      setSending(false);
    }
  };

  // Handle Status Update
  const handleStatusChange = async (newStatus) => {
    try {
      const updated = await supportService.updateTicketStatus(ticket.id, newStatus, {
        role,
        operatorName: user?.fullName,
      });
      setTicket(normalizeTicket(updated));
    } catch (err) {
      alert(err.message || 'Failed to change ticket status.');
    }
  };

  // Handle Escalation
  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateReason.trim()) return;
    try {
      const updated = await supportService.escalateTicket(ticket.id, {
        reason: escalateReason.trim(),
        priority: 'high',
      });
      setTicket(normalizeTicket(updated));
      setShowEscalateModal(false);
      setEscalateReason('');
    } catch (err) {
      alert(err.message || 'Failed to escalate ticket.');
    }
  };

  // Handle Assignment (Lead only)
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignStaffName) return;
    const selected = teamMembers.find((m) => (m.fullName || m.full_name) === assignStaffName);
    try {
      const updated = await supportService.assignTicket(ticket.id, {
        assignedStaffId: selected?.id || '',
        assignedTo: assignStaffName,
      });
      setTicket(normalizeTicket(updated));
      setShowAssignModal(false);
    } catch (err) {
      alert(err.message || 'Failed to assign ticket.');
    }
  };

  const copyCannedSnippet = (snippet, id) => {
    setReplyContent((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-500" />
        <p className="text-sm font-semibold text-slate-700">Verifying role permissions & fetching ticket...</p>
      </div>
    );
  }

  // 403 Forbidden Screen for IDOR protection
  if (forbiddenError) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-red-200/80 p-8 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied (PoLP Enforcement)</h2>
        <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
          {forbiddenError}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/support/my-tickets')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition"
          >
            Go to My Assigned Tickets
          </button>
          <button
            onClick={() => navigate('/support/dashboard')}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
          >
            Support Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900 text-base sm:text-lg">
                {ticket.ticketNumber || ticket.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {ticket.category}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {ticket.subject}
            </h1>
          </div>
        </div>

        {/* Action Buttons Header */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Status Select */}
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="open">Status: Open</option>
            <option value="in_progress">Status: In Progress</option>
            <option value="waiting_user">Status: Waiting for User</option>
            <option value="resolved">Status: Resolved</option>
          </select>

          {/* Escalate Button */}
          {ticket.status !== 'escalated' && (
            <button
              onClick={() => setShowEscalateModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/80 text-xs font-bold transition shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Escalate</span>
            </button>
          )}

          {/* Lead Assign Button */}
          {isLead && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 text-xs font-bold transition shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Assign</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Conversation, Internal Notes, Action Box */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Messages Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Conversation Thread
            </h2>

            <div className="space-y-4">
              {(ticket.messages || []).map((msg, index) => {
                const isCustomer = msg.senderRole === 'candidate' || msg.senderRole === 'recruiter';
                return (
                  <div
                    key={msg.id || index}
                    className={`p-4 rounded-2xl flex flex-col gap-2 ${
                      isCustomer
                        ? 'bg-slate-50 border border-slate-200/70'
                        : 'bg-amber-500/5 border border-amber-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{msg.senderName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isCustomer
                              ? 'bg-slate-200 text-slate-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Private Internal Staff Notes Section */}
            {(ticket.notes || []).length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-3 py-1.5 rounded-lg w-fit">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Private Internal Notes (Staff Only • Hidden from Customer)</span>
                </div>
                <div className="space-y-2">
                  {ticket.notes.map((note, idx) => (
                    <div
                      key={note.id || idx}
                      className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed"
                    >
                      <div className="flex items-center justify-between font-bold text-[11px] text-amber-800 mb-1">
                        <span>{note.authorName || 'Staff'}</span>
                        <span className="font-normal text-amber-600">
                          {note.timestamp ? new Date(note.timestamp).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <p>{note.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Tabs: Reply vs Internal Note */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setActiveTab('reply')}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                  activeTab === 'reply'
                    ? 'bg-white text-slate-900 border-b-2 border-amber-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Reply to Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('note')}
                className={`flex-1 py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                  activeTab === 'note'
                    ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Add Private Note (Staff Only)</span>
              </button>
            </div>

            <div className="p-5">
              {activeTab === 'reply' ? (
                <form onSubmit={handleSendReply} className="space-y-4">
                  <textarea
                    rows={4}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your official response to the customer here..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-y"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      Customer will receive an instant in-app notification and email update.
                    </p>
                    <button
                      type="submit"
                      disabled={sending || !replyContent.trim()}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSendNote} className="space-y-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Private Note: Strictly invisible to customer</span>
                  </div>
                  <textarea
                    rows={3}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Document internal investigation details, director contact notes, or billing context..."
                    className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition resize-y"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={sending || !noteContent.trim()}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{sending ? 'Saving...' : 'Save Private Note'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ticket Audit History
            </h3>
            <div className="space-y-3">
              {(ticket.history || []).map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-slate-600">
                  <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800">{h.event}</span>
                    {h.actor && <span className="text-slate-500"> by {h.actor}</span>}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {h.timestamp ? new Date(h.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Principle of Least Privilege Customer Context */}
        <div className="space-y-6">
          {/* Customer Context Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Customer Context
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                PoLP Verified
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center justify-center text-base border border-amber-500/20">
                {ticket.userName ? ticket.userName[0] : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-900 text-sm truncate">{ticket.userName}</h3>
                <p className="text-xs text-slate-500 truncate">{ticket.userEmail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                    {ticket.userRole}
                  </span>
                  {customerContext?.customer?.verification_status && (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {customerContext.customer.verification_status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">User ID</span>
                <span className="font-mono text-[11px] font-medium text-slate-800">
                  {ticket.userId || 'usr-1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone</span>
                <span className="text-slate-800">
                  {customerContext?.customer?.phone_masked || 'Protected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Location</span>
                <span className="text-slate-800">
                  {customerContext?.customer?.location || 'India'}
                </span>
              </div>
            </div>

            {/* Customer Ticket Stats */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Ticket Activity Stats
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm font-bold text-slate-900">
                    {customerContext?.stats?.total_tickets ?? 1}
                  </div>
                  <div className="text-[10px] text-slate-400">Total</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm font-bold text-emerald-600">
                    {customerContext?.stats?.open_tickets ?? 1}
                  </div>
                  <div className="text-[10px] text-slate-400">Open</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-sm font-bold text-slate-600">
                    {customerContext?.stats?.resolved_tickets ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-400">Resolved</div>
                </div>
              </div>
            </div>

            {/* PoLP Security Seal Banner */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-snug flex items-start gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>PoLP Active:</strong> Financial card credentials, tokens, and identity document files are withheld from support agents.
              </span>
            </div>
          </div>

          {/* Quick Knowledge Base Snippets */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Canned Response Snippets
              </h3>
              <Link
                to="/support/knowledge-base"
                className="text-[11px] font-semibold text-amber-600 hover:text-amber-700"
              >
                All Articles
              </Link>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="font-semibold text-slate-800">Verification Pending Review</div>
                <p className="text-slate-500 text-[11px] line-clamp-2">
                  "Hello! Your verification submission has been received by security governance..."
                </p>
                <button
                  onClick={() =>
                    copyCannedSnippet(
                      'Hello! Your verification submission has been received by our security governance team. Standard review takes 24-48 business hours. You will receive an automated notification as soon as verification completes.',
                      'cr-1'
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                >
                  {copiedSnippetId === 'cr-1' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied into reply</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Insert Snippet</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                <div className="font-semibold text-slate-800">Audition Reschedule Request</div>
                <p className="text-slate-500 text-[11px] line-clamp-2">
                  "We have logged your request regarding the audition schedule. We are notifying the casting desk..."
                </p>
                <button
                  onClick={() =>
                    copyCannedSnippet(
                      'We have logged your request regarding the audition schedule. We are notifying the casting director’s production desk and will notify you as soon as they respond.',
                      'cr-2'
                    )
                  }
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                >
                  {copiedSnippetId === 'cr-2' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied into reply</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Insert Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Escalate Ticket */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <Flame className="w-5 h-5" />
              <span>Escalate Ticket to Tier-2 / Lead</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Escalating routes this inquiry directly to the Support Lead's priority queue. Please specify the business justification.
            </p>
            <textarea
              rows={3}
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              placeholder="e.g. Customer requests listing payment refund due to duplicate transaction; exceeds Agent Tier 1 limit."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEscalateSubmit}
                disabled={!escalateReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-500 shadow-sm transition disabled:opacity-50"
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Assign / Reassign Ticket (Support Lead Only) */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-purple-700 font-bold text-base">
              <UserCheck className="w-5 h-5" />
              <span>Reassign Ticket to Support Agent</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select an authorized support agent from your team roster to assign this ticket.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Support Personnel
              </label>
              <select
                value={assignStaffName}
                onChange={(e) => setAssignStaffName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">-- Choose Agent --</option>
                <option value="Liam Patel (Support Agent)">Liam Patel (Support Agent)</option>
                <option value="Elena Rostova (Support Lead)">Elena Rostova (Support Lead)</option>
                <option value="Sarah Jenkins (Operations)">Sarah Jenkins (Operations)</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.fullName || m.full_name}>
                    {m.fullName || m.full_name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
                disabled={!assignStaffName}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 shadow-sm transition disabled:opacity-50"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketDetailPage;

