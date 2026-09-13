import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Map, LayoutDashboard } from 'lucide-react';
import { staffService } from '../services/staffService';
import { clinicService } from '../services/clinicService';
import { ClinicManager, type Clinic } from './ClinicManager';

type Tab = 'dashboard' | 'clinics';

export const MOHDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [phms, setPhms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [hospital, setHospital] = useState('');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [assignedPhms, setAssignedPhms] = useState<any[]>([]);

  const fetchPHMs = async () => {
    setLoading(true);
    try {
      const data = await staffService.getUnassignedPHMs();
      setPhms(data.phms || []);
      const assignedData = await staffService.getAssignedPHMs();
      setAssignedPhms(assignedData.phms || []);
      const clinicsData = await clinicService.getAll();
      setClinics(clinicsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPHMs(); }, []);

  const handleAssign = async (profileId: string) => {
    if (!hospital.trim()) { alert('Please select a hospital.'); return; }
    try {
      await staffService.assignHospital(profileId, hospital);
      
      // Check if they were unassigned
      const unassignedPhm = phms.find(p => p.profile_id === profileId);
      if (unassignedPhm) {
        setPhms(phms.filter(p => p.profile_id !== profileId));
        setAssignedPhms([{ ...unassignedPhm, hospital }, ...assignedPhms]);
      } else {
        // They were already assigned, just update their hospital in place
        setAssignedPhms(assignedPhms.map(p => p.profile_id === profileId ? { ...p, hospital } : p));
      }

      setAssigningId(null);
      setHospital('');
      alert('Hospital assigned successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to assign hospital.');
    }
  };

  const handleUnassign = async (profileId: string) => {
    if (!window.confirm("Are you sure you want to remove this midwife's assignment?")) return;
    try {
      await staffService.unassignHospital(profileId);
      const unassignedPhm = assignedPhms.find(p => p.profile_id === profileId);
      setAssignedPhms(assignedPhms.filter(p => p.profile_id !== profileId));
      if (unassignedPhm) {
        setPhms([{ ...unassignedPhm, hospital: null }, ...phms]);
      }
      alert('Assignment removed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to remove assignment.');
    }
  };

  // ── Tab nav ────────────────────────────────────────────────────────────────
  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Supervisor Dashboard', icon: <LayoutDashboard size={16} /> },
    { id: 'clinics',   label: 'Clinic Map Manager',   icon: <Map size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab header */}
      <div style={{ display: 'flex', gap: 4, padding: '0 0 0 0', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)', paddingLeft: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '14px 20px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all .15s',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'clinics' ? (
        // Full-height, no padding — ClinicManager manages its own layout
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ClinicManager />
        </div>
      ) : (
        // Original supervisor dashboard
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          <h3 className="text-h2" style={{ marginBottom: 24 }}>Supervisor Dashboard</h3>

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
                        <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleAssign(phm.profile_id)}>Assign</button>
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
                        <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleAssign(phm.profile_id)}>Save</button>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setAssigningId(null); setHospital(''); }}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(22, 121, 121, 0.1)', padding: '6px 12px', borderRadius: 20 }}>
                          <Map size={16} color="var(--color-primary)" />
                          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>{phm.hospital}</span>
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 14 }} onClick={() => { setAssigningId(phm.profile_id); setHospital(phm.hospital); }}>Edit</button>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 14, color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }} onClick={() => handleUnassign(phm.profile_id)}>Remove</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
