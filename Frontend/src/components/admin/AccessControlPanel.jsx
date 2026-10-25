import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  UserCheck,
  RotateCcw,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Eye,
  Sliders,
  Database,
  Fingerprint,
  ArrowUpRight,
} from 'lucide-react';
import { authService, DEFAULT_ROLE_PERMISSIONS } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Toast from '../common/Toast';

const PERMISSION_CATEGORIES = [
  {
    name: 'Opportunities & Casting',
    prefix: 'opportunity:',
    permissions: [
      { key: 'opportunity:view', label: 'View Opportunities' },
      { key: 'opportunity:create', label: 'Create Opportunities' },
      { key: 'opportunity:update', label: 'Update Opportunities' },
      { key: 'opportunity:delete', label: 'Delete Opportunities' },
      { key: 'opportunity:publish', label: 'Publish / Live Toggle' },
      { key: 'opportunity:feature', label: 'Feature Opportunities' },
    ],
  },
  {
    name: 'Applications & Submissions',
    prefix: 'application:',
    permissions: [
      { key: 'application:view_all', label: 'View All Submissions' },
      { key: 'application:view_own', label: 'View Own Submissions' },
      { key: 'application:create', label: 'Apply / Submit Auditions' },
      { key: 'application:update_status', label: 'Update Application Status' },
      { key: 'application:withdraw', label: 'Withdraw Application' },
      { key: 'application:schedule_audition', label: 'Invite to Audition' },
    ],
  },
  {
    name: 'Talent Profiles & Verification',
    prefix: 'profile:',
    permissions: [
      { key: 'profile:view', label: 'View Published Talent' },
      { key: 'profile:view_own', label: 'View Own Draft Profile' },
      { key: 'profile:update_own', label: 'Update Own Profile' },
      { key: 'profile:update_any', label: 'Edit Any Member Profile' },
      { key: 'profile:delete_any', label: 'Delete Member Profile' },
      { key: 'profile:verify', label: 'Verify Talent Accreditation' },
    ],
  },
  {
    name: 'Platform Support & Help Desk',
    prefix: 'support:',
    permissions: [
      { key: 'support:create', label: 'File Support Ticket' },
      { key: 'support:view_own', label: 'View Own Tickets' },
      { key: 'support:view_all', label: 'View All Studio Tickets' },
      { key: 'support:manage', label: 'Assign & Manage Tickets' },
      { key: 'support:respond', label: 'Dispatch Official Replies' },
    ],
  },
  {
    name: 'Role-Based Access Control',
    prefix: 'role:',
    permissions: [
      { key: 'role:view', label: 'View Role Permissions' },
      { key: 'role:create', label: 'Define New System Roles' },
      { key: 'role:update', label: 'Modify Role Permissions' },
      { key: 'role:delete', label: 'Delete System Roles' },
      { key: 'role:assign', label: 'Assign & Reassign User Roles' },
    ],
  },
  {
    name: 'Security Audit & Compliance',
    prefix: 'audit:',
    permissions: [
      { key: 'audit:view', label: 'Inspect Security Audit Logs' },
      { key: 'audit:export', label: 'Export Immutable Log Dumps' },
    ],
  },
  {
    name: 'Administration & Governance',
    prefix: 'admin:',
    permissions: [
      { key: 'admin:access', label: 'Admin Suite Access' },
      { key: 'superadmin:access', label: 'Super Admin Root Clearance' },
    ],
  },
];

