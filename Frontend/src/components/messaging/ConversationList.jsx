import React, { useState, useMemo } from 'react';
import { Search, X, MessageSquare, Inbox } from 'lucide-react';
import ConversationItem from './ConversationItem';

const ConversationList = ({
  conversations = [],
  activeId,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'archived'

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // 1. Tab filter
      if (activeFilter === 'unread' && (!conv.unreadCount || conv.unreadCount <= 0)) {
        return false;
      }
      if (activeFilter === 'archived' && !conv.isArchived) {
        return false;
      }
      if (activeFilter !== 'archived' && conv.isArchived) {
        return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = conv.participant?.name?.toLowerCase().includes(query);
        const orgMatch = conv.participant?.organization?.toLowerCase().includes(query);
        const roleMatch = conv.participant?.role?.toLowerCase().includes(query);
        const oppMatch = conv.opportunity?.title?.toLowerCase().includes(query);
        const messageMatch = conv.lastMessage?.toLowerCase().includes(query);

        return nameMatch || orgMatch || roleMatch || oppMatch || messageMatch;
      }

      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  // Counts for tabs
  const allCount = conversations.filter((c) => !c.isArchived).length;
  const unreadCount = conversations.filter(
    (c) => !c.isArchived && c.unreadCount > 0
  ).length;
  const archivedCount = conversations.filter((c) => c.isArchived).length;

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col h-full bg-white select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-navy" />
            <h2 className="text-base font-bold text-brand-navy font-serif">
              Casting Messages
            </h2>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-brand-navy">
            {allCount} Active
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search directors, projects, messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 focus:border-black rounded-xl pl-9 pr-8 py-2 text-xs text-brand-navy placeholder-gray-400 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Button to Text Operations Team */}
        <button
          type="button"
          onClick={() => onSelect('conv-ops')}
          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
            activeId === 'conv-ops'
              ? 'bg-black text-white border-black shadow-xs'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/80'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Text Operations Team</span>
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              activeId === 'conv-ops' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Direct Help
          </span>
        </button>

        {/* Filter Pills (All / Unread / Archived) */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              activeFilter === 'unread'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('archived')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              activeFilter === 'archived'
                ? 'bg-white text-brand-navy shadow-xs font-bold'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-gray-50">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 space-y-2">
            <Inbox className="w-8 h-8 mx-auto stroke-[1.5] text-gray-300" />
            <p className="text-xs font-bold text-gray-500">
              No conversations found
            </p>
            <p className="text-[11px] text-gray-400 max-w-[200px] mx-auto">
              {searchQuery
                ? `No results matching "${searchQuery}".`
                : activeFilter === 'unread'
                ? 'You have caught up with all casting unread messages.'
                : 'No archived threads at this time.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-brand-navy hover:underline mt-2 inline-block"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div key={conv.id} className="pt-1 first:pt-0">
              <ConversationItem
                conversation={conv}
                active={conv.id === activeId}
                onClick={() => onSelect(conv.id)}
              />
            </div>
          ))
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 text-center">
        Verified Casting Messenger • Direct Studio Liaison
      </div>
    </div>
  );
};

export default ConversationList;
