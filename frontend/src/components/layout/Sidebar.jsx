import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, User, Settings, LogOut, Zap,
  Shield, Users, Building2, BarChart3, PlusCircle,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const getNavItems = () => {
    switch (user?.role) {
      case 'customer':
        return [
          { path: '/customer',            label: 'My Tickets',   icon: Ticket },
          { path: '/customer/new-ticket', label: 'New Ticket',   icon: PlusCircle },
        ];
      case 'agent':
        return [
          { path: '/agent',         label: 'Dashboard',    icon: LayoutDashboard },
          { path: '/agent/queue',   label: 'Ticket Queue', icon: Ticket },
          { path: '/agent/profile', label: 'My Profile',   icon: User },
        ];
      case 'businessAdmin':
        return [
          { path: '/admin',            label: 'Dashboard',    icon: LayoutDashboard },
          { path: '/admin/agents',     label: 'Agent Mgmt',   icon: Users },
          { path: '/admin/analytics',  label: 'Analytics',    icon: BarChart3 },
          { path: '/admin/settings',   label: 'Settings',     icon: Settings },
        ];
      case 'superadmin':
        return [
          { path: '/superadmin',          label: 'Platform', icon: Shield },
          { path: '/superadmin/tenants',  label: 'Tenants',  icon: Building2 },
        ];
      default:
        return [];
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const roleLabel = {
    customer: 'Customer', agent: 'Support Agent',
    businessAdmin: 'Business Admin', superadmin: 'Super Admin',
  }[user?.role] || 'User';

  return (
    <aside style={{
      width: '256px',
      height: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #0c1120 100%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
          }}>
            <Zap size={20} fill="white" color="white" />
          </div>
          <div>
            <div style={{
              fontSize: '16px', fontWeight: '800', color: '#f1f5f9',
              letterSpacing: '-0.3px', lineHeight: 1.2,
            }}>
              SupportOS
            </div>
            <div style={{
              fontSize: '10px', color: 'rgba(255,255,255,0.28)',
              fontWeight: '600', letterSpacing: '0.7px',
              textTransform: 'uppercase', lineHeight: 1.4,
            }}>
              {user?.role === 'superadmin'
                ? 'Platform Console'
                : user?.companyName || 'Support Platform'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1, padding: '16px 12px',
        overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px',
      }}>
        <div style={{
          fontSize: '10px', color: 'rgba(255,255,255,0.2)',
          fontWeight: '700', letterSpacing: '1px',
          textTransform: 'uppercase', padding: '4px 10px 10px',
        }}>
          Menu
        </div>
        {getNavItems().map((item) => (
          <NavLink key={item.path} to={item.path} className="sidebar-link" end>
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '12px', fontWeight: '700',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '13px', fontWeight: '600', color: '#e2e8f0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)' }}>
              {roleLabel}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.09)';
            e.currentTarget.style.color = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'rgba(248, 113, 113, 0.6)';
          }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 12px', borderRadius: '10px', width: '100%',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            color: 'rgba(248, 113, 113, 0.6)',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
