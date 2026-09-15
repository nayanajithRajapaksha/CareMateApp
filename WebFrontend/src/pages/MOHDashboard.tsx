import React, { useState, useEffect } from 'react';
import { Users, Clock, Map, UserPlus, Search, Phone, X, Baby, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { staffService } from '../services/staffService';
import { clinicService } from '../services/clinicService';
import { ClinicManager, type Clinic } from './ClinicManager';
import { BlogManager } from '../components/BlogManager';

type Tab = 'dashboard' | 'parents' | 'clinics' | 'blogs';

interface ParentUser {
  profile_id: string;
  email: string;
  full_name: string;
  contact_number?: string;
  created_at?: string;
  children_count?: number;
  children_list?: { id: number, name: string, dob: string }[];
}

export const MOHDashboard: React.FC = () => {
  const location = useLocation();
  let activeTab: Tab = 'dashboard';
  if (location.pathname.startsWith('/moh/parents')) activeTab = 'parents';
  if (location.pathname.startsWith('/moh/clinics')) activeTab = 'clinics';
  if (location.pathname.startsWith('/moh/blogs')) activeTab = 'blogs';
  
  const [phms, setPhms] = useState<any[]>([]);
  const [assignedPhms, setAssignedPhms] = useState<any[]>([]);
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Midwife assignment state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [hospital, setHospital] = useState('');

  // Parent assignment state
  const [parentSearch, setParentSearch] = useState('');

  // Add Midwife Modal State
  const [showAddMidwifeModal, setShowAddMidwifeModal] = useState(false);
  const [midwifeFullName, setMidwifeFullName] = useState('');
  const [midwifeEmail, setMidwifeEmail] = useState('');
  const [midwifePassword, setMidwifePassword] = useState('');
  const [midwifeContact, setMidwifeContact] = useState('');
  const [midwifeInitialClinic, setMidwifeInitialClinic] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [unassignedData, assignedData, clinicsData, parentsData] = await Promise.all([
        staffService.getUnassignedPHMs(),
        staffService.getAssignedPHMs(),
        clinicService.getAll(),
        staffService.getParents()
      ]);

      setPhms(unassignedData.phms || []);
      setAssignedPhms(assignedData.phms || []);
      setClinics(clinicsData || []);
      setParents(parentsData.parents || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Midwife Hospital Assignment
  const handleAssignMidwife = async (profileId: string) => {
    if (!hospital.trim()) { alert('Please select a clinic/hospital.'); return; }
    try {
      await staffService.assignHospital(profileId, hospital);
      setAssigningId(null);
      setHospital('');
      await fetchDashboardData();
      alert('Hospital assigned successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to assign hospital.');
    }
  };

  const handleUnassignMidwife = async (profileId: string, hospitalToRemove?: string) => {
    if (!window.confirm(`Are you sure you want to remove ${hospitalToRemove ? 'this hospital' : "this midwife's entire assignment"}?`)) return;
    try {
      await staffService.unassignHospital(profileId, hospitalToRemove);
      await fetchDashboardData();
      alert('Assignment removed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment.');
    }
  };

  // Create Midwife Handler
  const handleCreateMidwifeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setIsCreating(true);

    try {
      await staffService.createPHM({
        full_name: midwifeFullName,
        email: midwifeEmail,
        password: midwifePassword,
        contact_number: midwifeContact,
        hospital: midwifeInitialClinic || undefined
      });

      setCreateSuccess('Midwife created successfully!');
      setMidwifeFullName('');
      setMidwifeEmail('');
      setMidwifePassword('');
      setMidwifeContact('');
      setMidwifeInitialClinic('');
      fetchDashboardData();
      setTimeout(() => setShowAddMidwifeModal(false), 1200);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to register midwife.');
    } finally {
      setIsCreating(false);
    }
  };

  const childAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (today.getDate() < birthDate.getDate()) months -= 1;
    if (months < 0) { years -= 1; months += 12; }
    return years > 0 ? `${years}y ${months}m` : `${months}m`;
  };

  // Filter parents by search
  const filteredParents = parents.filter(p => 
    (p.full_name?.toLowerCase() || '').includes(parentSearch.toLowerCase()) ||
    (p.email?.toLowerCase() || '').includes(parentSearch.toLowerCase()) ||
    (p.contact_number?.toLowerCase() || '').includes(parentSearch.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {activeTab === 'blogs' ? (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <BlogManager />
        </div>
      ) : activeTab === 'clinics' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ClinicManager />
        </div>
      ) : activeTab === 'parents' ? (
        /* Tab 2: Manage Parents Section */
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 className="text-h2" style={{ margin: 0 }}>Parent Clinic Assignment</h3>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Total Registered Parents: <strong>{parents.length}</strong>
            </span>
          </div>

          {/* Search bar */}
          <div className="card" style={{ marginBottom: 24, padding: 16 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: 38 }}
                placeholder="Search parent by name, email, or contact number..."
                value={parentSearch}
                onChange={e => setParentSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading parents list...</div>
            ) : filteredParents.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No parents found.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Parent Info</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Contact Info</th>
                    <th style={{ padding: '14px 20px', fontWeight: 600 }}>Registered Children (Age)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.map((parent) => (
                    <tr key={parent.profile_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 600 }}>{parent.full_name || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{parent.email}</div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {parent.contact_number ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={14} color="var(--color-text-muted)" /> {parent.contact_number}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {parent.children_list && parent.children_list.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {parent.children_list.map((child: any) => (
                              <div key={child.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Baby size={16} color="var(--color-primary)" />
                                <span style={{ fontWeight: 600 }}>{child.name}</span>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>({childAge(child.dob)})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>No children registered</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        /* Tab 3: Supervisor Dashboard (Midwives Management) */
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 className="text-h2" style={{ margin: 0 }}>Midwives Management</h3>
            <button
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              onClick={() => setShowAddMidwifeModal(true)}
            >
              <UserPlus size={18} /> Register New Midwife
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: 32 }}>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: 16, borderRadius: '50%' }}>
                <Clock color="var(--color-warning)" size={28} />
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Unassigned Midwives</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{phms.length}</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ backgroundColor: 'rgba(22, 121, 121, 0.1)', padding: 16, borderRadius: '50%' }}>
                <CheckCircle color="var(--color-primary)" size={28} />
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Assigned Midwives</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{assignedPhms.length}</div>
              </div>
            </div>
          </div>

          {/* Pending Hospital Assignments */}
          <div className="card">
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={20} color="var(--color-primary)" /> Pending Hospital Assignments
            </h4>

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p style={{ color: 'var(--color-error)' }}>{error}</p>
            ) : phms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
                <CheckCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                <p>All registered midwives have been assigned to a hospital.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {phms.map(phm => (
                  <div key={phm.profile_id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{phm.full_name}</div>
                      <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{phm.email} {phm.contact_number && `• ${phm.contact_number}`}</div>
                    </div>
                    {assigningId === phm.profile_id ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select
                          className="input-field"
                          value={hospital}
                          onChange={e => setHospital(e.target.value)}
                          style={{ padding: '8px 12px', minWidth: 200 }}
                        >
                          <option value="">Select a clinic...</option>
                          {clinics.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleAssignMidwife(phm.profile_id)}>Assign</button>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setAssigningId(null); setHospital(''); }}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-primary" onClick={() => setAssigningId(phm.profile_id)}>Assign Hospital</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Midwives */}
          <div className="card" style={{ marginTop: 24 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={20} color="var(--color-primary)" /> Assigned Midwives
            </h4>
            
            {loading ? (
              <p>Loading...</p>
            ) : assignedPhms.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No midwives have been assigned yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {assignedPhms.map(phm => (
                  <div key={phm.profile_id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{phm.full_name}</div>
                      <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>{phm.email} {phm.contact_number && `• ${phm.contact_number}`}</div>
                    </div>
                    {assigningId === phm.profile_id ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select
                          className="input-field"
                          value={hospital}
                          onChange={e => setHospital(e.target.value)}
                          style={{ padding: '8px 12px', minWidth: 200 }}
                        >
                          <option value="">Select a clinic...</option>
                          {clinics.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleAssignMidwife(phm.profile_id)}>Add</button>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setAssigningId(null); setHospital(''); }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {phm.hospital.split(',').map((h: string) => (
                          <div key={h.trim()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(22, 121, 121, 0.1)', padding: '4px 10px', borderRadius: 20 }}>
                            <Map size={14} color="var(--color-primary)" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>{h.trim()}</span>
                            <button 
                              onClick={() => handleUnassignMidwife(phm.profile_id, h.trim())}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: 'var(--color-primary)', opacity: 0.7 }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 13 }} onClick={() => { setAssigningId(phm.profile_id); setHospital(''); }}>+ Add Hospital</button>
                        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 13, color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }} onClick={() => handleUnassignMidwife(phm.profile_id)}>Remove All</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Register Midwife Modal */}
      {showAddMidwifeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 28, position: 'relative' }}>
            <button
              onClick={() => setShowAddMidwifeModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="var(--color-text-muted)" />
            </button>

            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Register New Midwife (PHM)</h4>

            {createError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
                {createError}
              </div>
            )}

            {createSuccess && (
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateMidwifeSubmit}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={midwifeFullName}
                  onChange={e => setMidwifeFullName(e.target.value)}
                  required
                  placeholder="e.g. Mary Perera"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={midwifeEmail}
                  onChange={e => setMidwifeEmail(e.target.value)}
                  required
                  placeholder="e.g. mary.perera@moh.gov"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Contact Number (Optional)</label>
                <input
                  type="tel"
                  className="input-field"
                  value={midwifeContact}
                  onChange={e => setMidwifeContact(e.target.value)}
                  placeholder="e.g. 0771234567"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Assign Hospital/Clinic (Optional)</label>
                <select
                  className="input-field"
                  value={midwifeInitialClinic}
                  onChange={e => setMidwifeInitialClinic(e.target.value)}
                >
                  <option value="">Leave Unassigned</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 24 }}>
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  value={midwifePassword}
                  onChange={e => setMidwifePassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddMidwifeModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreating}
                >
                  {isCreating ? 'Registering...' : 'Register Midwife'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
