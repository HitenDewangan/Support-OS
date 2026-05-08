import React, { useState } from 'react';
import { BarChart3, Users, Ticket, ArrowUpRight, TrendingUp, Link2, Copy, Check, Sparkles } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const inviteLink = user?._id
    ? `${window.location.origin}/register?businessId=${user._id}`
    : null;

  const businessDisplayId = user?.tenantId || user?._id || null;

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    {
      label: 'Total Agents', value: '24', icon: Users,
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      bg: 'rgba(124, 58, 237, 0.06)', trend: '+2 this month', trendUp: true,
    },
    {
      label: 'Active Tickets', value: '142', icon: Ticket,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      bg: 'rgba(245, 158, 11, 0.06)', trend: '-12% from yesterday', trendUp: false,
    },
    {
      label: 'Avg. CSAT Score', value: '4.8', icon: BarChart3,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      bg: 'rgba(16, 185, 129, 0.06)', trend: '+0.2 from last week', trendUp: true,
    },
    {
      label: 'Resolution Rate', value: '94%', icon: ArrowUpRight,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
      bg: 'rgba(139, 92, 246, 0.06)', trend: 'Stable this week', trendUp: true,
    },
  ];

  const topAgents = [
    { name: 'Alex Rivera', resolution: '98%', tickets: 45, initial: 'AR' },
    { name: 'Sarah Chen',  resolution: '96%', tickets: 38, initial: 'SC' },
    { name: 'Marcus Bell', resolution: '94%', tickets: 42, initial: 'MB' },
    { name: 'Elena Frost', resolution: '92%', tickets: 35, initial: 'EF' },
  ];

  const chartHeights = [40, 65, 45, 85, 55, 75, 95];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Welcome */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        border: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} color="white" />
            </div>
            <h1 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.4px' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
            </h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
            {user?.companyName || 'Your Business'} &nbsp;·&nbsp;
            <code style={{
              fontSize: '12px', backgroundColor: 'rgba(124,58,237,0.15)',
              padding: '2px 8px', borderRadius: '6px', color: '#a78bfa',
              border: '1px solid rgba(124,58,237,0.2)',
            }}>
              {businessDisplayId}
            </code>
          </p>
        </div>
        <div style={{
          padding: '8px 18px', borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.15))',
          border: '1px solid rgba(124,58,237,0.3)',
        }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>Role</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#c4b5fd' }}>Business Admin</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card" style={{ padding: '22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: stat.gradient, borderRadius: '16px 16px 0 0',
            }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <stat.icon size={20} style={{ background: stat.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
              </div>
              <TrendingUp size={14} style={{ color: stat.trendUp ? 'var(--success)' : 'var(--warning)', opacity: 0.85 }} />
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-bright)', letterSpacing: '-1px', lineHeight: 1, marginBottom: '4px' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: '11px', color: stat.trendUp ? 'var(--success)' : 'var(--warning)',
              fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Customer registration link */}
      {inviteLink && (
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              padding: '10px', borderRadius: '10px',
              backgroundColor: 'var(--accent-muted)', color: 'var(--accent)', display: 'flex',
            }}>
              <Link2 size={18} />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-bright)', fontSize: '15px', fontWeight: '700', margin: 0 }}>
                Customer Registration Link
              </h3>
              <p style={{ color: 'var(--text)', fontSize: '13px', margin: 0 }}>
                Share this link so customers can register under your business.
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '11px 14px',
          }}>
            <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {inviteLink}
            </span>
            <button
              onClick={handleCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px', border: 'none',
                background: copied ? 'var(--success)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
                color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.2s',
              }}
            >
              {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Link</>}
            </button>
          </div>
        </div>
      )}

      {/* Chart + agents */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Chart */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h3 style={{ color: 'var(--text-bright)', fontSize: '17px', fontWeight: '700' }}>Ticket Volume</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }} />
              <span style={{ fontSize: '12px', color: 'var(--text)' }}>Resolved</span>
            </div>
          </div>
          <p style={{ color: 'var(--text)', fontSize: '13px', marginBottom: '24px' }}>
            Overview of ticket resolutions — last 7 days.
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '8px', padding: '0 4px' }}>
            {chartHeights.map((h, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{
                  width: '100%', height: `${h}%`,
                  background: 'linear-gradient(to top, rgba(124,58,237,0.15), rgba(124,58,237,0.7))',
                  borderRadius: '6px 6px 0 0', transition: 'height 0.8s ease-out',
                  border: '1px solid rgba(124,58,237,0.2)',
                }} />
                <span style={{ fontSize: '11px', color: 'var(--text)', opacity: 0.6 }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top agents */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ color: 'var(--text-bright)', fontSize: '17px', fontWeight: '700' }}>Top Agents</h3>
            <button style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
              View all
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topAgents.map((agent, i) => (
              <div
                key={i}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                onMouseOut={(e)  => e.currentTarget.style.transform = 'translateX(0)'}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderRadius: '12px',
                  border: '1px solid var(--border)', transition: 'transform 0.2s', cursor: 'pointer',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: `linear-gradient(135deg, hsl(${260 + i * 20}, 65%, 55%), hsl(${280 + i * 20}, 68%, 48%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '12px', fontWeight: '700',
                }}>
                  {agent.initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text-bright)', fontSize: '13px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {agent.name}
                  </div>
                  <div style={{ color: 'var(--success)', fontSize: '11px', fontWeight: '600' }}>
                    {agent.resolution} resolved
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: 'var(--text-bright)', fontSize: '14px', fontWeight: '700' }}>{agent.tickets}</div>
                  <div style={{ color: 'var(--text)', fontSize: '10px' }}>tickets</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
