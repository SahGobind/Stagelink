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
  const isRecruiter = !isSuper && !isOps && (user?.role === 'recruiter' || role === 'recruiter');

  const headerTitle = isSuper
    ? 'StageLink Administration'
    : isOps
    ? 'Operations Command'
    : isRecruiter
    ? 'Production Studio Suite'
    : 'Platform Administration';

  const headerSubtitle = isSuper
    ? 'System telemetry, platform governance, and international operations.'
    : isOps
    ? 'Talent verification, member support, and listing moderation.'
    : isRecruiter
    ? 'Casting calls, submissions, and talent discovery.'
    : 'Platform overview, casting operations, and user management.';

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <DashboardSidebar role={isOps ? 'operations' : isRecruiter ? 'recruiter' : 'admin'} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <DashboardHeader title={headerTitle} subtitle={headerSubtitle} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
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
