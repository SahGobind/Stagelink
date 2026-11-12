import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Users,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Edit2,
  Ban,
  RotateCcw,
  X,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  KeyRound,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { apiRequest } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

const PAGE_SIZE = 10;

const UsersPage = () => {
  const { user: currentAuthUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [page, setPage] = useState(1);

  // Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: 'Password@123',
    role: 'candidate',
    location: 'Mumbai, India',
    phone: '',
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Fetch users from MongoDB Atlas backend
  const fetchUsers = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await apiRequest('/api/users/');
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.warn('Failed to fetch users:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle 1-click verification toggle
  const handleToggleVerification = async (targetUser) => {
    try {
      const res = await apiRequest(`/api/users/${targetUser.id}/toggle-verification/`, {
        method: 'POST',
      });
      if (res.ok) {
        const json = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_verified: json.is_verified, status: json.is_verified ? 'active' : 'pending' } : u))
        );
        setActionSuccessMsg(`Verification updated for ${targetUser.fullName || targetUser.email}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Failed to update verification: ' + err.message);
    }
  };

  // Handle Suspend / Activate
  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await apiRequest(`/api/users/${targetUser.id}/status/`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus, is_active: newStatus === 'active' } : u))
        );
        setActionSuccessMsg(`Account status changed to ${newStatus}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Handle User Deletion
  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await apiRequest(`/api/users/${deleteTarget.id}/delete/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        setActionSuccessMsg(`Account permanently removed from MongoDB.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Delete operation failed: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Edit Profile
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await apiRequest(`/api/users/${selectedUser.id}/admin-update/`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUser.id ? { ...u, ...editForm } : u))
        );
        setIsEditModalOpen(false);
        setActionSuccessMsg('User profile updated successfully.');
        setTimeout(() => setActionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  // Provision New User Account
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/api/users/admin/create/', {
        method: 'POST',
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        const json = await res.json();
        setUsers((prev) => [json.user, ...prev]);
        setIsCreateModalOpen(false);
        setCreateForm({
          fullName: '',
          email: '',
          password: 'Password@123',
          role: 'candidate',
          location: 'Mumbai, India',
          phone: '',
        });
        setActionSuccessMsg(`Account provisioned for ${json.user.email}.`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
      } else {
        const json = await res.json();
        alert(json.error || 'Failed to provision account.');
      }
    } catch (err) {
      alert('Create failed: ' + err.message);
    }
  };

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const name = (u.fullName || u.full_name || '').toLowerCase();
          const email = (u.email || '').toLowerCase();
          const phone = (u.phoneNumber || u.phone_number || '').toLowerCase();
          const uid = (u.id || '').toLowerCase();
          if (!name.includes(q) && !email.includes(q) && !phone.includes(q) && !uid.includes(q)) {
            return false;
          }
        }

        if (roleFilter !== 'all') {
          if (roleFilter === 'artist' && u.role !== 'candidate' && u.role !== 'talent') return false;
          if (roleFilter === 'recruiter' && u.role !== 'recruiter' && u.role !== 'production_company') return false;
          if (roleFilter === 'admin' && u.role !== 'admin' && u.role !== 'super_admin') return false;
          if (roleFilter === 'operations' && u.role !== 'operations') return false;
        }

        if (statusFilter !== 'all') {
          if (statusFilter === 'verified' && !u.is_verified) return false;
          if (statusFilter === 'pending' && u.is_verified) return false;
          if (statusFilter === 'active' && u.status === 'suspended') return false;
          if (statusFilter === 'suspended' && u.status !== 'suspended') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortOrder === 'oldest') {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortOrder === 'name') {
          const nameA = a.fullName || a.full_name || a.email || '';
          const nameB = b.fullName || b.full_name || b.email || '';
          return nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [users, search, roleFilter, statusFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, page]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full governance across talent, casting directors, production houses, and admin accounts.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchUsers(true)}
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
            <span>Provision User</span>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone, or ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FA5A36] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Roles</option>
            <option value="artist">Artists / Talent</option>
            <option value="recruiter">Studios / Recruiters</option>
            <option value="admin">Administrators</option>
            <option value="operations">Operations Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Review</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#FA5A36]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 flex items-center justify-center">
            <LoadingSpinner message="Fetching accounts from MongoDB Atlas..." />
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium text-slate-600 text-sm">No accounts found</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search terms or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 text-center">Verification</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.map((u) => {
                  const isSuperAdminAccount = u.role === 'super_admin' || u.id === 'superadmin-1';
                  const isVerified = Boolean(u.is_verified);
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <Avatar
                          src={u.avatar || u.profile_photo}
                          name={u.fullName || u.full_name || u.email}
                          size="md"
                          className="ring-1 ring-slate-200"
                        />
                        <div className="truncate">
                          <p className="font-bold text-slate-900 truncate leading-tight">
                            {u.fullName || u.full_name || 'Member'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'super_admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : u.role === 'recruiter' || u.role === 'production_company'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role === 'candidate' ? 'Artist' : u.role?.replace('_', ' ') || 'User'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {u.location || 'Worldwide'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        {/* View Details */}
                        <button
                          onClick={() => { setSelectedUser(u); setIsViewModalOpen(true); }}
                          title="View Profile Details"
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Verification */}
                        <button
                          onClick={() => handleToggleVerification(u)}
                          title={isVerified ? 'Unverify Account' : 'Approve & Verify'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isVerified ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        {/* Suspend / Restore */}
                        {!isSuperAdminAccount && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={isSuspended ? 'Restore Account' : 'Suspend Account'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSuspended ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            {isSuspended ? <RotateCcw className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        {/* Edit User Info */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditForm({
                              fullName: u.fullName || u.full_name || '',
                              email: u.email || '',
                              role: u.role || 'candidate',
                              location: u.location || '',
                              phoneNumber: u.phoneNumber || u.phone_number || '',
                            });
                            setIsEditModalOpen(true);
                          }}
                          title="Edit User Info"
                          className="p-1.5 text-slate-500 hover:text-[#FA5A36] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        {!isSuperAdminAccount && (
                          <button
                            onClick={() => { setDeleteTarget(u); setIsDeleteModalOpen(true); }}
                            title="Delete User"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {paginatedUsers.length} of {filteredUsers.length} users</span>
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

      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="User Account Dossier"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Avatar
                src={selectedUser.avatar || selectedUser.profile_photo}
                name={selectedUser.fullName || selectedUser.email}
                size="lg"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedUser.fullName || selectedUser.full_name || 'Member'}
                </h3>
                <p className="text-slate-500">{selectedUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">User ID</span>
                <span className="font-mono text-slate-800">{selectedUser.id}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">Location</span>
                <span className="text-slate-800">{selectedUser.location || 'Worldwide'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User Information"
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
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Role</label>
              <select
                value={editForm.role || 'candidate'}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36]"
              >
                <option value="candidate">Artist / Performer</option>
                <option value="recruiter">Studio / Production House</option>
                <option value="operations">Operations Staff</option>
                <option value="admin">Platform Administrator</option>
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

      {/* Provision User Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Provision New User Account"
        >
          <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Legal Name</label>
              <input
                type="text"
                value={createForm.fullName}
                onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
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
                placeholder="user@example.com"
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
              <label className="font-bold text-slate-700 block mb-1">Assigned Role</label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#FA5A36]"
              >
                <option value="candidate">Artist / Talent</option>
                <option value="recruiter">Production Studio</option>
                <option value="operations">Operations Staff</option>
                <option value="admin">Administrator</option>
              </select>
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
                Provision Account
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && deleteTarget && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Account Deletion"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Permanent Deletion Warning</p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Are you sure you want to permanently delete account <strong>{deleteTarget.email}</strong>? This action cannot be reversed.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;
