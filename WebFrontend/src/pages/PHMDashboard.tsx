import React, { useState, useEffect } from 'react';
import { Users, Edit2, Check, X, Search } from 'lucide-react';
import { phmService } from '../services/phmService';
import { useAuth } from '../contexts/AuthContext';

export const PHMDashboard: React.FC = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [search, setSearch] = useState('');

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const data = await phmService.getAllChildren();
      setChildren(data.children || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch children data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleEditClick = (child: any) => {
    setEditingId(child.id);
    setEditForm({
      blood_group: child.blood_group || '',
      birth_weight_kg: child.birth_weight_kg || '',
      allergies: child.allergies || '',
      existing_conditions: child.existing_conditions || '',
      primary_clinic: child.primary_clinic || ''
    });
  };

  const handleSave = async (childId: string) => {
    try {
      await phmService.updateChild(childId, {
        blood_group: editForm.blood_group,
        birth_weight_kg: parseFloat(editForm.birth_weight_kg) || undefined,
        allergies: editForm.allergies,
        existing_conditions: editForm.existing_conditions,
        primary_clinic: editForm.primary_clinic
      });
      alert('Child medical profile updated!');
      setEditingId(null);
      fetchChildren(); // Refresh
    } catch (err: any) {
      alert(err.message || 'Failed to update child.');
    }
  };

  const filteredChildren = children.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) || 
    (c.birth_cert_number && c.birth_cert_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <h3 className="text-h2" style={{ marginBottom: 24 }}>Midwife Dashboard</h3>
      
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: 32 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ backgroundColor: 'rgba(22, 121, 121, 0.1)', padding: 16, borderRadius: '50%' }}>
            <Users color="var(--color-primary)" size={28} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Total Children Registered</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{children.length}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h4 style={{ fontSize: 18, fontWeight: 600 }}>Children Directory</h4>
          <div className="input-group" style={{ marginBottom: 0, width: 300, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search by name or cert..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p style={{ color: 'var(--color-error)' }}>{error}</p>
        ) : filteredChildren.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No children found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>DOB / Gender</th>
                  <th style={{ padding: '12px 16px' }}>Birth Weight (kg)</th>
                  <th style={{ padding: '12px 16px' }}>Blood Group</th>
                  <th style={{ padding: '12px 16px' }}>Clinic</th>
                  <th style={{ padding: '12px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.map(child => {
                  const isEditing = editingId === child.id;

                  return (
                    <tr key={child.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600 }}>{child.full_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Cert: {child.birth_cert_number || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div>{new Date(child.dob).toLocaleDateString()}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{child.gender}</div>
                      </td>
                      
                      <td style={{ padding: '16px' }}>
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="input-field" 
                            step="0.1"
                            style={{ padding: '6px 8px' }}
                            value={editForm.birth_weight_kg}
                            onChange={e => setEditForm({ ...editForm, birth_weight_kg: e.target.value })}
                          />
                        ) : (
                          child.birth_weight_kg
                        )}
                      </td>

                      <td style={{ padding: '16px' }}>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ padding: '6px 8px' }}
                            value={editForm.blood_group}
                            onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}
                          />
                        ) : (
                          child.blood_group
                        )}
                      </td>

                      <td style={{ padding: '16px' }}>
                        {isEditing ? (
                          <input 
                            type="text" 
                            className="input-field" 
                            style={{ padding: '6px 8px' }}
                            value={editForm.primary_clinic}
                            onChange={e => setEditForm({ ...editForm, primary_clinic: e.target.value })}
                          />
                        ) : (
                          child.primary_clinic || '-'
                        )}
                      </td>

                      <td style={{ padding: '16px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => handleSave(child.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)' }} title="Save">
                              <Check size={20} />
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }} title="Cancel">
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => handleEditClick(child)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }} title="Edit Record">
                            <Edit2 size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
