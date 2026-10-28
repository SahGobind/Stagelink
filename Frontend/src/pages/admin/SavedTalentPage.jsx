import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Users,
  Send,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Inbox,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import BackButton from '../../components/common/BackButton';
import InviteToCastingModal from '../../components/talent/InviteToCastingModal';
import Toast from '../../components/common/Toast';
import {
  talentService,
  EVENT_SAVED_TALENT_CHANGED,
  EVENT_INVITATIONS_CHANGED,
} from '../../services/talentService';
import { FALLBACK_TALENT_AVATAR } from '../../data/mockTalentDirectory';

const SavedTalentPage = () => {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'invitations'
  const [savedTalent, setSavedTalent] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [selectedTalentForInvite, setSelectedTalentForInvite] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = () => {
    setSavedTalent(talentService.getSavedTalent());
    setInvitations(talentService.getCastingInvitations());
  };

  useEffect(() => {
    loadData();

    const handleSavedChanged = () => setSavedTalent(talentService.getSavedTalent());
    const handleInvChanged = () => setInvitations(talentService.getCastingInvitations());

    window.addEventListener(EVENT_SAVED_TALENT_CHANGED, handleSavedChanged);
    window.addEventListener(EVENT_INVITATIONS_CHANGED, handleInvChanged);
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener(EVENT_SAVED_TALENT_CHANGED, handleSavedChanged);
      window.removeEventListener(EVENT_INVITATIONS_CHANGED, handleInvChanged);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const handleRemove = (talentId, name) => {
    talentService.removeSavedTalent(talentId);
    setToastMessage(`${name || 'Performer'} removed from your saved roster.`);
  };

  const handleRespondInvitation = (invId, status) => {
    talentService.respondToInvitation(invId, status);
    setToastMessage(`Invitation marked as ${status}.`);
  };

  return (
    <PageContainer maxWidth="7xl" className="py-8 pb-24 text-left space-y-6">
      <div>
        <BackButton fallback="/talent" label="Back to Discover Talent" variant="light" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-50 border border-pink-100 text-brand-pink text-[11px] font-bold">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Recruiter Talent Roster</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy">
            Saved Talent & Audition Invitations
          </h1>
          <p className="text-xs text-brand-text-secondary mt-0.5 max-w-2xl">
            Keep track of bookmarked performers for upcoming productions and review direct audition invitations. (Separate from published casting call applications).
          </p>
        </div>

        <Link
          to="/talent"
          className="px-4 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Discover More Talent</span>
        </Link>
      </div>

      {/* Temporary Session Persistence Banner */}
      <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Mock-Data Persistence: Saved talent and invitations are stored locally in this browser session until Django database integration is completed.
          </span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-4 border-b border-gray-100 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`pb-3 relative transition-colors flex items-center gap-2 ${
            activeTab === 'saved' ? 'text-brand-pink font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Saved Talent Roster</span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
            {savedTalent.length}
          </span>
          {activeTab === 'saved' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('invitations')}
          className={`pb-3 relative transition-colors flex items-center gap-2 ${
            activeTab === 'invitations' ? 'text-brand-pink font-bold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <span>Sent Audition Invitations</span>
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
            {invitations.length}
          </span>
          {activeTab === 'invitations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Saved Talent Roster */}
      {activeTab === 'saved' && (
        <div>
          {savedTalent.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold font-serif text-brand-navy">
                  Your Saved Talent Roster is Empty
                </h3>
                <p className="text-xs text-brand-text-secondary leading-relaxed">
                  Bookmark talent from the Discover Talent directory to build your private casting shortlist and invite candidates to screen tests.
                </p>
              </div>
              <Link
                to="/talent"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
              >
                <span>Browse Performers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedTalent.map((talent) => (
                <div
                  key={talent.id}
                  className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all flex flex-col overflow-hidden text-left"
                >
                  {/* Photo Header */}
                  <div className="relative aspect-4/3 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={talent.avatar || FALLBACK_TALENT_AVATAR}
                      alt={talent.fullName}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_TALENT_AVATAR;
                      }}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[10px] font-bold text-brand-navy">
                        {talent.category || 'Actor'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(talent.id, talent.fullName)}
                        className="w-7 h-7 rounded-full bg-white/90 text-gray-400 hover:text-red-600 hover:bg-white flex items-center justify-center transition-colors shadow-xs"
                        title="Remove from saved roster"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-sm font-bold font-serif text-white tracking-tight truncate">
                        {talent.fullName}
                      </h3>
                      <p className="text-[11px] text-gray-200 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-pink-300 shrink-0" />
                        <span>{talent.city || talent.location || 'India'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <p className="text-xs text-brand-text-secondary line-clamp-2">
                      {talent.bio || talent.headline || 'Stage and screen performer available for castings.'}
                    </p>

                    {/* Actions */}
                    <div className="pt-2 border-t border-gray-50 flex items-center gap-2">
                      <Link
                        to={`/talent/${talent.id}`}
                        className="flex-1 py-2 px-3 rounded-xl border border-gray-200 hover:border-gray-900 bg-white hover:bg-gray-50 text-brand-navy text-xs font-bold text-center transition-all shadow-2xs"
                      >
                        View Profile
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSelectedTalentForInvite(talent)}
                        className="py-2 px-3 rounded-xl bg-brand-pink hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Invite</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Sent Audition Invitations */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          {invitations.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto space-y-3">
              <div className="w-14 h-14 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto shadow-inner">
                <Send className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold font-serif text-brand-navy">
                No Audition Invitations Dispatched Yet
              </h3>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                When you invite performers to auditions, their status and responses will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 sm:p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left shadow-2xs"
                >
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    <img
                      src={inv.talentAvatar || FALLBACK_TALENT_AVATAR}
                      alt={inv.talentName}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_TALENT_AVATAR;
                      }}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold font-serif text-brand-navy">
                          {inv.talentName}
                        </h3>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            inv.status === 'accepted'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'declined'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {inv.status === 'accepted' ? 'Audition Accepted' : inv.status === 'declined' ? 'Declined' : 'Invitation Pending'}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Sent on {new Date(inv.sentAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-gray-800">
                        {inv.opportunityTitle} • Role: <span className="text-brand-pink font-bold">{inv.role}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {inv.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {inv.shootDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          Deadline: {inv.deadline}
                        </span>
                      </div>

                      {inv.message && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 mt-2 font-normal italic">
                          "{inv.message}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions / Performer Response Simulation */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      to={`/talent/${inv.talentId}`}
                      className="p-2 text-gray-500 hover:text-brand-navy hover:bg-gray-100 rounded-xl transition-colors"
                      title="Open Artist Profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>

                    {inv.status === 'pending' && (
                      <div className="flex items-center gap-1.5 pl-2 border-l border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleRespondInvitation(inv.id, 'accepted')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold transition-colors"
                          title="Simulate candidate acceptance"
                        >
                          Accept (Demo)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRespondInvitation(inv.id, 'declined')}
                          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-colors"
                          title="Simulate candidate decline"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <InviteToCastingModal
        isOpen={Boolean(selectedTalentForInvite)}
        onClose={() => setSelectedTalentForInvite(null)}
        talent={selectedTalentForInvite}
        onSuccess={() => {
          loadData();
          setToastMessage(`Audition invitation dispatched to ${selectedTalentForInvite?.fullName}!`);
        }}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </PageContainer>
  );
};

export default SavedTalentPage;
