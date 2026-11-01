import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  RotateCcw,
  Lock,
  Clock,
} from 'lucide-react';
import MessageBubble from '../../components/messaging/MessageBubble';
import MessageComposer from '../../components/messaging/MessageComposer';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  initialMockMessages,
  getStoredMessages,
  saveStoredMessages,
} from '../../data/mockMessages';

const OPS_CONVERSATION_ID = 'conv-ops';

const DEFAULT_OPS_CONVERSATION = initialMockMessages.find(
  (c) => c.id === OPS_CONVERSATION_ID
) || {
  id: OPS_CONVERSATION_ID,
  isOperationsTeam: true,
  participant: {
    id: 'ops-team',
    name: 'StageLink Operations Team',
    organization: 'StageLink HQ • Operations & Talent Support',
    role: 'Operations Desk',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    initials: 'OP',
    verified: true,
    badge: 'Official StageLink Operations',
  },
  opportunity: null,
  unreadCount: 0,
  isArchived: false,
  lastMessage: 'Hi! Welcome to StageLink. Text our operations team anytime with any questions about auditions, verification, or payouts.',
  lastMessageTime: 'Active now',
  sharedFiles: [
    {
      id: 'file-ops-guide',
      name: 'StageLink_Performer_Operations_Guide.pdf',
      size: '1.2 MB',
      date: 'Oct 15, 2026',
      type: 'pdf',
    },
  ],
  messages: [
    {
      id: 'm-ops-1',
      senderId: 'ops-team',
      senderName: 'StageLink Operations Team',
      text: 'Hello and welcome! Our Operations Team is here to help you navigate auditions, contract verification, shoot logistics, and banking or compensation queries.',
      timestamp: 'Today 9:00 AM',
      isOwn: false,
      readStatus: 'read',
    },
    {
      id: 'm-ops-2',
      senderId: 'ops-team',
      senderName: 'StageLink Operations Team',
      text: 'Feel free to text us directly using the message box below or click any quick topic prompt.',
      timestamp: 'Today 9:01 AM',
      isOwn: false,
      readStatus: 'read',
    },
  ],
};

