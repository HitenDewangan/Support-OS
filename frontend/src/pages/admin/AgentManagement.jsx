import React, { useState, useEffect } from 'react';
import { UserPlus, Search, MoreHorizontal, Shield, Mail, X } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import agentService from '../../services/agentService';
import useNotification from '../../hooks/useNotification';

const AgentManagement = () => {
  const notification = useNotification();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    agentService.getMyAgents()
      .then((data) => setAgents(data.agents || []))
      .catch(() => notification.error('Failed to load agents'))
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      await agentService.inviteAgent(inviteEmail);
      notification.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setIsInviteOpen(false);
    } catch (error) {
      notification.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerStyle = { display: 'flex', flexDirection: 'column', gap: '24px' };
  const thStyle = { padding: '16px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const tdStyle = { padding: '16px 24px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'var(--text-bright)', fontSize: '24px', fontWeight: '700' }}>Agent Management</h1>
          <p style={{ color: 'var(--text)', fontSize: '14px' }}>Manage and invite your support team.</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setIsInviteOpen(true)}>
          Invite Agent
        </Button>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '32px', position: 'relative' }}>
            <button
              onClick={() => setIsInviteOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ color: 'var(--text-bright)', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Invite an Agent</h2>
            <p style={{ color: 'var(--text)', fontSize: '14px', marginBottom: '24px' }}>
              An invitation email will be sent with a link to register.
            </p>
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
                <input
                  type="email"
                  placeholder="agent@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsInviteOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={inviteLoading} icon={Mail}>Send Invite</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text)' }} />
          <input
            placeholder="Search agents by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bright)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text)' }}>Loading agents...</div>
        ) : filteredAgents.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={thStyle}>Agent</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Joined</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr key={agent._id} style={{ transition: 'background-color 0.2s', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar name={agent.name} src={agent.avatar} size="medium" />
                      <div>
                        <div style={{ color: 'var(--text-bright)', fontSize: '14px', fontWeight: '600' }}>{agent.name}</div>
                        <div style={{ color: 'var(--text)', fontSize: '12px' }}>{agent.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <Badge variant={agent.isApproved ? 'success' : 'warning'}>
                      {agent.isApproved ? 'Active' : 'Pending'}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: 'var(--text)', fontSize: '13px' }}>
                      {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '64px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-bright)', fontSize: '18px', fontWeight: '700' }}>No agents yet</h3>
            <p style={{ color: 'var(--text)', fontSize: '14px', marginTop: '8px' }}>
              {searchQuery ? 'No agents match your search.' : 'Invite your first agent using the button above.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentManagement;
