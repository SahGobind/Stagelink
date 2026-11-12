import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Briefcase,
  UserCheck,
  RefreshCw,
  Building2,
  ExternalLink,
  FileText,
  Filter,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';

const VerificationsPage = () => {
  const [activeQueue, setActiveQueue] = useState('artists'); // 'artists' | 'studios' | 'casting'
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending' | 'approved'
  const [users, setUsers] = useState([]);
  const [pendingOpps, setPendingOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Rejection modal
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Submitted documentation does not meet StageLink identity accreditation standards.');

  // Document review modal
  const [reviewTarget, setReviewTarget] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchQueue = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      // 1. Pending opportunities
      const oppRes = await apiRequest('/api/opportunities/moderation/');
      if (oppRes.ok) {
        const json = await oppRes.json();
        setPendingOpps(json.results || []);
      }

      // 2. Users (artists and recruiters)
      const userRes = await apiRequest('/api/users/');
      if (userRes.ok) {
        const allUsers = await userRes.json();
        setUsers(Array.isArray(allUsers) ? allUsers : allUsers.results || []);
      }
    } catch (err) {
      console.warn('Failed to load verifications queue:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Approve User Profile
  const handleApproveUser = async (user) => {
    try {
      const res = await apiRequest(`/api/users/${user.id}/toggle-verification/`, {
        method: 'POST',
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_verified: true, status: 'active' } : u))
        );
        setActionMsg(`Account for ${user.fullName || user.email} verified and approved successfully.`);
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (err) {
      alert('Verification failed: ' + err.message);
    }
  };

  // Reject User Profile
  const handleRejectUser = async () => {
    if (!rejectTarget) return;
    try {
      const res = await apiRequest(`/api/users/${rejectTarget.id}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status: 'suspended', reason: rejectReason }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === rejectTarget.id ? { ...u, is_verified: false, status: 'suspended' } : u))
        );
        setIsRejectModalOpen(false);
        setRejectTarget(null);
        setActionMsg(`Verification rejected for ${rejectTarget.fullName || rejectTarget.email}.`);
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  // Approve Opportunity Listing
  const handleApproveOpp = async (oppId) => {
    try {
      const res = await apiRequest(`/api/opportunities/${oppId}/approve/`, { method: 'POST' });
      if (res.ok) {
        setPendingOpps((prev) => prev.filter((o) => o.id !== oppId));
        setActionMsg(`Casting call ${oppId} approved and published live.`);
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  };

  // Filter lists based on queue & status
  const pendingArtists = users.filter((u) => (u.role === 'candidate' || u.role === 'talent') && (statusFilter === 'pending' ? !u.is_verified : u.is_verified));
  const pendingStudios = users.filter((u) => (u.role === 'recruiter' || u.role === 'production_company') && (statusFilter === 'pending' ? !u.is_verified : u.is_verified));

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Verification & Approvals Center</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Central moderation queue for artist accreditation, studio licensing, and casting call quality approval.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchQueue(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FA5A36]' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Queue'}</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* Queue Category Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2 text-xs">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveQueue('artists')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
              activeQueue === 'artists'
                ? 'bg-[#FA5A36] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Artist Profiles ({users.filter((u) => (u.role === 'candidate' || u.role === 'talent') && !u.is_verified).length})</span>
          </button>

          <button
            onClick={() => setActiveQueue('studios')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
              activeQueue === 'studios'
                ? 'bg-[#FA5A36] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Studio Accreditation ({users.filter((u) => (u.role === 'recruiter' || u.role === 'production_company') && !u.is_verified).length})</span>
          </button>

          <button
            onClick={() => setActiveQueue('casting')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
              activeQueue === 'casting'
                ? 'bg-[#FA5A36] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Casting Notices ({pendingOpps.length})</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
              statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
              statusFilter === 'approved' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            Approved History
          </button>
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner message="Checking verification and moderation backlog..." />
        </div>
      ) : activeQueue === 'artists' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {pendingArtists.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Artist verification queue is clear</p>
              <p className="text-xs text-slate-400 mt-1">All performers currently evaluated.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingArtists.map((artist) => (
                <div key={artist.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <Avatar
                      src={artist.avatar || artist.profile_photo}
                      name={artist.fullName || artist.full_name || artist.email}
                      size="md"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{artist.fullName || artist.full_name || 'Artist Member'}</h3>
                      <p className="text-xs text-slate-500">{artist.category || 'Actor'} • {artist.location || 'India'}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{artist.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => { setReviewTarget(artist); setIsReviewModalOpen(true); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Inspect Documents
                    </button>
                    {!artist.is_verified && (
                      <>
                        <button
                          onClick={() => { setRejectTarget(artist); setIsRejectModalOpen(true); }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveUser(artist)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Approve Verification
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeQueue === 'studios' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {pendingStudios.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Studio accreditation queue is clear</p>
              <p className="text-xs text-slate-400 mt-1">No pending production studio requests.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingStudios.map((studio) => (
                <div key={studio.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FA5A36] flex items-center justify-center border border-orange-100 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{studio.fullName || studio.companyName || studio.email}</h3>
                      <p className="text-xs text-slate-500">{studio.location || 'India'} • Production Recruiter</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => { setReviewTarget(studio); setIsReviewModalOpen(true); }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Review Legal Proof
                    </button>
                    {!studio.is_verified && (
                      <>
                        <button
                          onClick={() => { setRejectTarget(studio); setIsRejectModalOpen(true); }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApproveUser(studio)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Verify Studio
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Casting Notices Moderation Queue */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {pendingOpps.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">All casting listings moderated</p>
              <p className="text-xs text-slate-400 mt-1">No pending opportunities awaiting publication review.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingOpps.map((opp) => (
                <div key={opp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                      {opp.category || 'Casting Notice'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{opp.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{opp.location || 'Mumbai, India'} • {opp.compensation || 'Paid Role'}</p>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <button
                      onClick={() => handleApproveOpp(opp.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Approve & Publish Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Documents Modal */}
      {isReviewModalOpen && reviewTarget && (
        <Modal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          title="Submitted Documentation & Verification Dossier"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900">{reviewTarget.fullName || reviewTarget.name || reviewTarget.email}</h4>
              <p className="text-slate-500">{reviewTarget.role} • ID: {reviewTarget.id}</p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-700 block">Identity Accreditation Checklist:</span>
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <span>1. Government ID / Passport Match</span>
                  <span className="text-emerald-600 font-bold">✓ Match</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>2. Production Credit History Proof</span>
                  <span className="text-emerald-600 font-bold">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>3. Representation Agency Contact</span>
                  <span className="text-emerald-600 font-bold">✓ Confirmed</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Rejection Reason Modal */}
      {isRejectModalOpen && rejectTarget && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Reject Verification Request"
        >
          <div className="space-y-4 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Formal Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
              />
              <p className="text-[10px] text-slate-400 mt-1">This notification will be transmitted to the member's account.</p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VerificationsPage;
