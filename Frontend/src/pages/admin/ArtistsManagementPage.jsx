import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Edit2,
  PlusCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Award,
  Video,
  FileText,
  Ban,
  RotateCcw,
  LayoutGrid,
  List,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const PAGE_SIZE = 9;

const ArtistsManagementPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: 'Password@123',
    category: 'Actor',
    location: 'Mumbai, India',
    phone: '',
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchArtists = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiRequest('/api/users/?role=candidate');
      if (res.ok) {
        const data = await res.json();
        setArtists(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.warn('Failed to load artists:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  // 1. Toggle Verification (Approve/Revoke)
  const handleToggleVerification = async (artist) => {
    try {
      const res = await apiRequest(`/api/users/${artist.id}/toggle-verification/`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        setArtists((prev) =>
          prev.map((a) => (a.id === artist.id ? { ...a, is_verified: json.is_verified } : a))
        );
        setActionSuccessMsg(`Verification status updated for ${artist.fullName || artist.full_name || artist.email}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Verification update failed: ' + err.message);
    }
  };

  // 2. Suspend / Activate Profile
  const handleToggleStatus = async (artist) => {
    const newStatus = artist.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await apiRequest(`/api/users/${artist.id}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setArtists((prev) =>
          prev.map((a) => (a.id === artist.id ? { ...a, status: newStatus, is_active: newStatus === 'active' } : a))
        );
        setActionSuccessMsg(`Artist profile is now ${newStatus}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // 3. Edit Profile
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedArtist) return;
    try {
      const res = await apiRequest(`/api/users/${selectedArtist.id}/admin-update/`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const json = await res.json();
        setArtists((prev) =>
          prev.map((a) => (a.id === selectedArtist.id ? { ...a, ...editForm } : a))
        );
        setIsEditModalOpen(false);
        setActionSuccessMsg('Artist details successfully updated.');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update artist: ' + err.message);
    }
  };

  // 4. Create Artist
  const handleCreateArtist = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/api/users/admin/create/', {
        method: 'POST',
        body: JSON.stringify({ ...createForm, role: 'candidate' }),
      });
      if (res.ok) {
        const json = await res.json();
        setArtists((prev) => [json.user, ...prev]);
        setIsCreateModalOpen(false);
        setCreateForm({
          fullName: '',
          email: '',
          password: 'Password@123',
          category: 'Actor',
          location: 'Mumbai, India',
          phone: '',
        });
        setActionSuccessMsg(`Artist account created for ${json.user.email}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create artist.');
      }
    } catch (err) {
      alert('Create failed: ' + err.message);
    }
  };

  // Filtering
  const filtered = useMemo(() => {
    return artists.filter((a) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (a.fullName || a.full_name || '').toLowerCase();
        const email = (a.email || '').toLowerCase();
        const skills = (Array.isArray(a.skills) ? a.skills.join(' ') : a.skills || '').toLowerCase();
        if (!name.includes(q) && !email.includes(q) && !skills.includes(q)) return false;
      }
      if (verificationFilter !== 'all') {
        if (verificationFilter === 'verified' && !a.is_verified) return false;
        if (verificationFilter === 'unverified' && a.is_verified) return false;
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && a.status === 'suspended') return false;
        if (statusFilter === 'suspended' && a.status !== 'suspended') return false;
      }
      if (categoryFilter !== 'all') {
        const cat = (a.category || '').toLowerCase();
        if (!cat.includes(categoryFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [artists, search, verificationFilter, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const s = (page - 1) * PAGE_SIZE;
    return filtered.slice(s, s + PAGE_SIZE);
  }, [filtered, page]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Artists & Talent Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Supervise performer profiles, review portfolio media, and approve verification requests.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchArtists(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#FA5A36]' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Artist Profile</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg('')} className="text-emerald-700 font-bold">✕</button>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Artists</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{artists.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified Profiles</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{artists.filter((a) => a.is_verified).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Verification</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{artists.filter((a) => !a.is_verified).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suspended</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{artists.filter((a) => a.status === 'suspended').length}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by artist name, skills, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA5A36] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Verification filter */}
          <select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Verifications</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified / Pending</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Categories</option>
            <option value="actor">Actor</option>
            <option value="model">Model</option>
            <option value="voiceover">Voiceover</option>
            <option value="dancer">Dancer</option>
            <option value="musician">Musician</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-md text-xs cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md text-xs cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-500'}`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner message="Loading artists from Atlas..." />
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No artists match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search queries.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Artist Profile</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Verification</th>
                  <th className="py-3 px-4 text-center">Account Status</th>
                  <th className="py-3 px-4 text-right">Super Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((artist) => {
                  const name = artist.fullName || artist.full_name || artist.name || 'Performer';
                  return (
                    <tr key={artist.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <Avatar
                          src={artist.avatar || artist.profile_photo}
                          name={name}
                          size="md"
                          className="ring-1 ring-slate-200"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate leading-tight">{name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{artist.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {artist.category || 'Actor'}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {artist.location || 'Mumbai, India'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {artist.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            artist.status === 'suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {artist.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Detail button */}
                          <button
                            onClick={() => { setSelectedArtist(artist); setIsDetailModalOpen(true); }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {/* Toggle verification */}
                          <button
                            onClick={() => handleToggleVerification(artist)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              artist.is_verified
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={artist.is_verified ? 'Revoke Verification' : 'Approve Verification'}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </button>
                          {/* Suspend / Restore */}
                          <button
                            onClick={() => handleToggleStatus(artist)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              artist.status === 'suspended'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-rose-600 hover:bg-rose-50'
                            }`}
                            title={artist.status === 'suspended' ? 'Reactivate Profile' : 'Suspend Profile'}
                          >
                            {artist.status === 'suspended' ? <RotateCcw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setSelectedArtist(artist);
                              setEditForm({
                                fullName: artist.fullName || artist.full_name || '',
                                email: artist.email || '',
                                category: artist.category || 'Actor',
                                location: artist.location || '',
                                phone: artist.phoneNumber || artist.phone_number || '',
                                bio: artist.bio || '',
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-[#FA5A36] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {paginated.length} of {filtered.length} artists</span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Previous
              </button>
              <span className="font-bold px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((artist) => {
            const name = artist.fullName || artist.full_name || 'Performer';
            return (
              <div
                key={artist.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <Avatar
                      src={artist.avatar || artist.profile_photo}
                      name={name}
                      size="lg"
                      className="ring-2 ring-slate-100 mb-3"
                    />
                    <div className="flex flex-col items-end gap-1">
                      {artist.is_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${artist.status === 'suspended' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                        {artist.status === 'suspended' ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{name}</h3>
                  <p className="text-xs text-[#FA5A36] font-semibold">{artist.category || 'Actor'}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{artist.location || 'Mumbai, India'}</span>
                  </p>
                  {artist.bio && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{artist.bio}</p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => { setSelectedArtist(artist); setIsDetailModalOpen(true); }}
                    className="text-xs font-semibold text-[#FA5A36] hover:underline cursor-pointer"
                  >
                    View Dossier
                  </button>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleToggleVerification(artist)}
                      className="px-2 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                    >
                      {artist.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(artist)}
                      className={`px-2 py-1 text-[11px] rounded-lg font-medium ${artist.status === 'suspended' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                    >
                      {artist.status === 'suspended' ? 'Restore' : 'Suspend'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal (Performer Dossier) */}
      {isDetailModalOpen && selectedArtist && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Artist Full Profile & Media Portfolio"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Avatar
                src={selectedArtist.avatar || selectedArtist.profile_photo}
                name={selectedArtist.fullName || selectedArtist.full_name || 'Performer'}
                size="lg"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedArtist.fullName || selectedArtist.full_name || 'Performer'}
                </h3>
                <p className="text-xs text-[#FA5A36] font-semibold">{selectedArtist.category || 'Actor'}</p>
                <p className="text-slate-400">{selectedArtist.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-400 block mb-0.5">Location</span>
                <span className="font-bold text-slate-800">{selectedArtist.location || 'Not Specified'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-400 block mb-0.5">Phone</span>
                <span className="font-bold text-slate-800">{selectedArtist.phoneNumber || selectedArtist.phone_number || 'Confidential'}</span>
              </div>
            </div>

            {selectedArtist.bio && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Biography / About</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedArtist.bio}
                </p>
              </div>
            )}

            <div>
              <span className="font-bold text-slate-700 block mb-1">Media Portfolio</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src={selectedArtist.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt="Headshot"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
                    alt="Portfolio Photo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex flex-col items-center justify-center p-2 text-center text-slate-500">
                  <Video className="w-5 h-5 text-[#FA5A36] mb-1" />
                  <span className="text-[10px] font-semibold">Video Reel</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Artist Details"
        >
          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={editForm.fullName || ''}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Primary Category</label>
              <select
                value={editForm.category || 'Actor'}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36]"
              >
                <option value="Actor">Actor</option>
                <option value="Model">Model</option>
                <option value="Voiceover">Voiceover</option>
                <option value="Dancer">Dancer</option>
                <option value="Musician">Musician</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location</label>
              <input
                type="text"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Biography</label>
              <textarea
                rows={3}
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl font-semibold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add New Artist Profile"
        >
          <form onSubmit={handleCreateArtist} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                placeholder="e.g. Ananya Sen"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="artist@example.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Initial Password</label>
              <input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36]"
              >
                <option value="Actor">Actor</option>
                <option value="Model">Model</option>
                <option value="Voiceover">Voiceover</option>
                <option value="Dancer">Dancer</option>
                <option value="Musician">Musician</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Location</label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                placeholder="Mumbai, India"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl font-semibold cursor-pointer"
              >
                Create Artist Profile
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ArtistsManagementPage;

