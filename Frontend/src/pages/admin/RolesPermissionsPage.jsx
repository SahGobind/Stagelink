import React from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import AccessControlPanel from '../../components/admin/AccessControlPanel';

const RolesPermissionsPage = () => {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Roles & Permissions (RBAC)</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure system authorization levels, granular role permissions, and administrative role assignments.
        </p>
      </div>
      <AccessControlPanel initialSection="matrix" />
    </div>
  );
};

export default RolesPermissionsPage;

