import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Clock, Bot } from 'lucide-react';
import ChatWindow from '../../components/chat/ChatWindow';
import TicketStatusBadge from '../../components/ticket/TicketStatusBadge';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import ticketService from '../../services/ticketService';
import { formatDate } from '../../utils/formatDate';
import { useSocketContext } from '../../contexts/SocketContext';

const ChatWidget = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const { on } = useSocketContext();

  useEffect(() => {
    if (!ticketId) return;
    ticketService.getTicketById(ticketId)
      .then(({ ticket }) => setTicket(ticket))
      .catch(() => navigate('/customer'))
      .finally(() => setLoading(false));
  }, [ticketId]);

  // Real-time ticket status updates (e.g., agent resolves ticket)
  useEffect(() => {
    if (!ticketId) return;
    return on('ticket-updated', (updates) => {
      setTicket((prev) => prev ? { ...prev, ...updates } : prev);
    });
  }, [ticketId, on]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text)' }}>Loading...</div>;
  if (!ticket) return null;

  const agentName = ticket.assignedTo?.name || (ticket.aiHandled ? 'AI Assistant' : 'Support Team');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="ghost" size="small" onClick={() => navigate('/customer')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-bright)' }}>Support Chat</h2>
              <TicketStatusBadge status={ticket.status} />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text)' }}>#{ticket._id.slice(-6).toUpperCase()} • {ticket.category}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Ticket Info</h4>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text)' }}>Subject</span>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-bright)', marginTop: '2px' }}>{ticket.subject}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text)' }}>Priority</span>
              <div style={{ marginTop: '4px' }}>
                <Badge variant={ticket.priority === 'high' || ticket.priority === 'urgent' ? 'error' : 'warning'}>{ticket.priority}</Badge>
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text)' }}>Created</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-bright)', fontSize: '13px', marginTop: '4px' }}>
                <Clock size={13} /> {formatDate(ticket.createdAt)}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              {ticket.aiHandled ? 'AI Resolved' : 'Assigned Agent'}
            </h4>
            {ticket.aiHandled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--accent-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-bright)' }}>AI Assistant</div>
                  <div style={{ fontSize: '12px', color: 'var(--success)' }}>Resolved automatically</div>
                </div>
              </div>
            ) : ticket.assignedTo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar name={ticket.assignedTo.name} size="medium" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-bright)' }}>{ticket.assignedTo.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--success)' }}>Online</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--text)', fontStyle: 'italic' }}>Awaiting assignment...</div>
            )}
          </div>

          <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-muted)', display: 'flex', gap: '10px' }}>
            <Shield size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.5' }}>Your conversation is encrypted and secure.</span>
          </div>
        </div>

        {/* Chat */}
        <ChatWindow
          ticketId={ticketId}
          contactName={agentName}
          senderRole="customer"
        />
      </div>
    </div>
  );
};

export default ChatWidget;
