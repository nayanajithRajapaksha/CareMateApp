import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserPlus, Users, Search, Settings, ShieldCheck, User, Building2, Phone, BookOpen, Bell } from 'lucide-react';
import { authService } from '../services/authService';
import { BlogManager } from '../components/BlogManager';
import { NotificationManager } from './NotificationManager';

interface SystemUser {
  id: string;
  email: string;
  full_name: string;
  contact_number?: string;
  role: string;
  hospital?: string;
  created_at?: string;
}

export const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view based on URL
  const activeTab = location.pathname.includes('/blogs') 
    ? 'blogs' 
    : location.pathname.includes('/users') 
    ? 'users' 
    : location.pathname.includes('/notifications')
    ? 'notifications'
    : 'config';

  // State for Registration Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for User Management
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUsersError('');
    try {
      const data = await authService.getAllUsers();
      setUsers(data.users || []);
    } catch (err: any) {
      setUsersError(err.message || 'Failed to fetch user list.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setIsSubmitting(true);

    try {
      await authService.registerMOH({ 
        email, 
        password, 
        full_name: fullName, 
        contact_number: contactNumber 
      });
      setRegSuccess('MOH Supervisor successfully created.');
      setEmail('');
      setPassword('');
      setFullName('');
      setContactNumber('');
      if (activeTab === 'users') {
        fetchUsers();
      }
    } catch (err: any) {
      setRegError(err.message || 'Failed to create MOH supervisor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // User Stats & Filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (u.contact_number?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (roleFilter === 'all') return matchesSearch;
    const normRole = u.role?.toLowerCase() || '';
    if (roleFilter === 'phm') return matchesSearch && (normRole === 'phm' || normRole === 'midwife');
    return matchesSearch && normRole === roleFilter;
  });

  const totalCount = users.length;
  const parentCount = users.filter(u => (u.role || '').toLowerCase() === 'parent').length;
  const phmCount = users.filter(u => ['phm', 'midwife'].includes((u.role || '').toLowerCase())).length;
  const mohCount = users.filter(u => ['moh', 'supervisor'].includes((u.role || '').toLowerCase())).length;

  const getRoleBadgeStyle = (role: string) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return { bg: '#FEE2E2', color: '#991B1B', label: 'Admin' };
    if (r === 'moh' || r === 'supervisor') return { bg: '#E0E7FF', color: '#3730A3', label: 'MOH Supervisor' };
    if (r === 'phm' || r === 'midwife') return { bg: '#D1FAE5', color: '#065F46', label: 'Midwife (PHM)' };
    return { bg: '#F3F4F6', color: '#374151', label: 'Parent / User' };
  };

  return (
    <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h3 className="text-h2">
          {activeTab === 'blogs' ? 'Educational Blogs' : 
           activeTab === 'notifications' ? 'Notification Management' : 
           activeTab === 'users' ? 'Manage Users' : 
           'System Config'}
        </h3>
      </div>

      {activeTab === 'blogs' ? (
        <BlogManager />
      ) : activeTab === 'notifications' ? (
        <NotificationManager />
      ) : activeTab === 'config' ? (
        /* System Config / Register MOH Section */
        <div className="card" style={{ maxWidth: 650 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ backgroundColor: 'rgba(22, 121, 121, 0.1)', padding: 12, borderRadius: 8, marginRight: 16 }}>
              <UserPlus color="var(--color-primary)" size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Register MOH Supervisor</h4>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)' }}>
                Create administrative officer credentials with authority to manage midwives and assign clinics.
              </p>
            </div>
          </div>
          
          {regError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: 14 }}>
              {regError}
            </div>
          )}
          {regSuccess && (
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: 14 }}>
              {regSuccess}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="e.g. Dr. John Smith"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="e.g. john.smith@moh.gov"
              />
            </div>
            
            <div className="input-group">
              <label className="input-label">Contact Number (Optional)</label>
              <input 
                type="tel" 
                className="input-field" 
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                placeholder="e.g. 0712345678"
              />
            </div>

            <div className="input-group" style={{ marginBottom: 32 }}>
              <label className="input-label">Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '12px 24px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Supervisor'}
            </button>
          </form>
        </div>
      ) : (
        /* User Management Page */
        <div>
          {/* User Stat Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'rgba(22, 121, 121, 0.1)' }}>
                <Users color="var(--color-primary)" size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{totalCount}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Total Registered Users</div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <User color="#2563EB" size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{parentCount}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Parents / Guardians</div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <ShieldCheck color="#059669" size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{phmCount}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Midwives (PHMs)</div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ padding: 12, borderRadius: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                <Building2 color="#4F46E5" size={24} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{mohCount}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>MOH Supervisors</div>
              </div>
            </div>
          </div>

          {/* Search Bar & Filters */}
          <div className="card" style={{ marginBottom: 24, padding: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ position: 'relative', flex: '1 1 300px' }}>
                <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: 38 }}
                  placeholder="Search user by name, email, or phone number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['all', 'parent', 'phm', 'moh', 'admin'].map((roleKey) => (
                  <button
                    key={roleKey}
                    className={`btn ${roleFilter === roleKey ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 14px', fontSize: 13, textTransform: 'capitalize' }}
                    onClick={() => setRoleFilter(roleKey)}
                  >
                    {roleKey === 'phm' ? 'Midwives' : roleKey === 'moh' ? 'MOH Staff' : roleKey}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Users Table */}
          {usersError && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
              {usersError}
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loadingUsers ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading users list...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No users found matching the selected criteria.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>User Profile</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Contact Info</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Assigned Clinic/Hospital</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Date Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const badge = getRoleBadgeStyle(u.role);
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontWeight: 600 }}>{u.full_name || 'N/A'}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 600,
                            backgroundColor: badge.bg,
                            color: badge.color,
                            display: 'inline-block'
                          }}>
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {u.contact_number ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                              <Phone size={14} color="var(--color-text-muted)" /> {u.contact_number}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Not provided</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {u.hospital ? (
                            <span style={{ fontWeight: 500 }}>{u.hospital}</span>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
