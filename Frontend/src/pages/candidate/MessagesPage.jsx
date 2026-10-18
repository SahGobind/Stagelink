import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '../../components/messaging/ConversationList';
import ChatWindow from '../../components/messaging/ChatWindow';
import ConversationDetailsSidebar from '../../components/messaging/ConversationDetailsSidebar';
import ReportConversationModal from '../../components/messaging/ReportConversationModal';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredMessages,
  saveStoredMessages,
} from '../../data/mockMessages';

const MessagesPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get('conversationId') || searchParams.get('id');

  const [conversations, setConversations] = useState(() => getStoredMessages());
  const [selectedId, setSelectedId] = useState(null);

  const activeId =
    (selectedId && conversations.some((c) => c.id === selectedId) ? selectedId : null) ||
    (requestedId && conversations.some((c) => c.id === requestedId) ? requestedId : null) ||
    conversations[0]?.id ||
    null;

  // Mobile navigation state: 'list' | 'chat'
  const [mobileView, setMobileView] = useState(() => (activeId ? 'chat' : 'list'));
  // Desktop sidebar toggle: related opportunity and shared files
  const [isDetailsSidebarOpen, setIsDetailsSidebarOpen] = useState(true);

  // Report modal state & toast
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Handle selecting a conversation
  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setMobileView('chat');

    // Automatically mark conversation as read
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id && c.unreadCount > 0) {
          return {
            ...c,
            unreadCount: 0,
            messages: c.messages.map((m) => ({ ...m, readStatus: 'read' })),
          };
        }
        return c;
      });
      saveStoredMessages(updated);
      return updated;
    });
  };

  // Handle sending a new message
  const handleSendMessage = ({ text, attachment }) => {
    if (!activeId) return;

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

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeId) {
          const updatedSharedFiles = attachment
            ? [
                {
                  id: `file-${Date.now()}`,
                  name: attachment.name,
                  size: attachment.size,
                  date: 'Just now',
                  type: attachment.type,
                },
                ...(c.sharedFiles || []),
              ]
            : c.sharedFiles || [];

          return {
            ...c,
            lastMessage: text || (attachment ? `Sent attachment: ${attachment.name}` : ''),
            lastMessageTime: 'Just now',
            sharedFiles: updatedSharedFiles,
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      });

      saveStoredMessages(updated);
      return updated;
    });

    setToastMessage('Message sent.');

    // If texting the operations team, provide a realistic simulated prompt response
    if (activeId === 'conv-ops') {
      setTimeout(() => {
        const firstName = senderName.split(' ')[0] || 'there';
        const opsReply = {
          id: `m-ops-reply-${Date.now()}`,
          senderId: 'ops-team',
          senderName: 'StageLink Operations Team',
          text: `Thank you for reaching out, ${firstName}! Our operations coordinator has received your message and is on it. We will guide you with anything you need.`,
          timestamp: 'Just now',
          isOwn: false,
          readStatus: 'unread',
        };

        setConversations((prev) => {
          const updatedWithReply = prev.map((c) => {
            if (c.id === 'conv-ops') {
              return {
                ...c,
                lastMessage: opsReply.text,
                lastMessageTime: 'Just now',
                messages: [...c.messages, opsReply],
              };
            }
            return c;
          });
          saveStoredMessages(updatedWithReply);
          return updatedWithReply;
        });
      }, 1000);
    }
  };

  // Toggle archive status
  const handleArchiveToggle = () => {
    if (!activeId) return;

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            isArchived: !c.isArchived,
          };
        }
        return c;
      });
      saveStoredMessages(updated);
      return updated;
    });

    const activeConv = conversations.find((c) => c.id === activeId);
    setToastMessage(
      activeConv?.isArchived
        ? 'Conversation unarchived.'
        : 'Conversation moved to archive.'
    );
  };

  // Confirm report submission
  const handleConfirmReport = ({ reason, participantName }) => {
    setToastMessage(
      `Thread with ${participantName} reported (${reason}). StageLink safety moderators will review this communication.`
    );
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-white overflow-hidden text-left">
      <div className="flex-1 flex overflow-hidden relative">
        {/* ================= COLUMN 1: CONVERSATION LIST ================= */}
        <div
          className={`h-full ${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex w-full md:w-auto'
          }`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* ================= COLUMN 2: ACTIVE CHAT WINDOW ================= */}
        <div
          className={`flex-1 h-full flex flex-col min-w-0 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <ChatWindow
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
            onBackMobile={() => setMobileView('list')}
            onToggleSidebar={() => setIsDetailsSidebarOpen(!isDetailsSidebarOpen)}
            isSidebarOpen={isDetailsSidebarOpen}
            onOpenReport={() => setIsReportModalOpen(true)}
          />
        </div>

        {/* ================= COLUMN 3: RELATED OPPORTUNITY & SHARED FILES ================= */}
        {isDetailsSidebarOpen && activeConversation && (
          <div className="hidden lg:flex h-full shrink-0">
            <ConversationDetailsSidebar
              conversation={activeConversation}
              onOpenReport={() => setIsReportModalOpen(true)}
              onArchiveToggle={handleArchiveToggle}
            />
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Reporting Conversation */}
      <ReportConversationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        participant={activeConversation?.participant}
        onConfirmReport={handleConfirmReport}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default MessagesPage;
