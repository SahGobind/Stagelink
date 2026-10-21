import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Paperclip, Clock, Calendar } from 'lucide-react';
import SupportStatusBadge from './SupportStatusBadge';
import SupportPriorityBadge from './SupportPriorityBadge';
import { formatDate } from '../../utils/formatters';

const SupportTicketCard = ({ ticket, linkPrefix = '/candidate/support' }) => {
  if (!ticket) return null;

  const ticketId = ticket.ticketNumber || ticket.id;
  const isUnread = Boolean(ticket.unreadForUser);
  const messageCount = ticket.messages?.length || 1;

  // Format date helper
  const dateDisplay = ticket.lastReplyAt
    ? formatDate(ticket.lastReplyAt)
    : ticket.createdAt
    ? formatDate(ticket.createdAt)
    : 'Recent';

  return (
    <Link
      to={`${linkPrefix}/${ticket.id || ticket.ticketNumber}`}
      className={`block p-5 bg-white rounded-2xl border transition-all duration-200 group text-left relative hover:shadow-card ${
        isUnread
          ? 'border-pink-300 ring-2 ring-pink-50 hover:border-brand-pink shadow-2xs'
          : 'border-brand-border hover:border-gray-300'
      }`}
    >
      {/* Unread Indicator Ribbon */}
      {isUnread && (
        <span className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-brand-pink border border-pink-200">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-pink animate-pulse" />
          <span>New Reply from Team</span>
        </span>
      )}

      <div className="space-y-3">
        {/* Top Header: ID, Category, Priority, Status */}
        <div className="flex flex-wrap items-center gap-2 pr-28">
          <span className="text-xs font-mono font-bold text-brand-navy bg-gray-100 px-2.5 py-1 rounded-lg">
            {ticketId}
          </span>
          <span className="text-xs text-gray-500 font-medium px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100">
            {ticket.category}
          </span>
          <SupportPriorityBadge priority={ticket.priority} size="xs" />
          <SupportStatusBadge status={ticket.status} size="xs" />
        </div>

        {/* Subject */}
        <div>
          <h3 className="text-sm sm:text-base font-bold text-brand-navy group-hover:text-brand-pink transition-colors line-clamp-1">
            {ticket.subject}
          </h3>
          {ticket.messages && ticket.messages.length > 0 && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
              {ticket.messages[ticket.messages.length - 1].content}
            </p>
          )}
        </div>

        {/* Bottom Metadata: Last reply time, sender, conversation length */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>
                Last reply: <strong className="text-gray-700 font-semibold">{dateDisplay}</strong>
              </span>
            </span>

            {ticket.lastReplyBy && (
              <span className="hidden sm:inline-flex items-center gap-1">
                <span>by</span>
                <strong className="text-gray-700 font-semibold">{ticket.lastReplyBy}</strong>
              </span>
            )}

            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              <span>{messageCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-brand-pink group-hover:translate-x-0.5 transition-transform">
            <span>Open Conversation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SupportTicketCard;
