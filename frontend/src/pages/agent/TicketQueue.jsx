import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import TicketCard from '../../components/ticket/TicketCard';
import Button from '../../components/common/Button';
import useNotification from '../../hooks/useNotification';
import ticketService from '../../services/ticketService';
import { formatRelativeTime } from '../../utils/formatDate';
import { useSocketContext } from '../../contexts/SocketContext';

const TicketQueue = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { on } = useSocketContext();

  // Stable refresh — used by socket listener (no error toast needed)
  const refreshTickets = useCallback(() => {
    ticketService.getTickets()
      .then(({ tickets }) => setTickets(tickets || []))
      .catch(() => {});
  }, []);

  // Initial load with error feedback
  useEffect(() => {
    ticketService.getTickets()
      .then(({ tickets }) => setTickets(tickets || []))
      .catch(() => notification.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, []);

  // Auto-refresh queue when a new ticket is assigned
  useEffect(() => {
    return on('notification', (n) => {
      if (n.type === 'ticket') refreshTickets();
    });
  }, [on, refreshTickets]);

  const filtered = tickets.filter((t) => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.customerId?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  // Map API ticket to TicketCard expected format
  const mapTicket = (t) => ({
    id: `#${t._id.slice(-6).toUpperCase()}`,
    _id: t._id,
    subject: t.subject,
    customer: { name: t.customerId?.name || 'Customer' },
    status: t.status,
    priority: t.priority,
    lastUpdate: formatRelativeTime(t.updatedAt),
    messageCount: 0,
    attachmentCount: 0,
  });

  const activeTabStyle = (isActive) => ({
    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', transition: 'all 0.2s',
    backgroundColor: isActive ? 'var(--accent)' : 'transparent',
    color: isActive ? 'white' : 'var(--text)', border: 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-bright)', marginBottom: '4px' }}>Ticket Queue</h2>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>Manage and respond to support requests assigned to you.</p>
        </div>
        <Button variant="outline" icon={ArrowUpDown}>Sort</Button>
      </div>

      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
            <input
              placeholder="Search by ID, subject, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Priority:</span>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', fontSize: '13px', outline: 'none' }}>
              <option value="all">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[['All', 'all'], ['Open', 'open'], ['In Progress', 'in-progress'], ['Resolved', 'resolved']].map(([label, val]) => (
            <button key={val} onClick={() => setStatusFilter(val)} style={activeTabStyle(statusFilter === val)}>{label}</button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text)' }}>
            Showing <strong>{filtered.length}</strong> tickets
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text)' }}>Loading tickets...</div>
        ) : filtered.length > 0 ? (
          filtered.map((ticket) => (
            <TicketCard
              key={ticket._id}
              ticket={mapTicket(ticket)}
              onClick={() => navigate(`/agent/ticket/${ticket._id}`)}
            />
          ))
        ) : (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', color: 'var(--text)', opacity: 0.5 }}>
              <Filter size={48} style={{ margin: '0 auto' }} />
            </div>
            <h3 style={{ color: 'var(--text-bright)', fontSize: '18px', fontWeight: '700' }}>No tickets found</h3>
            <p style={{ color: 'var(--text)', fontSize: '14px', marginTop: '8px' }}>Try adjusting your filters.</p>
            <Button variant="ghost" style={{ marginTop: '20px' }} onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setSearchQuery(''); }}>
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketQueue;
