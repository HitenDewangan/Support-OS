import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Clock, Tag, ChevronRight } from 'lucide-react';
import TicketStatusBadge from '../../components/ticket/TicketStatusBadge';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import useNotification from '../../hooks/useNotification';
import useAuth from '../../hooks/useAuth';
import ticketService from '../../services/ticketService';
import { formatRelativeTime } from '../../utils/formatDate';

const MyTickets = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { selectedBusiness } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const params = selectedBusiness ? { businessId: selectedBusiness._id } : {};
    ticketService.getTickets(params)
      .then(({ tickets }) => setTickets(tickets || []))
      .catch(() => notification.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, [selectedBusiness]);

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t._id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const activeTabStyle = (isActive) => ({
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s',
    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
    color: isActive ? 'white' : 'var(--text)', border: 'none', outline: 'none',
  });

  const priorityVariant = (p) => ({ urgent: 'error', high: 'error', medium: 'warning', low: 'outline' }[p] || 'outline');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-bright)', marginBottom: '4px' }}>My Tickets</h2>
          <p style={{ color: 'var(--text)', fontSize: '15px' }}>Track your active support requests.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/customer/new-ticket')}>New Ticket</Button>
      </div>

      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[['All', 'all'], ['Open', 'open'], ['In Progress', 'in-progress'], ['Resolved', 'resolved']].map(([label, val]) => (
              <button key={val} onClick={() => setStatusFilter(val)} style={activeTabStyle(statusFilter === val)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text)' }}>Loading tickets...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {filtered.length > 0 ? filtered.map((ticket) => (
            <div
              key={ticket._id}
              className="glass-card"
              style={{ padding: '24px', cursor: 'pointer', transition: 'all 0.22s' }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onClick={() => navigate(`/customer/chat/${ticket._id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)' }}>#{ticket._id.slice(-6).toUpperCase()}</span>
                  <TicketStatusBadge status={ticket.status} />
                </div>
                <Badge variant={priorityVariant(ticket.priority)}>{ticket.priority}</Badge>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '12px' }}>{ticket.subject}</h3>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text)' }}>
                  <Tag size={14} /> {ticket.category}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text)' }}>
                  <Clock size={14} /> {formatRelativeTime(ticket.updatedAt)}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {ticket.assignedTo ? (
                    <>
                      <Avatar name={ticket.assignedTo.name} size="small" />
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>
                        Assigned to <span style={{ color: 'var(--text-bright)', fontWeight: '600' }}>{ticket.assignedTo.name}</span>
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--text)', fontStyle: 'italic' }}>
                      {ticket.aiHandled ? 'Handled by AI' : 'Awaiting assignment'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: '700', fontSize: '14px' }}>
                  View <ChevronRight size={16} />
                </div>
              </div>
            </div>
          )) : (
            <div style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-bright)', fontSize: '18px', fontWeight: '700' }}>No tickets found</h3>
              <p style={{ color: 'var(--text)', fontSize: '14px', marginTop: '8px' }}>Adjust filters or create a new ticket.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
