import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import SupportTicketCard from '../../components/support/SupportTicketCard';
import CreateTicketModal from '../../components/support/CreateTicketModal';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const CandidateSupportPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activeStatus, setActiveStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = supportService.getCategories('candidate');

  const fetchTickets = async () => {
    try {
      const data = await supportService.getTickets({
        role: 'candidate',
        userId: user?.id,
        status: activeStatus,
        search: searchQuery,
        category: selectedCategory,
      });
      setTickets(data.results || []);
    } catch (err) {
      console.warn('Error loading support tickets:', err);
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

  const handleTicketCreated = (newTicket) => {
    fetchTickets();
  };

  const unreadCount = tickets.filter((t) => t.unreadForUser).length;

  return (
    <PageContainer maxWidth="7xl" className="space-y-8 text-left pb-16">
      {/* 1. TOP HEADER & HERO BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-brand-pink text-[11px] font-bold border border-pink-100">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Performer Support Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-brand-navy tracking-tight">
            Help &amp; Support Hub
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl">
            Have questions about your applications, auditions, or account verification? Our Operation Team is here to help.
          </p>
        </div>

        {/* Contact Support Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-brand-pink hover:bg-rose-700 active:scale-95 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Contact Operation Team</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CHIPS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Total Tickets
          </span>
          <p className="text-xl font-bold text-brand-navy">{tickets.length}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Awaiting Team
          </span>
          <p className="text-xl font-bold text-blue-600">
            {tickets.filter((t) => t.status === 'open').length}
          </p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
            Unread Replies
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

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white rounded-2xl border border-brand-border p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Tickets' },
              { id: 'open', label: 'Open' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'waiting_user', label: 'Waiting for Reply' },
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
        <LoadingSpinner message="Loading your support tickets..." />
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-border p-12 text-center shadow-card space-y-4">
          <div className="w-16 h-16 bg-pink-50 text-brand-pink rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <LifeBuoy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-bold font-serif text-brand-navy">
              You haven't contacted our support team yet.
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              If you experience any issues with auditions, application statuses, profile badges, or platform features, let us know and we'll resolve it quickly.
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
              linkPrefix="/candidate/support"
            />
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </PageContainer>
  );
};

export default CandidateSupportPage;
