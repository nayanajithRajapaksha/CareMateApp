import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, X } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { apiClient } from '../services/apiClient';
import type { Clinic } from './ClinicManager';

export const SpecialistManager: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | ''>('');
  const [specialists, setSpecialists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form
  const [editingSpecialistId, setEditingSpecialistId] = useState<number | null>(null);
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [availability, setAvailability] = useState('');

  const cancelEdit = () => {
    setEditingSpecialistId(null);
    setFullName('');
    setSpecialty('');
    setContactNumber('');
    setAvailability('');
  };

  const handleEditClick = (s: any) => {
    setEditingSpecialistId(s.id);
    setFullName(s.full_name);
    setSpecialty(s.specialty);
    setContactNumber(s.contact_number || '');
    setAvailability(s.availability || '');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this specialist?')) return;
    try {
      await apiClient(`/clinics/${selectedClinicId}/specialists/${id}`, {
        method: 'DELETE'
      });
      fetchSpecialists(selectedClinicId as number);
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => {
    clinicService.getAll().then(setClinics).catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      fetchSpecialists(selectedClinicId as number);
      cancelEdit();
    } else {
      setSpecialists([]);
      cancelEdit();
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

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinicId) return alert('Select a clinic first');
    
    try {
      if (editingSpecialistId) {
        await apiClient(`/clinics/${selectedClinicId}/specialists/${editingSpecialistId}`, {
          method: 'PUT',
          body: JSON.stringify({
            full_name: fullName,
            specialty,
            contact_number: contactNumber,
            availability
          })
        });
        alert('Specialist updated successfully!');
      } else {
        await apiClient(`/clinics/${selectedClinicId}/specialists`, {
          method: 'POST',
          body: JSON.stringify({
            full_name: fullName,
            specialty,
            contact_number: contactNumber,
            availability
          })
        });
        alert('Specialist added successfully!');
      }

      cancelEdit();
      fetchSpecialists(selectedClinicId as number);
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
                  <div key={s.id} style={{ 
                    padding: 16, 
                    border: '1px solid var(--color-border)', 
                    borderRadius: 12,
                    backgroundColor: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, paddingRight: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--color-text-dark)', marginBottom: 4 }}>Dr. {s.full_name}</div>
                        <div style={{ 
                          display: 'inline-block',
                          fontSize: 12, 
                          fontWeight: 500,
                          color: 'var(--color-primary)',
                          backgroundColor: 'rgba(22, 121, 121, 0.1)',
                          padding: '2px 8px',
                          borderRadius: 12
                        }}>
                          {s.specialty}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleEditClick(s)} className="btn-secondary" style={{ padding: '6px', minWidth: 0, borderRadius: 6 }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} style={{ padding: '6px', minWidth: 0, borderRadius: 6, background: 'transparent', border: '1px solid #fca5a5', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {(s.contact_number || s.availability) && (
                      <div style={{ 
                        borderTop: '1px solid var(--color-border)', 
                        paddingTop: 12, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 4 
                      }}>
                        {s.contact_number && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}><strong>Contact:</strong> {s.contact_number}</div>}
                        {s.availability && <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}><strong>Availability:</strong> {s.availability}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ width: 350, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                {editingSpecialistId ? <Edit2 size={18} /> : <Plus size={18} />} 
                {editingSpecialistId ? 'Edit Specialist' : 'Add New Specialist'}
              </h4>
              {editingSpecialistId && (
                <button onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                  <X size={18} />
                </button>
              )}
            </div>
            
            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input required className="input-field" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="input-group">
                <label className="input-label">Specialty</label>
                <input required className="input-field" value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g. Pediatrician" />
              </div>
              <div className="input-group">
                <label className="input-label">Contact Number (Optional)</label>
                <input className="input-field" value={contactNumber} onChange={e => setContactNumber(e.target.value)} placeholder="e.g. 0712345678" />
              </div>
              <div className="input-group">
                <label className="input-label">Availability (Optional)</label>
                <textarea className="input-field" value={availability} onChange={e => setAvailability(e.target.value)} placeholder="e.g. Mon, Wed, Fri 9 AM - 12 PM" style={{ minHeight: 80, resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                {editingSpecialistId ? 'Save Changes' : 'Add Specialist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
