import React from 'react';
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Users, Settings, LogOut, BookOpen, Baby, UserCheck, Building2, Map, Edit2, X, Bell, Clock, Key, Shield } from 'lucide-react';
import logo from '../assets/logo.png';

import { authService } from '../services/authService';

export const AppLayout: React.FC = () => {
  const { user, activeHospital, setActiveHospital, loading, logout, updateUser } = useAuth();
  const location = useLocation();

  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const [profileForm, setProfileForm] = React.useState({ full_name: '', contact_number: '' });
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({ currentPassword: '', newPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  // Initialize form when modal opens
  React.useEffect(() => {
    if (isProfileModalOpen && user) {
      setProfileForm({
        full_name: user.full_name || '',
        contact_number: (user as any).contact_number || '' // Fallback if type doesn't have it
      });
    }
  }, [isProfileModalOpen, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { profile } = await authService.updateProfile(profileForm);
      updateUser({ full_name: profile.full_name, contact_number: profile.contact_number } as any);
      setIsProfileModalOpen(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    try {
      await authService.changePassword(passwordForm);
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      alert('Password updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

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
                <Baby size={20} /> Child Directory
              </Link>
              <Link to="/phm/parents" className={`nav-item ${location.pathname.startsWith('/phm/parents') ? 'active' : ''}`}>
                <Users size={20} /> Parent & Clinic Directory
              </Link>
              <Link to="/phm/appointments" className={`nav-item ${location.pathname.startsWith('/phm/appointments') ? 'active' : ''}`}>
                <Clock size={20} /> Appointments
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
              <Link to="/admin/notifications" className={`nav-item ${location.pathname.startsWith('/admin/notifications') ? 'active' : ''}`}>
                <Bell size={20} /> Notifications
              </Link>
              <Link to="/admin/vaccines" className={`nav-item ${location.pathname.startsWith('/admin/vaccines') ? 'active' : ''}`}>
                <Shield size={20} /> Vaccine Management
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

              <Link to="/moh/parents" className={`nav-item ${location.pathname.startsWith('/moh/parents') ? 'active' : ''}`}>
                <Users size={20} /> Manage Parents
              </Link>
              <Link to="/moh/clinics" className={`nav-item ${location.pathname.startsWith('/moh/clinics') ? 'active' : ''}`}>
                <Map size={20} /> Clinic Map Manager
              </Link>
              <Link to="/moh/specialists" className={`nav-item ${location.pathname.startsWith('/moh/specialists') ? 'active' : ''}`}>
                <Users size={20} /> Manage Specialists
              </Link>
              <Link to="/moh/vaccines" className={`nav-item ${location.pathname.startsWith('/moh/vaccines') ? 'active' : ''}`}>
                <Shield size={20} /> Vaccine Management
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-dark)', lineHeight: 1.2, marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name || 'Staff Member'}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setIsPasswordModalOpen(true)} title="Change Password" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', borderRadius: 4 }}>
                      <Key size={14} />
                    </button>
                    <button onClick={() => setIsProfileModalOpen(true)} title="Edit Profile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', borderRadius: 4 }}>
                      <Edit2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {user.role}
                </div>
              </div>
            </div>

            {role === 'phm' && (
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
            )}
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

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="text-h2" style={{ fontSize: 20 }}>Edit Profile</h2>
              <button onClick={() => setIsProfileModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  value={profileForm.full_name}
                  onChange={e => setProfileForm({...profileForm, full_name: e.target.value})}
                  placeholder="E.g. Dr. Jane Smith"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Contact Number (Optional)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileForm.contact_number}
                  onChange={e => setProfileForm({...profileForm, contact_number: e.target.value})}
                  placeholder="E.g. 0771234567"
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 400, animation: 'fadeIn 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 className="text-h2" style={{ fontSize: 20 }}>Change Password</h2>
              <button onClick={() => setIsPasswordModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChangePassword}>
              <div className="input-group">
                <label className="input-label">Current Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  required
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="input-group">
                <label className="input-label">New Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSavingPassword}>
                  {isSavingPassword ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
