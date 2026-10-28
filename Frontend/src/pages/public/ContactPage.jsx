import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Headphones,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import BackButton from '../../components/common/BackButton';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const SUPPORT_CATEGORIES = [
  { value: 'Other', label: 'General Inquiry / Platform Support' },
  { value: 'Casting Applications', label: 'Casting Calls & Auditions' },
  { value: 'Profile & Verification', label: 'Performer Portfolio & Verification' },
  { value: 'Technical Problem', label: 'Technical Issue / Bug Report' },
  { value: 'Report a Listing', label: 'Report a Production / Notice' },
];

const ContactPage = () => {
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(SUPPORT_CATEGORIES[0].value);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Auto-populate user info if logged in
  useEffect(() => {
    if (user) {
      if (user.fullName || user.name) setFullName(user.fullName || user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = 'Please enter your full name';
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Please enter your email address';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!category) {
      errs.category = 'Please select a topic category';
    }

    if (!subject.trim()) {
      errs.subject = 'Please enter a subject';
    } else if (subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters';
    }

    if (!message.trim()) {
      errs.message = 'Please enter your message';
    } else if (message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || loading) return;

    setLoading(true);
    try {
      const created = await supportService.createTicket({
        category,
        subject: subject.trim(),
        message: message.trim(),
        user: {
          id: user?.id || `guest-${Date.now()}`,
          fullName: fullName.trim(),
          email: email.trim(),
          role: user?.role || 'candidate',
          companyName: user?.companyName || '',
        },
      });

      setSubmittedTicket(created);
      setToastMessage(`Inquiry submitted! Ticket #${created.ticketNumber || created.id}`);

      // Reset form fields
      setSubject('');
      setMessage('');
      setCategory(SUPPORT_CATEGORIES[0].value);
      setErrors({});
    } catch (err) {
      setToastMessage(err.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    if (!user) {
      setFullName('');
      setEmail('');
    }
    setSubject('');
    setMessage('');
    setCategory(SUPPORT_CATEGORIES[0].value);
    setErrors({});
  };

  return (
    <div className="bg-[#111214] text-neutral-100 min-h-screen py-10 pb-24 text-left font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FA5A36]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-[400px] h-[400px] bg-[#FA5A36]/5 rounded-full blur-3xl pointer-events-none" />

      <PageContainer maxWidth="lg" className="space-y-8 relative z-10">
        <div>
          <BackButton fallback="/" variant="dark" />
        </div>

        {/* Top Header */}
        <div className="space-y-3">
          <span className="text-[#FA5A36] font-bold tracking-widest text-xs uppercase block font-sans">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">
            Contact StageLink Support
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed">
            Have questions about casting calls, performer portfolios, or production partnerships? Our dedicated support team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form or Success Confirmation */}
          <div className="lg:col-span-7 bg-[#18191C] p-7 sm:p-10 rounded-3xl border border-neutral-800 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FA5A36]/10 rounded-full blur-3xl pointer-events-none" />

            {submittedTicket ? (
              <div className="space-y-6 animate-in fade-in duration-300 relative z-10">
                <div className="p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base sm:text-lg">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <span>Inquiry Logged Successfully!</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    Thank you, <strong className="text-white">{submittedTicket.userName}</strong>. Your message has been routed to our operations queue.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs text-neutral-400">Reference Number:</span>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-full border border-emerald-500/30">
                      {submittedTicket.ticketNumber || submittedTicket.id}
                    </span>
                    <span className="px-2.5 py-0.5 bg-neutral-800 text-neutral-300 text-[11px] font-semibold rounded-full border border-neutral-700">
                      Status: Open
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-neutral-900/80 rounded-2xl border border-neutral-800 space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-2.5">
                    <span>Topic</span>
                    <span className="text-white font-medium">{submittedTicket.category}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400 border-b border-neutral-800 pb-2.5">
                    <span>Subject</span>
                    <span className="text-white font-medium max-w-xs truncate">{submittedTicket.subject}</span>
                  </div>
                  <div className="flex justify-between items-center text-neutral-400">
                    <span>Follow-up sent to</span>
                    <span className="text-white font-medium">{submittedTicket.userEmail}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Our talent and production support specialists typically reply within 2 to 4 business hours. You can reference this ticket ID if contacting us again.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#FA5A36] hover:bg-[#E64825] text-white text-xs font-bold rounded-xl shadow-md shadow-[#FA5A36]/30 transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <Link
                    to="/opportunities"
                    className="inline-flex items-center justify-center px-6 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold rounded-xl transition-all"
                  >
                    Browse Casting Calls
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Full Name <span className="text-[#FA5A36]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FA5A36] focus:ring-2 focus:ring-[#FA5A36]/20 transition-all"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-rose-400 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Email Address <span className="text-[#FA5A36]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="maya@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FA5A36] focus:ring-2 focus:ring-[#FA5A36]/20 transition-all"
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 font-medium">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Inquiry Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Category <span className="text-[#FA5A36]">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#FA5A36] focus:ring-2 focus:ring-[#FA5A36]/20 transition-all cursor-pointer"
                  >
                    {SUPPORT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-neutral-900 text-white">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-rose-400 font-medium">{errors.category}</p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Subject <span className="text-[#FA5A36]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Casting Inquiry / Portfolio Verification"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FA5A36] focus:ring-2 focus:ring-[#FA5A36]/20 transition-all"
                  />
                  {errors.subject && (
                    <p className="text-xs text-rose-400 font-medium">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Message <span className="text-[#FA5A36]">*</span>
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Please describe how our team can assist you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-900/90 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FA5A36] focus:ring-2 focus:ring-[#FA5A36]/20 transition-all resize-y"
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-400 font-medium">{errors.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-[#FA5A36] hover:bg-[#E64825] disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-md shadow-[#FA5A36]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Studio Information & Quick Action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#18191C] p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-2xl space-y-6">
              <div className="flex items-center gap-2.5 pb-2 border-b border-neutral-800">
                <div className="w-8 h-8 rounded-lg bg-[#FA5A36]/15 border border-[#FA5A36]/30 flex items-center justify-center text-[#FA5A36]">
                  <Headphones className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold font-sans text-white">
                  Studio Support Hub
                </h3>
              </div>

              <div className="space-y-5 text-xs text-neutral-400">
                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#FA5A36] shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Email Inquiries</h4>
                    <p className="mt-0.5 text-neutral-300">support@stagelink.com</p>
                    <p className="text-[11px] text-neutral-500">casting@stagelink.com (Productions)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#FA5A36] shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Response Time</h4>
                    <p className="mt-0.5 text-neutral-300">Monday to Saturday: 9:00 AM – 7:00 PM IST</p>
                    <p className="text-[11px] text-neutral-500">Typically replies within 2–4 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#FA5A36] shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Studio Headquarters</h4>
                    <p className="mt-0.5 text-neutral-300">Film City Complex, Goregaon East</p>
                    <p className="text-[11px] text-neutral-500">Mumbai, Maharashtra 400065, India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[#FA5A36] shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Verified Safety</h4>
                    <p className="mt-0.5 text-neutral-300">Direct escalation to Platform Compliance</p>
                    <p className="text-[11px] text-neutral-500">Every notice vetted for performer safety</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Card for Casting Call */}
            <div className="bg-gradient-to-br from-[#18191C] to-neutral-900 border border-neutral-800 p-6 sm:p-7 rounded-3xl space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FA5A36]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FA5A36]" />
                <h4 className="text-sm font-bold text-white font-sans">
                  Looking to Post a Casting Call?
                </h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Production houses and casting directors can register for studio accounts to publish notices and review candidate reels directly.
              </p>
              <div className="pt-2">
                <Link
                  to="/post-job"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FA5A36] hover:text-[#FB6947] group-hover:underline transition-colors"
                >
                  <span>Post a Casting Notice</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default ContactPage;
