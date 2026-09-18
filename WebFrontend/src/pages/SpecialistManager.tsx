import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { apiClient } from '../services/apiClient';
import type { Clinic } from './ClinicManager';

export const SpecialistManager: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | ''>('');
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    clinicService.getAll().then(setClinics).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      fetchSpecialists(selectedClinicId as number);
    } else {
      setSpecialists([]);
    }
  }, [selectedClinicId]);

  const fetchSpecialists = async (clinicId: number) => {
    setLoading(true);
    try {
      const data = await apiClient(`/clinics/${clinicId}/specialists`);
      setSpecialists(data.specialists || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinicId) return alert('Select a clinic first');
    
    try {
      await apiClient(`/clinics/${selectedClinicId}/specialists`, {
        method: 'POST',
        body: JSON.stringify({
          full_name: fullName,
          specialty,
          contact_number: contactNumber,
          availability
        })
      });

      setFullName('');
      setSpecialty('');
      setContactNumber('');
      setAvailability('');
      fetchSpecialists(selectedClinicId as number);
      alert('Specialist added successfully!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: 24, overflowY: 'auto', flex: 1, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 className="text-h2" style={{ margin: 0 }}>Manage Clinic Specialists</h3>
      </div>

      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <h4 style={{ marginBottom: 16 }}>Select a Clinic/Hospital</h4>
        <select 
          className="input-field" 
          value={selectedClinicId}
          onChange={(e) => setSelectedClinicId(Number(e.target.value) || '')}
        >
          <option value="">-- Select Clinic --</option>
          {clinics.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {selectedClinicId && (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: 1, padding: 20 }}>
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} /> Available Specialists
            </h4>
            
            {loading ? (
              <p>Loading...</p>
            ) : specialists.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No specialists added for this clinic yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {specialists.map(s => (
                  <div key={s.id} style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600 }}>Dr. {s.full_name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-primary)' }}>{s.specialty}</div>
                    {s.contact_number && <div style={{ fontSize: 13, marginTop: 4 }}>Contact: {s.contact_number}</div>}
                    {s.availability && <div style={{ fontSize: 13, marginTop: 4 }}>Availability: {s.availability}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ width: 350, padding: 20 }}>
            <h4 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} /> Add New Specialist
            </h4>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Full Name</label>
                <input required className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className="label">Specialty</label>
                <input required className="input-field" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g. Pediatrician" />
              </div>
              <div>
                <label className="label">Contact Number (Optional)</label>
                <input className="input-field" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="e.g. 0712345678" />
              </div>
              <div>
                <label className="label">Availability (Optional)</label>
                <textarea className="input-field" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g. Mon, Wed, Fri 9 AM - 12 PM" style={{ minHeight: 80 }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                Add Specialist
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
