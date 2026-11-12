import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Search,
  Globe,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  PlusCircle,
  RefreshCw,
  ExternalLink,
  Briefcase,
  AlertTriangle,
  Eye,
  FileText,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

const PAGE_SIZE = 9;

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    industry: 'Film & Television Production',
    location: 'Mumbai, India',
    website: 'https://',
    email: '',
    phone: '',
    description: '',
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchCompanies = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiRequest('/api/companies/');
      if (res.ok) {
        const json = await res.json();
        setCompanies(json.results || []);
      }
    } catch (err) {
      console.warn('Failed to fetch companies:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/api/companies/', {
        method: 'POST',
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        const created = await res.json();
        setCompanies((prev) => [created, ...prev]);
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          industry: 'Film & Television Production',
          location: 'Mumbai, India',
          website: 'https://',
          email: '',
          phone: '',
          description: '',
        });
        setActionSuccessMsg(`Studio profile "${created.name}" created successfully.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to register company: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      const res = await apiRequest(`/api/companies/${selectedCompany.id || selectedCompany._id}/`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setCompanies((prev) =>
          prev.map((c) => ((c.id === selectedCompany.id || c._id === selectedCompany._id) ? { ...c, ...editForm } : c))
        );
        setIsEditModalOpen(false);
        setActionSuccessMsg(`Studio "${editForm.name}" updated successfully.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  const handleToggleVerification = async (company) => {
    const isCurrentlyVerified = Boolean(company.is_verified || company.verification_status === 'verified');
    const newStatus = !isCurrentlyVerified;
    try {
      const cid = company.id || company._id;
      const res = await apiRequest(`/api/companies/${cid}/`, {
        method: 'PATCH',
        body: JSON.stringify({ is_verified: newStatus, verification_status: newStatus ? 'verified' : 'unverified' }),
      });
      if (res.ok) {
        setCompanies((prev) =>
          prev.map((c) => ((c.id === cid || c._id === cid) ? { ...c, is_verified: newStatus, verification_status: newStatus ? 'verified' : 'unverified' } : c))
        );
        setActionSuccessMsg(`Verification status updated for ${company.name}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Verification update failed: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const cid = deleteTarget.id || deleteTarget._id;
      const res = await apiRequest(`/api/companies/${cid}/`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        setCompanies((prev) => prev.filter((c) => (c.id !== cid && c._id !== cid)));
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        setActionSuccessMsg(`Studio profile deleted.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (c.name || '').toLowerCase();
        const loc = (c.location || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        if (!name.includes(q) && !loc.includes(q) && !email.includes(q)) return false;
      }
      if (statusFilter !== 'all') {
        const isVer = Boolean(c.is_verified || c.verification_status === 'verified');
        if (statusFilter === 'verified' && !isVer) return false;
        if (statusFilter === 'unverified' && isVer) return false;
      }
      return true;
    });
  }, [companies, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const s = (page - 1) * PAGE_SIZE;
    return filteredCompanies.slice(s, s + PAGE_SIZE);
  }, [filteredCompanies, page]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Production Companies & Studios</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Supervise production houses, casting agencies, accreditation licenses, and studio accounts.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchCompanies(true)}
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
            <span>Register Studio</span>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Studios</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{companies.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified Studios</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{companies.filter((c) => c.is_verified || c.verification_status === 'verified').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending License Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{companies.filter((c) => !c.is_verified && c.verification_status !== 'verified').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Casting Calls</p>
          <p className="text-2xl font-black text-[#FA5A36] mt-1">7</p>
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
            placeholder="Search studios by name, location, email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA5A36] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified Studios</option>
            <option value="unverified">Pending Verification</option>
          </select>
        </div>
      </div>

      {/* Studios Grid / Table */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingSpinner message="Fetching production houses from MongoDB Atlas..." />
        </div>
      ) : paginated.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No production studios found</h3>
          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search queries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((c) => {
            const isVer = Boolean(c.is_verified || c.verification_status === 'verified');
            return (
              <div
                key={c.id || c._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FA5A36] flex items-center justify-center border border-orange-100">
                      <Building2 className="w-5 h-5" />
                    </div>
                    {isVer ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Studio
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Pending Review
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 truncate">{c.name}</h3>
                  <p className="text-xs text-[#FA5A36] font-semibold mt-0.5">{c.industry || 'Film & TV Production'}</p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.location || 'Mumbai, India'}</span>
                    </p>
                    {c.email && (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </p>
                    )}
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[#FA5A36] hover:underline truncate"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{c.website.replace('https://', '')}</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => { setSelectedCompany(c); setIsDetailModalOpen(true); }}
                    className="font-bold text-[#FA5A36] hover:underline cursor-pointer"
                  >
                    View Dossier
                  </button>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleToggleVerification(c)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isVer ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                      }`}
                      title={isVer ? 'Revoke Verification' : 'Approve Verification'}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCompany(c);
                        setEditForm({
                          name: c.name || '',
                          industry: c.industry || '',
                          location: c.location || '',
                          website: c.website || '',
                          email: c.email || '',
                          phone: c.phone || '',
                          description: c.description || '',
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-[#FA5A36] hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Edit Studio"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(c); setIsDeleteModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Delete Studio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dossier Modal */}
      {isDetailModalOpen && selectedCompany && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Production Company Accreditation Dossier"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FA5A36] flex items-center justify-center font-bold text-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedCompany.name}</h3>
                <p className="text-slate-500">{selectedCompany.industry || 'Film Production'}</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-[#FA5A36]">
                  {selectedCompany.location || 'India'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-700 block">Submitted Accreditation Documents</span>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#FA5A36]" />
                  <span className="font-medium text-slate-800">Certificate of Incorporation & Studio GST</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Verified Legal</span>
              </div>
            </div>

            {selectedCompany.description && (
              <div>
                <span className="font-bold text-slate-700 block mb-1">Company Overview</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedCompany.description}
                </p>
              </div>
            )}

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

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Register Production Company / Studio"
        >
          <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Studio / Agency Name</label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Dharma Productions or StarCast Casting"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Industry Sector</label>
              <input
                type="text"
                value={createForm.industry}
                onChange={(e) => setCreateForm({ ...createForm, industry: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Headquarters Location</label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Website</label>
                <input
                  type="url"
                  value={createForm.website}
                  onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                />
              </div>
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#FA5A36] hover:bg-[#e04825] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Registering...' : 'Register Company'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Studio Details"
        >
          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Studio Name</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
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

      {/* Delete Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Studio Deletion"
        >
          <div className="space-y-4 text-xs font-sans">
            <p className="text-slate-600">
              Are you sure you want to permanently remove studio <strong>{deleteTarget.name}</strong> from StageLink?
            </p>
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold cursor-pointer"
              >
                Delete Studio
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CompaniesPage;
