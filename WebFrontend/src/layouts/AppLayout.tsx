import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Activity, Settings, LogOut, BookOpen } from 'lucide-react';
import logo from '../assets/logo.png';

export const AppLayout: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role.toLowerCase();

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="CareMate Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <span className="sidebar-logo-text">CareMate Staff</span>
        </div>

        <nav className="nav-menu">
          {/* PHM Nav */}
          {role === 'phm' && (
            <>
              <Link to="/phm" className={`nav-item ${location.pathname === '/phm' ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
            </>
          )}

          {/* Admin Nav */}
          {role === 'admin' && (
            <>
              <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                <Settings size={20} /> System Config
              </Link>
              <Link to="/admin/users" className={`nav-item ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`}>
                <Users size={20} /> Manage Users
              </Link>
              <Link to="/admin/blogs" className={`nav-item ${location.pathname.startsWith('/admin/blogs') ? 'active' : ''}`}>
                <BookOpen size={20} /> Educational Blogs
              </Link>
            </>
          )}

          {/* Supervisor/MOH Nav */}
          {(role === 'moh' || role === 'supervisor') && (
            <>
              <Link to="/moh" className={`nav-item ${location.pathname === '/moh' ? 'active' : ''}`}>
                <Activity size={20} /> Overview
              </Link>
              <Link to="/moh/blogs" className={`nav-item ${location.pathname.startsWith('/moh/blogs') ? 'active' : ''}`}>
                <BookOpen size={20} /> Educational Blogs
              </Link>
              <Link to="/moh/reports" className={`nav-item ${location.pathname.startsWith('/moh/reports') ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Analytics
              </Link>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user.email}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{user.role}</div>
          </div>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header style={{ height: 70, borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
          <h2 className="text-h2" style={{ textTransform: 'capitalize' }}>
            {role === 'phm' ? 'Public Health Midwife Portal' : role === 'admin' ? 'Administrator Portal' : 'MOH Supervisor Portal'}
          </h2>
        </header>
        <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
