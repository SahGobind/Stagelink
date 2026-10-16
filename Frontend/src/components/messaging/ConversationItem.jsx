import React from 'react';
import { ShieldCheck } from 'lucide-react';

const ConversationItem = ({ conversation, active, onClick }) => {
  if (!conversation) return null;

  const { participant, opportunity, lastMessage, lastMessageTime, unreadCount } = conversation;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start space-x-3 p-3.5 rounded-2xl text-left transition-all duration-150 ${
        active
          ? 'bg-black text-white shadow-sm ring-1 ring-black'
          : 'hover:bg-gray-50 border border-transparent text-brand-navy'
      }`}
    >
      {/* Avatar or Company Initials */}
      <div className="relative shrink-0">
        {participant?.avatar ? (
          <img
            src={participant.avatar}
            alt={participant.name}
            className={`w-11 h-11 rounded-xl object-cover border ${
              active ? 'border-neutral-700' : 'border-gray-200'
            }`}
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs ${
              active ? 'bg-neutral-800 text-white' : 'bg-gray-100 text-brand-navy'
            }`}
          >
            {participant?.initials || participant?.name?.substring(0, 2).toUpperCase() || 'CD'}
          </div>
        )}

        {unreadCount > 0 && !active && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-navy text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 truncate">
            <h4
              className={`text-xs font-bold truncate ${
                active ? 'text-white' : 'text-brand-navy'
              }`}
            >
              {participant?.name}
            </h4>
            {participant?.verified && (
              <ShieldCheck
                className={`w-3.5 h-3.5 shrink-0 ${
                  active ? 'text-emerald-400' : 'text-emerald-600'
                }`}
                title="Verified Casting Director"
              />
            )}
          </div>
          <span
            className={`text-[10px] shrink-0 font-medium ${
              active ? 'text-neutral-400' : 'text-gray-400'
            }`}
          >
            {lastMessageTime}
          </span>
        </div>

        {/* Production Company / Role */}
        <p
          className={`text-[11px] font-semibold truncate mt-0.5 ${
            active ? 'text-neutral-300' : 'text-gray-500'
          }`}
        >
          {participant?.organization || participant?.role}
        </p>

        {/* Opportunity Pill if present */}
        {opportunity?.title && (
          <p
            className={`text-[10px] truncate mt-0.5 font-medium ${
              active ? 'text-emerald-400' : 'text-brand-navy/70'
            }`}
          >
            🎬 {opportunity.title}
          </p>
        )}

        {/* Message Preview */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p
            className={`text-xs truncate ${
              unreadCount > 0 && !active
                ? 'font-bold text-brand-navy'
                : active
                ? 'text-neutral-300'
                : 'text-brand-text-secondary'
            }`}
          >
            {lastMessage}
          </p>

          {unreadCount > 0 && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                active
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationItem;
