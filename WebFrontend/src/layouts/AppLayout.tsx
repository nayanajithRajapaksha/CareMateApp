import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Settings, LogOut, BookOpen, Baby, UserCheck, Building2, Map } from 'lucide-react';
import logo from '../assets/logo.png';

export const AppLayout: React.FC = () => {
  const { user, activeHospital, setActiveHospital, loading, logout } = useAuth();
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
              <Link to="/phm/children" className={`nav-item ${location.pathname.startsWith('/phm/children') ? 'active' : ''}`}>
                <Baby size={20} /> Children Details
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
                <LayoutDashboard size={20} /> Midwives Overview
              </Link>
              <Link to="/moh/blogs" className={`nav-item ${location.pathname.startsWith('/moh/blogs') ? 'active' : ''}`}>
                <BookOpen size={20} /> Educational Blogs
              </Link>
              <Link to="/moh/reports" className={`nav-item ${location.pathname.startsWith('/moh/reports') ? 'active' : ''}`}>
                <LayoutDashboard size={20} /> Analytics
              </Link>
              <Link to="/moh/parents" className={`nav-item ${location.pathname.startsWith('/moh/parents') ? 'active' : ''}`}>
                <Users size={20} /> Manage Parents
              </Link>
              <Link to="/moh/clinics" className={`nav-item ${location.pathname.startsWith('/moh/clinics') ? 'active' : ''}`}>
                <Map size={20} /> Clinic Map Manager
              </Link>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{ 
            padding: '16px', 
            background: 'linear-gradient(135deg, rgba(22,121,121,0.08) 0%, rgba(13,99,93,0.04) 100%)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(22,121,121,0.2)',
            marginBottom: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ backgroundColor: 'var(--color-primary)', padding: 10, borderRadius: '50%', color: '#fff', display: 'flex' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-dark)', lineHeight: 1.2, marginBottom: 2 }}>
                  {user.full_name || 'Staff Member'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {user.role}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--color-surface)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)' }}>
              <Building2 size={16} color="var(--color-primary)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {user.hospital && user.hospital.includes(',') ? (
                  <select 
                    className="input-field" 
                    style={{ padding: '4px 8px', height: 'auto', fontSize: 13, fontWeight: 600, color: 'var(--color-text-dark)', width: '100%' }}
                    value={activeHospital || ''}
                    onChange={(e) => setActiveHospital(e.target.value)}
                  >
                    {user.hospital.split(',').map(h => (
                      <option key={h.trim()} value={h.trim()}>{h.trim()}</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-dark)', lineHeight: 1.2 }}>
                    {activeHospital ? activeHospital : <span style={{ color: 'var(--color-warning)' }}>No Facility</span>}
                  </span>
                )}
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', wordBreak: 'break-all' }}>
              {user.email}
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
