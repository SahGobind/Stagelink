import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../components/layout/PageContainer';
import SupportChatInterface from '../../components/support/SupportChatInterface';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { supportService } from '../../services/supportService';

const RecruiterTicketDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await supportService.getTicketById(id, {
        role: 'recruiter',
        userId: user?.id,
      });
      if (!data) {
        setError('Support ticket not found.');
      } else {
        setTicket(data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load ticket conversation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id, user?.id]);

  const handleSendReply = async (replyData) => {
    const updated = await supportService.replyToTicket(ticket.id || ticket.ticketNumber, replyData);
    setTicket(updated);
  };

  const handleReopenTicket = async () => {
    const updated = await supportService.reopenTicket(ticket.id || ticket.ticketNumber, {
      user,
    });
    setTicket(updated);
  };

  if (loading) {
    return (
      <PageContainer maxWidth="5xl" className="py-12">
        <LoadingSpinner message="Opening studio inquiry thread..." />
      </PageContainer>
    );
  }

  if (error || !ticket) {
    return (
      <PageContainer maxWidth="4xl" className="py-12 text-left">
        <ErrorState
          title="Ticket Unavailable"
          message={error || 'This support inquiry could not be found.'}
          actionLabel="Back to Studio Support Desk"
          onAction={() => navigate('/admin/support')}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="6xl" className="space-y-6 text-left pb-16">
      <SupportChatInterface
        ticket={ticket}
        currentUser={user}
        onSendReply={handleSendReply}
        onReopenTicket={handleReopenTicket}
        backLink="/admin/support"
        backLabel="Back to Studio Support Desk"
        isStaff={false}
      />
    </PageContainer>
  );
};

export default RecruiterTicketDetailsPage;
