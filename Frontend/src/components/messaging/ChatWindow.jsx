import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Flag,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';

const ChatWindow = ({
  conversation,
  onSendMessage,
  onBackMobile,
  onToggleSidebar,
  isSidebarOpen,
  onOpenReport,
}) => {
  const { user, role } = useAuth();
  const isCandidate = (role === 'candidate' || user?.role === 'candidate');
  const isStaff = !isCandidate;
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when conversation or messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.id, conversation?.messages?.length]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50 text-center space-y-3 h-full">
        <div className="w-14 h-14 rounded-3xl bg-gray-200/60 flex items-center justify-center text-gray-400">
          <MessageSquare className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold font-serif text-brand-navy">
          Select a Conversation
        </h3>
        <p className="text-xs text-brand-text-secondary max-w-sm">
          Choose a casting director or production team from the list to view audition messages, share self-tapes, and coordinate callbacks.
        </p>
      </div>
    );
  }

  const { participant, opportunity, messages = [] } = conversation;

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative min-w-0">
      {/* 1. CONVERSATION HEADER */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 bg-white z-10 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          {/* Mobile Back Button */}
          {onBackMobile && (
            <button
              type="button"
              onClick={onBackMobile}
              className="md:hidden p-1.5 -ml-1 text-gray-500 hover:text-black rounded-lg transition-colors"
              aria-label="Back to conversations list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Participant Avatar */}
          <div className="relative shrink-0">
            <img
              src={participant?.avatar}
              alt={participant?.name}
              className="w-10 h-10 rounded-xl object-cover border border-gray-200"
            />
            {participant?.verified && (
              <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full ring-2 ring-white">
                <ShieldCheck className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          {/* Participant Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-brand-navy truncate">
                {participant?.name}
              </h3>
              {participant?.verified && (
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Verified Studio
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 truncate">
              {participant?.organization} • {participant?.role}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Report Button */}
          <button
            type="button"
            onClick={onOpenReport}
            className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
            title="Report this conversation"
            aria-label="Report conversation"
          >
            <Flag className="w-4 h-4" />
          </button>

          {/* Toggle Related Opportunity Sidebar (Desktop/Tablet) */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`p-2 rounded-xl transition-colors ${
                isSidebarOpen
                  ? 'bg-gray-100 text-brand-navy'
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
              }`}
              title={isSidebarOpen ? 'Hide related opportunity sidebar' : 'Show related opportunity details'}
              aria-label="Toggle details sidebar"
            >
              {isSidebarOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. RELATED OPPORTUNITY QUICK BANNER OR OPERATIONS DESK BANNER */}
      {isCandidate && (conversation.isOperationsTeam || conversation.id === 'conv-ops') ? (
        <div className="px-4 py-2 bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white flex items-center justify-between gap-3 text-xs shrink-0 border-b border-emerald-900/40">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold text-white shrink-0">
              StageLink Operations Desk:
            </span>
            <span className="hidden sm:inline text-gray-300 truncate">
              Direct text channel for profile verification, audition queries, shoot schedules & payouts.
            </span>
          </div>

          <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-700/60 shrink-0">
            🟢 Online Now
          </span>
        </div>
      ) : opportunity ? (
        <div className="px-4 py-2 bg-neutral-900 text-white flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="px-1.5 py-0.5 rounded-md bg-white text-black text-[10px] font-bold shrink-0">
              Casting Link
            </span>
            <span className="font-bold truncate text-white">
              {opportunity.title}
            </span>
            <span className="hidden sm:inline text-neutral-400 truncate">
              — Role: <span className="text-emerald-400 font-semibold">{opportunity.role}</span>
            </span>
          </div>

          <Link
            to={`/opportunities/${opportunity.id}`}
            className="text-[11px] font-bold text-white hover:text-emerald-300 flex items-center gap-1 shrink-0 hover:underline"
          >
            <span>View Opportunity</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      ) : null}

      {/* 3. MESSAGE FEED */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50/40">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Casting Liaison Disclaimer */}
          <div className="text-center py-2">
            <span className="px-3 py-1 rounded-full bg-gray-200/70 text-gray-500 text-[10px] font-semibold">
              🔒 StageLink Verified Thread • Safe Talent Communication
            </span>
          </div>

          {/* Feed Bubbles */}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              participantName={participant?.name}
            />
          ))}

          {/* Anchor for auto scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 4. COMPOSER AT BOTTOM */}
      <div className="shrink-0">
        <MessageComposer
          onSendMessage={onSendMessage}
          isOperationsTeam={Boolean(conversation.isOperationsTeam || conversation.id === 'conv-ops')}
          isStaff={isStaff}
          participantName={participant?.name}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
