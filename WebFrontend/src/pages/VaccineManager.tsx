import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Search } from 'lucide-react';
import { vaccineService, type Vaccine } from '../services/vaccineService';

export const VaccineManager: React.FC = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<Vaccine | null>(null);
  const [form, setForm] = useState({
    name: '',
    recommended_age_months: 0,
    minimum_interval_days: 0,
    dose_number: 1,
    previous_dose_id: '' as string | null,
  });

  const [doses, setDoses] = useState([{ recommended_age_months: 0, minimum_interval_days: 0 }]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVaccines();
  }, []);

  const fetchVaccines = async () => {
    try {
      const data = await vaccineService.getVaccines();
      setVaccines(data);
    } catch (err) {
      console.error('Failed to fetch vaccines', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vaccine?: Vaccine) => {
    if (vaccine) {
      setEditingVaccine(vaccine);
      setForm({
        name: vaccine.name,
        recommended_age_months: vaccine.recommended_age_months,
        minimum_interval_days: vaccine.minimum_interval_days || 0,
        dose_number: vaccine.dose_number || 1,
        previous_dose_id: vaccine.previous_dose_id || ''
      });
    } else {
      setEditingVaccine(null);
      setForm({
        name: '',
        recommended_age_months: 0,
        minimum_interval_days: 0,
        dose_number: 1,
        previous_dose_id: ''
      });
      setDoses([{ recommended_age_months: 0, minimum_interval_days: 0 }]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingVaccine) {
        await vaccineService.updateVaccine(editingVaccine.id, form);
      } else {
        await vaccineService.addVaccine({
          name: form.name,
          doses: doses
        });
      }
      setIsModalOpen(false);
      fetchVaccines();
    } catch (err) {
      alert('Error saving vaccine. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filteredVaccines = vaccines.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="text-h1">Vaccine Management</h1>
          <p className="text-body" style={{ color: 'var(--color-text-muted)' }}>Manage the master vaccine schedule and templates</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={20} /> Add Vaccine
        </button>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="input-group" style={{ marginBottom: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search vaccines..." 
              style={{ paddingLeft: 40 }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Loading vaccines...</div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Vaccine Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Recommended Age</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Dose No.</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Interval (Days)</th>
                <th style={{ padding: '16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVaccines.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No vaccines found.
                  </td>
                </tr>
              ) : (
                filteredVaccines.map(vaccine => (
                  <tr key={vaccine.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ backgroundColor: 'rgba(22, 121, 121, 0.1)', padding: 8, borderRadius: 8 }}>
                          <Shield size={20} color="var(--color-primary)" />
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{vaccine.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                      {vaccine.recommended_age_months} months
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                      {vaccine.dose_number || 1}
                    </td>
                    <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                      {vaccine.minimum_interval_days || 0} days
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px' }}
                        onClick={() => openModal(vaccine)}
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, animation: 'fadeIn 0.2s ease-out' }}>
            <h2 className="text-h2" style={{ marginBottom: 24, fontSize: 20 }}>
              {editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}
            </h2>
            
            <form onSubmit={handleSave}>
              <div className="input-group">
                <label className="input-label">Vaccine Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="e.g. OPV (Polio)"
                />
              </div>

              {editingVaccine ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="input-group">
                      <label className="input-label">Recommended Age (Months)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        required
                        min={0}
                        value={form.recommended_age_months}
                        onChange={e => setForm({...form, recommended_age_months: parseInt(e.target.value) || 0})}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Dose Number</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        min={1}
                        required
                        value={form.dose_number}
                        onChange={e => setForm({...form, dose_number: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="input-group">
                      <label className="input-label">Previous Dose</label>
                      <select
                        className="input-field"
                        value={form.previous_dose_id || ''}
                        onChange={e => setForm({...form, previous_dose_id: e.target.value || null})}
                      >
                        <option value="">None (Dose 1)</option>
                        {vaccines.filter(v => v.id !== editingVaccine?.id).map(v => (
                          <option key={v.id} value={v.id}>{v.name} (Dose {v.dose_number || 1})</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Min Interval (Days)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        min={0}
                        value={form.minimum_interval_days}
                        onChange={e => setForm({...form, minimum_interval_days: parseInt(e.target.value) || 0})}
                        disabled={!form.previous_dose_id}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 className="text-h3" style={{ fontSize: 16, margin: 0 }}>Doses Schedule</h3>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 12px', fontSize: 13 }}
                      onClick={() => setDoses([...doses, { recommended_age_months: 0, minimum_interval_days: 0 }])}
                    >
                      <Plus size={14} /> Add Dose
                    </button>
                  </div>
                  
                  {doses.map((dose, index) => (
                    <div key={index} style={{ padding: 16, backgroundColor: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>Dose {index + 1}</span>
                        {doses.length > 1 && (
                          <button 
                            type="button" 
                            style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}
                            onClick={() => setDoses(doses.filter((_, i) => i !== index))}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                          <label className="input-label">Recommended Age (Months)</label>
                          <input 
                            type="number" 
                            className="input-field" 
                            required
                            min={0}
                            value={dose.recommended_age_months}
                            onChange={e => {
                              const newDoses = [...doses];
                              newDoses[index].recommended_age_months = parseInt(e.target.value) || 0;
                              setDoses(newDoses);
                            }}
                          />
                        </div>

                        {index > 0 && (
                          <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Interval from Dose {index} (Days)</label>
                            <input 
                              type="number" 
                              className="input-field" 
                              required
                              min={0}
                              value={dose.minimum_interval_days}
                              onChange={e => {
                                const newDoses = [...doses];
                                newDoses[index].minimum_interval_days = parseInt(e.target.value) || 0;
                                setDoses(newDoses);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Vaccine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
