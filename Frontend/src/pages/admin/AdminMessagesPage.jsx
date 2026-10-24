import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationList from '../../components/messaging/ConversationList';
import ChatWindow from '../../components/messaging/ChatWindow';
import { getStoredMessages, saveStoredMessages } from '../../data/mockMessages';
import { useAuth } from '../../context/AuthContext';

const AdminMessagesPage = () => {
  const { user, role } = useAuth();
  const isOpsOrAdmin = user?.role === 'operations' || user?.role === 'admin' || role === 'operations' || role === 'admin';

  const [searchParams] = useSearchParams();
  const requestedCandidateId = searchParams.get('candidateId');
  const requestedConvId = searchParams.get('conversationId') || searchParams.get('id');

  const filterNonStaff = (list) => {
    if (!isOpsOrAdmin) return list;
    return list.filter(
      (c) => !c.isOperationsTeam && c.id !== 'conv-ops' && c.participant?.id !== 'ops-team'
    );
  };

  const [conversations, setConversations] = useState(() => {
    return filterNonStaff(getStoredMessages());
  });

  const [activeId, setActiveId] = useState(() => {
    const list = filterNonStaff(getStoredMessages());
    if (requestedCandidateId) {
      const match = list.find((c) => c.participant?.id === requestedCandidateId);
      if (match) return match.id;
    }
    if (requestedConvId) {
      const match = list.find((c) => c.id === requestedConvId);
      if (match) return match.id;
    }
    return list[0]?.id || null;
  });

  // Responsive mobile view state: 'list' | 'chat'
  const [mobileView, setMobileView] = useState(() => (activeId ? 'chat' : 'list'));

  // Update activeId if query param changes
  useEffect(() => {
    if (requestedCandidateId) {
      const match = conversations.find((c) => c.participant?.id === requestedCandidateId);
      if (match) {
        setActiveId(match.id);
        setMobileView('chat');
      }
    } else if (requestedConvId) {
      const match = conversations.find((c) => c.id === requestedConvId);
      if (match) {
        setActiveId(match.id);
        setMobileView('chat');
      }
    }
  }, [requestedCandidateId, requestedConvId, conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setMobileView('chat');
  };

  const handleSendMessage = ({ text, attachment }) => {
    if (!activeId) return;

    const messageText = typeof text === 'string' ? text : '';
    const newMessage = {
      id: `m-${Date.now()}`,
      senderId: user?.id || (user?.role === 'operations' ? 'staff-sarah' : 'admin-1'),
      senderName: user?.fullName || (user?.role === 'operations' ? 'Sarah Jenkins (Operations)' : 'Audrey Miller (Admin)'),
      text: messageText,
      timestamp: 'Just now',
      isOwn: true,
      readStatus: 'read',
      ...(attachment ? { attachment } : {}),
    };

    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            lastMessage: messageText || (attachment ? `Sent file: ${attachment.name}` : ''),
            lastMessageTime: 'Just now',
            messages: [...c.messages, newMessage],
          };
        }
        return c;
      });
      saveStoredMessages(updated);
      return updated;
    });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row bg-white border-b border-gray-100 overflow-hidden text-left">
      {/* List Column */}
      <div
        className={`h-full ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex w-full md:w-80 lg:w-96'
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Chat Window Column */}
      <div
        className={`flex-1 h-full flex flex-col min-w-0 ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatWindow
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          onBackMobile={() => setMobileView('list')}
        />
      </div>
    </div>
  );
};

export default AdminMessagesPage;
