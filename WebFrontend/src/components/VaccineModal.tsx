import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { vaccineService, type Vaccine } from '../services/vaccineService';

interface VaccineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingGroup: string | null;
  initialGroupData?: Vaccine[];
}

export const VaccineModal: React.FC<VaccineModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaved, 
  editingGroup,
  initialGroupData
}) => {
  const [form, setForm] = useState({ name: '' });
  const [doses, setDoses] = useState([{ recommended_age_months: 0, minimum_interval_days: 0 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialGroupData && initialGroupData.length > 0) {
        setForm({ name: initialGroupData[0].name });
        const sortedDoses = [...initialGroupData].sort((a, b) => (a.dose_number || 1) - (b.dose_number || 1));
        setDoses(sortedDoses.map(v => ({
          recommended_age_months: v.recommended_age_months,
          minimum_interval_days: v.minimum_interval_days || 0
        })));
      } else {
        setForm({ name: '' });
        setDoses([{ recommended_age_months: 0, minimum_interval_days: 0 }]);
      }
    }
  }, [isOpen, initialGroupData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGroup) {
        await vaccineService.updateVaccineGroup(editingGroup, { name: form.name, doses });
      } else {
        await vaccineService.addVaccine({
          name: form.name,
          doses: doses.map((d, index) => ({ ...d, dose_number: index + 1 }))
        });
      }
      onSaved();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Error saving vaccine. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.2s ease-out' }}>
        <h2 className="text-h2" style={{ marginBottom: 24, fontSize: 20 }}>
          {editingGroup ? 'Edit Vaccine' : 'Add New Vaccine'}
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
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
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

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Vaccine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
