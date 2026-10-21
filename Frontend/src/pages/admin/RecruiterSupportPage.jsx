import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SupportTicketCard from '../../components/support/SupportTicketCard';
import CreateTicketModal from '../../components/support/CreateTicketModal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const RecruiterSupportPage = () => {
  const { user, role } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = supportService.getCategories('recruiter');

  const fetchTickets = async () => {
    try {
      const data = await supportService.getTickets({
        role: 'recruiter',
        userId: user?.id,
        status: activeStatus,
        search: searchQuery,
        category: selectedCategory,
      });
      setTickets(data.results || []);
    } catch (err) {
      console.warn('Error fetching recruiter tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user?.id, activeStatus, searchQuery, selectedCategory]);

  useEffect(() => {
    const handleUpdate = () => fetchTickets();
    window.addEventListener('starcast_support_updated', handleUpdate);
    return () => window.removeEventListener('starcast_support_updated', handleUpdate);
  }, []);

  const unreadCount = tickets.filter((t) => t.unreadForUser).length;

  return (
    <PageContainer maxWidth="7xl" className="space-y-8 text-left pb-16">
      {/* 1. TOP HEADER & HERO BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-brand-navy text-[11px] font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-brand-pink" />
            <span>Studio &amp; Recruiter Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
            Production Help &amp; Support Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
            Priority technical and operational assistance for casting calls, candidate ranking, Juspay invoice reconciliation, and verified partner studio accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/admin/operations/support"
            className="px-4 py-2.5 rounded-2xl border border-gray-300 hover:border-gray-900 text-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-brand-pink" />
            <span>Unified Staff Inbox</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-brand-pink hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Contact Operation Team</span>
          </button>
        </div>
      </div>

      {/* 2. RECRUITER SUPPORT METRICS CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Studio Tickets
          </span>
          <p className="text-xl font-bold text-brand-navy">{tickets.length}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Awaiting Operations
          </span>
          <p className="text-xl font-bold text-blue-600">
            {tickets.filter((t) => t.status === 'open').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Unread Responses
          </span>
          <p className="text-xl font-bold text-brand-pink">{unreadCount}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Resolved Issues
          </span>
          <p className="text-xl font-bold text-emerald-600">
            {tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}
          </p>
        </div>
      </div>

      {/* 3. TOOLBAR: FILTERS & SEARCH */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Tickets' },
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'waiting_user', label: 'Waiting for User' },
              { id: 'resolved', label: 'Resolved' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeStatus === tab.id
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & Category Select */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket # or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-brand-pink focus:bg-white transition-all"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-brand-navy focus:outline-none focus:border-brand-pink cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. TICKETS LIST */}
      {loading ? (
        <LoadingSpinner message="Loading studio support inquiries..." />
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 bg-pink-50 text-brand-pink rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold font-serif text-brand-navy">
              You haven't contacted our support team yet.
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Need assistance with listing payments, casting call approvals, candidate ranking models, or studio profile verification? Submit a ticket anytime.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-brand-pink hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tickets.map((ticket) => (
            <SupportTicketCard
              key={ticket.id || ticket.ticketNumber}
              ticket={ticket}
              linkPrefix="/admin/support"
            />
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={() => fetchTickets()}
      />
    </PageContainer>
  );
};

export default RecruiterSupportPage;
