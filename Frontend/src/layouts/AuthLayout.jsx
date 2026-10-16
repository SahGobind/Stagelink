import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafc]">
      <PublicNavbar />
      <main className="flex-1 py-6 sm:py-10">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default AuthLayout;

