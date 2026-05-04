import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import useAuth from '../../hooks/useAuth';
import { SocketProvider } from '../../contexts/SocketContext';

const PageWrapper = ({ title }) => {
  const { user } = useAuth();
  const layoutStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
  };

  const contentAreaStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    minWidth: 0, // Prevent flex items from overflowing
  };

  const mainStyle = {
    padding: '28px 32px',
    flexGrow: 1,
    overflowY: 'auto',
    backgroundColor: 'var(--bg)',
    backgroundImage:
      'radial-gradient(circle at 15% 10%, rgba(124,58,237,0.03) 0%, transparent 40%), ' +
      'radial-gradient(circle at 85% 90%, rgba(168,85,247,0.025) 0%, transparent 40%)',
  };

  return (
    <SocketProvider>
      <div style={layoutStyle}>
        <Sidebar />
        <div style={contentAreaStyle}>
          <Header title={title} user={user} />
          <main style={mainStyle} className="animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
    </SocketProvider>
  );
};

export default PageWrapper;
