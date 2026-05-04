import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Globe, Calendar, MoreVertical } from 'lucide-react';
import ChatWindow from '../../components/chat/ChatWindow';
import TicketStatusBadge from '../../components/ticket/TicketStatusBadge';
import PrioritySelector from '../../components/ticket/PrioritySelector';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import AISuggestedReply from './AISuggestedReply';
import ticketService from '../../services/ticketService';
import useNotification from '../../hooks/useNotification';
import { formatDate } from '../../utils/formatDate';
import { useSocketContext } from '../../contexts/SocketContext';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [aiSuggestion, setAISuggestion] = useState('');

  useEffect(() => {
    ticketService.getTicketById(id)
      .then(({ ticket }) => setTicket(ticket))
      .catch(() => navigate('/agent/queue'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (status) => {
    setUpdating(true);
    try {
      const { ticket: updated } = await ticketService.updateTicket(id, { status });
      setTicket(updated);
      notification.success(`Ticket marked as ${status}`);
    } catch {
      notification.error('Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const { on } = useSocketContext();

  // Real-time ticket status/assignment updates
  useEffect(() => {
    if (!id) return;
    return on('ticket-updated', (updates) => {
      setTicket((prev) => prev ? { ...prev, ...updates } : prev);
    });
  }, [id, on]);

  const infoColumnStyle = {
    display: 'flex', flexDirection: 'column', gap: '20px',
    overflowY: 'auto', paddingRight: '4px',
  };

  const sectionTitleStyle = {
    fontSize: '11px', fontWeight: '700', color: 'var(--text)',
    marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px',
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>Loading ticket...</div>;
  if (!ticket) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="ghost" size="small" onClick={() => navigate('/agent/queue')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-bright)' }}>#{ticket._id.slice(-6).toUpperCase()}</span>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text)', marginTop: '2px' }}>{ticket.subject}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {ticket.status !== 'resolved' && (
            <Button variant="primary" loading={updating} onClick={() => handleStatusChange('resolved')}>Mark Resolved</Button>
          )}
          {ticket.status === 'resolved' && (
            <Button variant="outline" loading={updating} onClick={() => handleStatusChange('open')}>Reopen</Button>
          )}
          <Button variant="ghost" icon={MoreVertical} />
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', height: 'calc(100vh - 180px)' }}>
        {/* Left: Chat */}
        <ChatWindow
          ticketId={id}
          contactName={ticket.customerId?.name || 'Customer'}
          senderRole="agent"
          aiSuggestion={aiSuggestion}
          onAISuggestionUsed={() => setAISuggestion('')}
        />

        {/* Right: Info */}
        <div style={infoColumnStyle}>
          {/* Customer */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={sectionTitleStyle}>Customer</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Avatar name={ticket.customerId?.name} size="large" />
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-bright)', fontSize: '15px' }}>{ticket.customerId?.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>Customer</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text)', marginBottom: '8px' }}>
              <Mail size={14} /> {ticket.customerId?.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text)' }}>
              <Calendar size={14} /> Since {formatDate(ticket.customerId?.createdAt || ticket.createdAt)}
            </div>
          </div>

          {/* Properties */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={sectionTitleStyle}>Properties</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginBottom: '6px' }}>Priority</label>
                <PrioritySelector value={ticket.priority} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Category</label>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-bright)' }}>{ticket.category}</div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Created</label>
                <div style={{ fontSize: '13px', color: 'var(--text-bright)' }}>{formatDate(ticket.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* AI Suggestions — only shown when ticket is active */}
          {ticket.status !== 'resolved' && (
            <AISuggestedReply
              ticketId={id}
              onSelect={(text) => setAISuggestion(text)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
