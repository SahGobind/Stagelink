import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Send,
  Calendar,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { castingService } from '../../services/castingService';
import { talentService } from '../../services/talentService';
import { FALLBACK_TALENT_AVATAR } from '../../data/mockTalentDirectory';

const InviteToCastingModal = ({
  isOpen,
  onClose,
  talent,
  onSuccess,
}) => {
  const { isAuthenticated, user, login } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [demoLoginMode, setDemoLoginMode] = useState(false);

  // Load recruiter opportunities when opened
  useEffect(() => {
    if (!isOpen) {
      setSubmittedSuccess(false);
      setError('');
      setSelectedOppId('');
      setSelectedRole('');
      setMessage('');
      return;
    }

    let isMounted = true;
    const fetchOpps = async () => {
      setIsLoading(true);
      setError('');
      try {
        const opps = await castingService.getRecruiterOpportunities();
        if (isMounted) {
          // Filter to active/open/published calls
          const validOpps = opps.filter(
            (o) => o.status !== 'archived' && o.status !== 'closed'
          );
          setOpportunities(validOpps);
          if (validOpps.length > 0) {
            setSelectedOppId(validOpps[0].id);
            // Default role
            const firstRole = validOpps[0].roles?.[0]?.name || validOpps[0].roleDescription || 'Principal Role';
            setSelectedRole(firstRole);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to retrieve your casting calls. Please try again.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchOpps();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Update role when selected opportunity changes
  const handleOpportunityChange = (oppId) => {
    setSelectedOppId(oppId);
    const opp = opportunities.find((o) => o.id === oppId);
    if (opp) {
      const defaultRole = opp.roles?.[0]?.name || opp.roleDescription || 'Principal Role';
      setSelectedRole(defaultRole);
    }
  };

  const handleDemoLogin = () => {
    login({
      id: 'demo-recruiter',
      fullName: 'Marcus Sterling',
      email: 'recruiter@apexvision.test',
      role: 'admin',
      companyName: 'Apex Vision Studios',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    });
    setDemoLoginMode(false);
  };

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpp) {
      setError('Please select an active casting call.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const recruiterName = user?.companyName || user?.fullName || 'Apex Vision Studios';
      const result = await talentService.sendCastingInvitation({
        talentId: talent.id,
        talentName: talent.fullName,
        talentAvatar: talent.avatar || FALLBACK_TALENT_AVATAR,
        opportunityId: selectedOpp.id,
        opportunityTitle: selectedOpp.title,
        role: selectedRole || 'Principal Role',
        shootDate: selectedOpp.shootDate || selectedOpp.timeline || selectedOpp.postedTime || 'Upcoming Production Schedule',
        location: selectedOpp.location || 'Studio Location',
        deadline: selectedOpp.deadline || 'Open until filled',
        message: message.trim(),
        sentBy: recruiterName,
      });

      if (result.success) {
        setSubmittedSuccess(true);
        onSuccess?.(result.invitation);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while dispatching the invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !talent) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-gray-100 text-left relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-2xs">
            <img
              src={talent.avatar || FALLBACK_TALENT_AVATAR}
              alt={talent.fullName}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_TALENT_AVATAR;
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-pink">
              Direct Casting Outreach
            </span>
            <h2 className="text-lg font-bold font-serif text-brand-navy leading-tight">
              Invite {talent.fullName}
            </h2>
            <p className="text-xs text-brand-text-secondary">
              {talent.headline || talent.category || 'Performer'} • {talent.city || talent.location}
            </p>
          </div>
        </div>

        {/* Success Confirmation State */}
        {submittedSuccess ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold font-serif text-brand-navy">
                Audition Invitation Dispatched!
              </h3>
              <p className="text-xs text-brand-text-secondary max-w-sm mx-auto leading-relaxed">
                <span className="font-semibold text-gray-900">{talent.fullName}</span> has been officially invited to audition for{' '}
                <span className="font-semibold text-gray-900">{selectedOpp?.title}</span> ({selectedRole}).
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[11px] text-gray-600 text-left space-y-1">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audition Alert delivered to artist portal feed</span>
              </div>
              <p className="text-gray-500 pl-5">
                The performer can accept or decline this audition from their StageLink notifications. Real external emails are simulated until email gateway is configured.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-bold hover:bg-black transition-colors shadow-xs"
              >
                Done
              </button>
              <Link
                to="/admin/saved-talent"
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-gray-900 text-xs font-bold transition-colors"
                onClick={onClose}
              >
                View Sent Invitations
              </Link>
            </div>
          </div>
        ) : !isAuthenticated && !demoLoginMode ? (
          /* Authentication Prompt for Guests */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-start gap-3 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-amber-950">Recruiter Authentication Required</p>
                <p className="text-amber-800 leading-relaxed">
                  To invite performers to auditions, you must be signed in as a verified production company or casting director.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Continue as Demo Casting Director (Apex Studios)</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-1">
                <span>Or</span>
                <Link
                  to="/login"
                  className="font-bold text-brand-pink hover:underline"
                  onClick={onClose}
                >
                  Log into your existing recruiter account
                </Link>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500">Loading your active casting calls...</p>
          </div>
        ) : opportunities.length === 0 ? (
          /* Empty Casting Calls State with Link to Announce Work */
          <div className="space-y-4 py-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-brand-pink flex items-center justify-center mx-auto shadow-2xs">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-brand-navy">
                No Active Casting Calls Found
              </h3>
              <p className="text-xs text-brand-text-secondary max-w-sm mx-auto leading-relaxed">
                You need at least one announced casting call to invite talent to an audition slate.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/post-job"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Announce Work (Create Casting Call)</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Invitation Form */
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Casting Call Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-navy">
                Select Active Casting Call <span className="text-brand-pink">*</span>
              </label>
              <select
                value={selectedOppId}
                onChange={(e) => handleOpportunityChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              >
                {opportunities.map((opp) => (
                  <option key={opp.id} value={opp.id}>
                    {opp.title} ({opp.productionCompany || 'Production'})
                  </option>
                ))}
              </select>
            </div>

            {/* Opportunity Details Snapshot */}
            {selectedOpp && (
              <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-gray-900">
                  <span className="truncate pr-2">{selectedOpp.title}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 shrink-0">
                    {selectedOpp.category || 'Production'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1 border-t border-gray-200/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{selectedOpp.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">Deadline: {selectedOpp.deadline}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Role / Character Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-brand-navy">
                Role / Character Title <span className="text-brand-pink">*</span>
              </label>
              <input
                type="text"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                required
                placeholder="e.g. Lead Female Investigator / Character Name"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink"
              />
            </div>

            {/* Optional Personalized Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-brand-navy">
                  Personalized Note (Optional)
                </label>
                <span className="text-[10px] text-gray-400">
                  {message.length}/500
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. We loved your showreel and would like to invite you for an in-person screen test next week..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink/30 focus:border-brand-pink resize-none"
              />
            </div>

            {/* Disclaimer */}
            <p className="text-[10px] text-gray-400 leading-tight">
              Mock audition dispatch: The invitation is recorded in your studio session and candidate notification feed.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedOppId}
                className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dispatching...' : 'Send Invitation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default InviteToCastingModal;
