import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';
import { staffService } from '../services/staffService';

export const MOHDashboard: React.FC = () => {
  const [phms, setPhms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Assignment state
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [hospital, setHospital] = useState('');

  const fetchPHMs = async () => {
    setLoading(true);
    try {
      const data = await staffService.getUnassignedPHMs();
      setPhms(data.phms || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch midwives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPHMs();
  }, []);

  const handleAssign = async (profileId: string) => {
    if (!hospital.trim()) {
      alert("Please enter a hospital name.");
      return;
    }

    try {
      await staffService.assignHospital(profileId, hospital);
      setPhms(phms.filter(p => p.profile_id !== profileId));
      setAssigningId(null);
      setHospital('');
      alert("Hospital assigned successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to assign hospital.");
    }
  };

  return (
    <div>
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
                    <input 
                      type="text" 
                      className="input-field"
                      placeholder="Hospital Name"
                      value={hospital}
                      onChange={e => setHospital(e.target.value)}
                      style={{ padding: '8px 12px', minWidth: 200 }}
                    />
                    <button className="btn btn-primary" style={{ padding: '8px 16px' }} onClick={() => handleAssign(phm.profile_id)}>Assign</button>
                    <button className="btn btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { setAssigningId(null); setHospital(''); }}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn btn-primary" onClick={() => setAssigningId(phm.profile_id)}>
                    Assign Hospital
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
