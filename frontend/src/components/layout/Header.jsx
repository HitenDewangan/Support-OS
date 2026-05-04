import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Clock, MessageSquare, Ticket, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Header = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !e.target.closest('.notif-btn')
      ) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n) => {
    if (!n.read) markAsRead(n._id);
    if (n.ticketId) {
      const role = user?.role;
      if (role === 'customer')     navigate(`/customer/chat/${n.ticketId}`);
      else if (role === 'agent')   navigate(`/agent/ticket/${n.ticketId}`);
      else if (role === 'businessAdmin') navigate(`/agent/ticket/${n.ticketId}`);
    }
    setShowNotifications(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleLabel = {
    customer: 'Customer', agent: 'Agent',
    businessAdmin: 'Admin', superadmin: 'Super Admin',
  }[user?.role] || 'User';

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: '64px',
      backgroundColor: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 0 0 var(--border)',
    }}>
      <style>{`
        @keyframes notifSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .notif-item:hover { background-color: var(--surface-hover) !important; }
      `}</style>

      {/* Search */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          placeholder="Search tickets, customers…"
          style={{
            width: '100%', padding: '9px 16px 9px 38px',
            backgroundColor: 'var(--bg)', border: '1.5px solid var(--border)',
            borderRadius: '10px', fontSize: '14px', color: 'var(--text-bright)', outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.backgroundColor = '#fff'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.backgroundColor = 'var(--bg)'; }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="notif-btn"
            onClick={() => setShowNotifications(v => !v)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showNotifications ? 'var(--surface-hover)' : 'transparent'}
            style={{
              width: '40px', height: '40px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text)', position: 'relative', transition: 'background-color 0.15s',
              backgroundColor: showNotifications ? 'var(--surface-hover)' : 'transparent',
            }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '7px', right: '7px',
                minWidth: '16px', height: '16px',
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                borderRadius: '8px', border: '2px solid var(--surface)',
                fontSize: '9px', fontWeight: '700', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute', top: '48px', right: 0, width: '380px',
                backgroundColor: 'var(--surface)', borderRadius: '16px',
                boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
                overflow: 'hidden', animation: 'notifSlide 0.2s ease-out',
                zIndex: 200,
              }}
            >
              <div style={{
                padding: '14px 18px', borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'var(--bg)',
              }}>
                <div>
                  <span style={{ fontWeight: '700', color: 'var(--text-bright)', fontSize: '15px' }}>
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: '8px', fontSize: '11px', fontWeight: '700', color: '#fff',
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                      padding: '2px 7px', borderRadius: '10px',
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--accent)', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <CheckCheck size={13} /> All read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text)', fontSize: '14px' }}>
                    <Bell size={28} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                    <div>No notifications yet</div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="notif-item"
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '13px 18px', display: 'flex', gap: '12px',
                        borderBottom: '1px solid var(--border)', cursor: 'pointer',
                        backgroundColor: n.read ? 'transparent' : 'rgba(124,58,237,0.04)',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        backgroundColor: n.type === 'message' ? 'rgba(59,130,246,0.1)' : 'rgba(124,58,237,0.1)',
                        color: n.type === 'message' ? '#3b82f6' : 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {n.type === 'message' ? <MessageSquare size={15} /> : <Ticket size={15} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-bright)', marginBottom: '2px' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '3px', opacity: 0.7 }}>
                          <Clock size={10} /> {timeAgo(n.createdAt)}
                        </div>
                      </div>
                      {!n.read && (
                        <div style={{ width: '7px', height: '7px', backgroundColor: 'var(--accent)', borderRadius: '50%', marginTop: '5px', flexShrink: 0 }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--border)', margin: '0 8px' }} />

        {/* User pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-bright)', lineHeight: 1.3 }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text)', lineHeight: 1.3 }}>{roleLabel}</div>
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '13px', fontWeight: '700',
            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
            flexShrink: 0,
          }}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