const MessagesPage = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Initialize conversation directly with the Operations Team
  const [conversation, setConversation] = useState(() => {
    const all = getStoredMessages();
    const ops = all.find((c) => c.id === OPS_CONVERSATION_ID);
    return ops || DEFAULT_OPS_CONVERSATION;
  });

  const [toastMessage, setToastMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages?.length, isTyping]);

  // Handle sending message directly to operations team
  const handleSendMessage = ({ text, attachment }) => {
    if (!text && !attachment) return;

    const senderName = user?.fullName || 'Candidate Artist';
    const senderId = user?.id || 'cand-current';

    const newMessage = {
      id: `m-${Date.now()}`,
      senderId,
      senderName,
      text: text || '',
      timestamp: 'Just now',
      isOwn: true,
      readStatus: 'read',
      ...(attachment
        ? {
            attachment: {
              name: attachment.name,
              size: attachment.size,
              type: attachment.type,
            },
          }
        : {}),
    };

    const updatedSharedFiles = attachment
      ? [
          {
            id: `file-${Date.now()}`,
            name: attachment.name,
            size: attachment.size,
            date: 'Just now',
            type: attachment.type,
          },
          ...(conversation.sharedFiles || []),
        ]
      : conversation.sharedFiles || [];

    const updatedConv = {
      ...conversation,
      lastMessage: text || `Sent attachment: ${attachment?.name}`,
      lastMessageTime: 'Just now',
      sharedFiles: updatedSharedFiles,
      messages: [...conversation.messages, newMessage],
    };

    setConversation(updatedConv);

    // Save in storage
    const all = getStoredMessages();
    const otherConvs = all.filter((c) => c.id !== OPS_CONVERSATION_ID);
    saveStoredMessages([updatedConv, ...otherConvs]);

    setToastMessage('Message sent to Operations Team.');
    setIsTyping(true);

    // Contextual simulated response from Operations Desk
    setTimeout(() => {
      setIsTyping(false);
      const lower = (text || '').toLowerCase();
      let replyText = '';

      if (lower.includes('verif') || lower.includes('profile') || lower.includes('badge')) {
        replyText = `Hi ${senderName.split(' ')[0]}! Our verification desk has your documents in queue. We cross-reference identity and portfolio links; your badge will update within 24 hours.`;
      } else if (lower.includes('audit') || lower.includes('call') || lower.includes('role') || lower.includes('tape')) {
        replyText = `Thank you! Our operations coordinator is checking with the casting department regarding your callback schedule and audition packet. We'll alert you as soon as there's an update.`;
      } else if (lower.includes('pay') || lower.includes('fee') || lower.includes('bank') || lower.includes('money')) {
        replyText = `Understood! StageLink handles all talent compensations securely via escrow milestones. Your verified bank/payout details on file will be used for direct disbursement.`;
      } else if (attachment) {
        replyText = `Thank you for sharing the document (${attachment.name})! Our operations team has attached it to your candidate record for reviewing directors.`;
      } else {
        replyText = `Thank you for contacting StageLink Operations, ${senderName.split(' ')[0]}! We have logged your request and our talent coordinator is reviewing it now.`;
      }

      const opsReply = {
        id: `m-ops-reply-${Date.now()}`,
        senderId: 'ops-team',
        senderName: 'StageLink Operations Team',
        text: replyText,
        timestamp: 'Just now',
        isOwn: false,
        readStatus: 'read',
      };

      setConversation((prev) => {
        const withReply = {
          ...prev,
          lastMessage: opsReply.text,
          lastMessageTime: 'Just now',
          messages: [...prev.messages, opsReply],
        };
        const curAll = getStoredMessages();
        const curOthers = curAll.filter((c) => c.id !== OPS_CONVERSATION_ID);
        saveStoredMessages([withReply, ...curOthers]);
        return withReply;
      });
    }, 1200);
  };

  // Reset chat to default
  const handleResetChat = () => {
    if (window.confirm('Reset conversation with Operations Team?')) {
      setConversation(DEFAULT_OPS_CONVERSATION);
      const all = getStoredMessages().filter((c) => c.id !== OPS_CONVERSATION_ID);
      saveStoredMessages([DEFAULT_OPS_CONVERSATION, ...all]);
      setToastMessage('Conversation reset.');
    }
  };

  const { participant, messages = [] } = conversation;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-white overflow-hidden text-left">
      {/* 1. OPERATIONS HEADER */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3 bg-white z-10 shrink-0 shadow-2xs">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            <img
              src={participant?.avatar}
              alt={participant?.name}
              className="w-11 h-11 rounded-2xl object-cover border border-emerald-200 shadow-2xs"
            />
            <span className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full ring-2 ring-white">
              <ShieldCheck className="w-3 h-3" />
            </span>
          </div>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold font-serif text-brand-navy truncate">
              {participant?.name || 'StageLink Operations Team'}
            </h2>
            <p className="text-[11px] text-gray-500 truncate">
              StageLink HQ • Direct Operations &amp; Talent Coordination
            </p>
          </div>
        </div>

        {/* Reset action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            title="Reset conversation"
            aria-label="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MESSAGE STREAM */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
        {/* Message bubbles */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            participantName={participant?.name}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-gray-400 ml-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-gray-500 text-[11px]">
              StageLink Operations Team is typing
            </span>
            <span className="inline-flex space-x-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. MESSAGE COMPOSER */}
      <div className="shrink-0 bg-white">
        <MessageComposer
          onSendMessage={handleSendMessage}
          isOperationsTeam={true}
        />
        <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <Lock className="w-3 h-3 text-gray-400" />
          <span>Official, direct encrypted support channel with StageLink Operations HQ</span>
        </div>
      </div>

      {/* Feedback Toast */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default MessagesPage;
