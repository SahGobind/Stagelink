import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileCheck, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const { role } = useAuth();

  const candidateLinks = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Castings', path: '/opportunities', icon: Briefcase },
    { label: 'Auditions', path: '/candidate/applications', icon: FileCheck },
    { label: 'Messages', path: '/candidate/messages', icon: MessageSquare },
    { label: 'Profile', path: '/candidate/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Talent', path: '/admin/candidates', icon: User },
    { label: 'Castings', path: '/admin/opportunities', icon: Briefcase },
    { label: 'Auditions', path: '/admin/applications', icon: FileCheck },
    { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
  ];

  const links = role === 'admin' ? adminLinks : candidateLinks;

  return (
    <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-border px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? 'text-brand-pink font-bold' : 'text-brand-text-secondary hover:text-brand-navy'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