const AccessControlPanel = () => {
  const { user, isSuperAdmin, hasPermission, refreshPermissions } = useAuth();

  const [panelSection, setPanelSection] = useState('matrix'); // 'matrix' | 'assign' | 'audit'
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('admin');
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  // User management state
  const [manageUserId, setManageUserId] = useState('');
  const [manageTargetRole, setManageTargetRole] = useState('recruiter');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditActionFilter, setAuditActionFilter] = useState('');
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditTotalEvents, setAuditTotalEvents] = useState(0);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const canModifyRoles = isSuperAdmin || hasPermission('role:update');
  const canAssignRoles = isSuperAdmin || hasPermission('role:assign');
  const canInspectAudit = isSuperAdmin || hasPermission('audit:view');

  // Load roles list
  const loadRoles = useCallback(async () => {
    try {
      const fetchedRoles = await authService.fetchRoles();
      setRoles(fetchedRoles);
      const active = fetchedRoles.find((r) => r.name === selectedRole) || fetchedRoles[0];
      if (active) {
        setSelectedRole(active.name);
        setRolePermissions(active.permissions || []);
      }
    } catch (err) {
      console.warn('Could not load roles:', err);
      // Fallback from DEFAULT_ROLE_PERMISSIONS
      const fallbackRoles = Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([name, perms]) => ({
        name,
        permissions: perms,
      }));
      setRoles(fallbackRoles);
      setRolePermissions(DEFAULT_ROLE_PERMISSIONS[selectedRole] || []);
    }
  }, [selectedRole]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // Load audit logs
  const loadAuditLogs = useCallback(async (page = 1, action = auditActionFilter) => {
    if (!canInspectAudit) return;
    setAuditLoading(true);
    try {
      const data = await authService.fetchAuditLogs({
        page,
        page_size: 15,
        action: action || undefined,
      });
      setAuditLogs(data.logs || []);
      setAuditTotalPages(data.total_pages || 1);
      setAuditTotalEvents(data.total || 0);
      setAuditPage(data.page || 1);
    } catch (err) {
      console.warn('Error fetching audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditActionFilter, canInspectAudit]);

  useEffect(() => {
    if (panelSection === 'audit') {
      loadAuditLogs(1, auditActionFilter);
    }
  }, [panelSection, auditActionFilter, loadAuditLogs]);

  // Handle role selection
  const handleSelectRole = (roleName) => {
    setSelectedRole(roleName);
    const found = roles.find((r) => r.name === roleName);
    if (found) {
      setRolePermissions(found.permissions || []);
    } else {
      setRolePermissions(DEFAULT_ROLE_PERMISSIONS[roleName] || []);
    }
  };

  // Toggle permission checkbox
  const togglePermission = (permKey) => {
    if (!canModifyRoles) {
      setToastMsg('Permission Denied: Only Super Administrators can alter granular role permissions.');
      setToastType('error');
      return;
    }
    if (selectedRole === 'super_admin' && permKey === 'superadmin:access') {
      setToastMsg('Cannot revoke root Super Admin clearance from super_admin role.');
      setToastType('error');
      return;
    }
    setRolePermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  // Save role permissions
  const handleSavePermissions = async () => {
    if (!canModifyRoles) return;
    setIsSavingPermissions(true);
    try {
      await authService.updateRolePermissions(selectedRole, rolePermissions);
      setToastMsg(`Permissions for role "${selectedRole}" updated and recorded to immutable audit log!`);
      setToastType('success');
      await refreshPermissions();
      await loadRoles();
    } catch (err) {
      setToastMsg(err.message || 'Failed to update permissions.');
      setToastType('error');
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Submit User Role Assignment
  const handleAssignRole = async (e) => {
    e.preventDefault();
    if (!manageUserId.trim()) {
      setToastMsg('Please enter a valid User ID or Email address.');
      setToastType('error');
      return;
    }
    setIsSubmittingRole(true);
    try {
      const res = await authService.manageUserRole(manageUserId.trim(), manageTargetRole);
      setToastMsg(`User ${res.user?.id || manageUserId} re-assigned to "${manageTargetRole}" successfully!`);
      setToastType('success');
      setManageUserId('');
      if (canInspectAudit) {
        loadAuditLogs(1);
      }
    } catch (err) {
      setToastMsg(err.message || 'Role assignment failed. Privilege escalation protection engaged.');
      setToastType('error');
    } finally {
      setIsSubmittingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Security Context */}
      <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-3d-floating relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-pink/20 text-brand-pink border border-brand-pink/30 text-[10px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3 h-3" />
              <span>RBAC Policy: Least Privilege</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
              <Lock className="w-3 h-3" />
              <span>Deny by Default</span>
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif tracking-tight">
            Role-Based Access Control & Governance
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Multi-tiered authorization with granular permissions, IDOR defense guards, privilege escalation shields, and immutable security audit logging.
          </p>
        </div>

        <div className="shrink-0 z-10 flex sm:flex-col items-end gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">Current Actor Clearance</span>
          <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/20 capitalize flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-brand-pink" />
            <span>{user?.role?.replace('_', ' ') || 'Guest'}</span>
          </span>
        </div>

        {/* Ambient glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-pink/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Sub-Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl border border-gray-200">
        <button
          type="button"
          onClick={() => setPanelSection('matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            panelSection === 'matrix'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Role Permissions Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setPanelSection('assign')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            panelSection === 'assign'
              ? 'bg-black text-white shadow-xs'
              : 'text-gray-600 hover:text-black hover:bg-white/70'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>User Role Assignment</span>
        </button>

        {canInspectAudit && (
          <button
            type="button"
            onClick={() => setPanelSection('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              panelSection === 'audit'
                ? 'bg-black text-white shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-white/70'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Security Audit Logs</span>
            {auditTotalEvents > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-brand-pink text-white text-[10px]">
                {auditTotalEvents}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Section 1: Role Permissions Matrix */}
      {panelSection === 'matrix' && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-6">
          {/* Role selector tabs */}
          <div className="border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold font-serif text-brand-navy">
                  Select System Role to Inspect / Configure
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Granular action permissions are enforced on every backend API endpoint and frontend route guard.
                </p>
              </div>

              {canModifyRoles && (
                <Button
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions}
                  className="shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1" />
                  <span>{isSavingPermissions ? 'Committing Changes...' : 'Save Role Permissions'}</span>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['super_admin', 'admin', 'operations', 'recruiter', 'candidate', 'user'].map((rName) => {
                const isSelected = selectedRole === rName;
                return (
                  <button
                    key={rName}
                    type="button"
                    onClick={() => handleSelectRole(rName)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rName.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {!canModifyRoles && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Mode:</strong> Only Super Administrators can alter permissions for roles. Changes made by Super Admin persist dynamically in MongoDB.
              </span>
            </div>
          )}

          {/* Granular Permissions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PERMISSION_CATEGORIES.map((cat) => (
              <div key={cat.name} className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200/60">
                  <h4 className="text-xs font-bold text-brand-navy tracking-tight uppercase">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono">{cat.prefix}*</span>
                </div>

                <div className="space-y-2">
                  {cat.permissions.map((p) => {
                    const isChecked = rolePermissions.includes(p.key);
                    return (
                      <label
                        key={p.key}
                        className={`flex items-start gap-3 p-2 rounded-xl transition-all ${
                          canModifyRoles ? 'cursor-pointer hover:bg-white' : 'cursor-default'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={!canModifyRoles}
                          onChange={() => togglePermission(p.key)}
                          className="mt-0.5 w-4 h-4 accent-black rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 leading-tight">
                            {p.label}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">
                            {p.key}
                          </p>
                        </div>
                        {isChecked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0 mt-0.5" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: User Role Assignment */}
      {panelSection === 'assign' && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-base font-bold font-serif text-brand-navy">
              Assign & Manage Member Roles
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Securely elevate or adjust access privileges across candidate, recruiter, operations, or administrator accounts.
            </p>
          </div>

          <form onSubmit={handleAssignRole} className="space-y-5 max-w-xl">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
              <p className="font-bold text-brand-navy flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-pink" />
                <span>Privilege Escalation Defense Rules</span>
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-gray-600">
                <li>Actors cannot assign a role equal to or higher than their own clearance level.</li>
                <li>Self-modification of administrative roles is blocked to prevent accidental lockout.</li>
                <li>Root Super Administrator (<code>superadmin-1</code>) cannot be demoted or revoked.</li>
                <li>Every assignment is logged immutably with actor, IP, timestamp, and previous role state.</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Target User ID or Email
              </label>
              <input
                type="text"
                placeholder="e.g. user@stagelink.com or usr-12345678"
                value={manageUserId}
                onChange={(e) => setManageUserId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-black focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Assign New Role
              </label>
              <select
                value={manageTargetRole}
                onChange={(e) => setManageTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-black focus:outline-none capitalize"
              >
                {isSuperAdmin && <option value="super_admin">Super Admin (Root Clearance)</option>}
                <option value="admin">Admin (Studio Suite Administrator)</option>
                <option value="operations">Operations (Help Desk & Verification)</option>
                <option value="recruiter">Recruiter (Casting Director)</option>
                <option value="candidate">Candidate / Talent</option>
                <option value="user">Standard User</option>
              </select>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button type="submit" disabled={isSubmittingRole || !canAssignRoles}>
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                <span>{isSubmittingRole ? 'Reassigning Role...' : 'Execute Role Reassignment'}</span>
              </Button>
            </div>
          </form>

          {/* Quick Test Accounts */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 mb-2">
              Quick Test Fill (Click to populate target):
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Jordan Lee (User)', email: 'user@stagelink.com' },
                { label: 'Aanya (Candidate)', email: 'aanya@stagelink.com' },
                { label: 'Marcus (Recruiter)', email: 'recruiter@stagelink.com' },
                { label: 'Sarah (Ops Desk)', email: 'ops@stagelink.com' },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setManageUserId(acc.email)}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-medium text-slate-700"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Security Audit Log Explorer */}
      {panelSection === 'audit' && canInspectAudit && (
        <div className="bg-white rounded-3xl border border-brand-border p-6 shadow-card space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold font-serif text-brand-navy flex items-center gap-2">
                <span>Security & Authorization Audit Stream</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Live
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Immutable, append-only security events recording privilege elevation, IDOR blocks, and resource mutations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-black focus:outline-none"
              >
                <option value="">All Security Events</option>
                <option value="PRIVILEGE_ESCALATION_BLOCKED">Privilege Escalation Blocked</option>
                <option value="IDOR_ATTEMPT_BLOCKED">IDOR Attempt Blocked</option>
                <option value="PERMISSION_DENIED">Permission Denied</option>
                <option value="ROLE_ASSIGNED">Role Assigned</option>
                <option value="ROLE_PERMISSION_UPDATED">Role Permission Updated</option>
                <option value="APPLICATION_STATUS_UPDATED">Application Status Updated</option>
                <option value="APPLICATION_WITHDRAWN">Application Withdrawn</option>
                <option value="OPPORTUNITY_CREATED">Opportunity Created</option>
                <option value="OPPORTUNITY_UPDATED">Opportunity Updated</option>
                <option value="OPPORTUNITY_DELETED">Opportunity Deleted</option>
              </select>

              <button
                type="button"
                onClick={() => loadAuditLogs(auditPage, auditActionFilter)}
                disabled={auditLoading}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs transition-colors"
                title="Refresh Audit Logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Audit Table */}
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No audit log entries matching criteria found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action Event</th>
                    <th className="py-2.5 px-3">Actor Clearance</th>
                    <th className="py-2.5 px-3">Target Resource</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => {
                    const isDenied = log.status === 'DENIED' || log.status === 'BLOCKED' || log.action?.includes('BLOCKED');
                    const isSuccess = log.status === 'SUCCESS';
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              isDenied
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600">
                          <span className="font-medium text-slate-800">{log.actor_role || 'user'}</span>
                          <span className="text-[10px] font-mono text-gray-400 block">
                            {log.actor_id || 'anonymous'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600 font-mono text-[11px]">
                          {log.resource_type ? `${log.resource_type}:${log.resource_id || '*'}` : 'api'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDenied
                                ? 'bg-red-100 text-red-800'
                                : isSuccess
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {isDenied ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                            <span>{log.status || 'LOGGED'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLogDetail(log)}
                            className="px-2.5 py-1 rounded-lg border border-gray-200 hover:border-black text-[11px] font-bold text-brand-navy"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {auditTotalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
              <span className="text-gray-500">
                Page {auditPage} of {auditTotalPages} ({auditTotalEvents} total events)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={auditPage <= 1}
                  onClick={() => loadAuditLogs(auditPage - 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 text-xs font-bold"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={auditPage >= auditTotalPages}
                  onClick={() => loadAuditLogs(auditPage + 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 text-xs font-bold"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Audit Log Modal Inspector */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-3d-floating space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-pink" />
                <h4 className="font-bold font-serif text-brand-navy">
                  Security Audit Event Details
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="text-gray-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl font-mono text-[11px]">
                <div>
                  <span className="text-gray-400 block">Event ID</span>
                  <span className="font-semibold text-slate-800">{selectedLogDetail.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Timestamp</span>
                  <span className="font-semibold text-slate-800">{selectedLogDetail.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Action</span>
                  <span className="font-semibold text-slate-800">{selectedLogDetail.action}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Status</span>
                  <span className="font-semibold text-slate-800">{selectedLogDetail.status}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Actor ID</span>
                  <span className="font-semibold text-slate-800">{selectedLogDetail.actor_id || 'anonymous'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Actor Role</span>
                  <span className="font-semibold text-slate-800">{selectedLogDetail.actor_role}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-brand-navy block mb-1">
                  Immutable Event Payload / Metadata:
                </span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[11px] font-mono">
                  {JSON.stringify(selectedLogDetail.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg('')} />
    </div>
  );
};

export default AccessControlPanel;
