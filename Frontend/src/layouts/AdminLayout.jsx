import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import DashboardHeader from '../components/layout/DashboardHeader';
import MobileBottomNav from '../components/layout/MobileBottomNav';
import { useAuth } from '../context/AuthContext';

import ErrorBoundary from '../components/common/ErrorBoundary';

const AdminLayout = () => {
  const { user, role } = useAuth();
  const isSuper = user?.role === 'super_admin' || role === 'super_admin';
  const isOps = !isSuper && (user?.role === 'operations' || role === 'operations');

  const headerTitle = isSuper
    ? 'StageLink Governance Suite'
    : isOps
    ? 'StageLink Operations Desk'
    : role === 'recruiter'
    ? 'StageLink Studio Suite'
    : 'StageLink Studio Admin';

  const headerSubtitle = isSuper
    ? 'System Governance, Granular RBAC Permissions & Security Audit Stream'
    : isOps
    ? 'Support Tickets, Talent Verification & Member Assistance'
    : role === 'recruiter'
    ? 'Casting Calls, Talent Discovery & Audition Management'
    : 'Talent, Casting Calls & Application Management';

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar role={isOps ? 'operations' : role} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <DashboardHeader title={headerTitle} subtitle={headerSubtitle} />
        <main className="flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default AdminLayout;
