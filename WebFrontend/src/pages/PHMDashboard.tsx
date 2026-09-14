import React, { useState, useEffect } from 'react';
import { Users, Edit2, Check, X, Search, Building2, Phone, Baby, UserCheck } from 'lucide-react';
import { phmService } from '../services/phmService';
import { staffService } from '../services/staffService';
import { clinicService } from '../services/clinicService';
import { useAuth } from '../contexts/AuthContext';
import { type Clinic } from './ClinicManager';

type PHMTab = 'children' | 'parents';

interface ParentUser {
  profile_id: string;
  email: string;
  full_name: string;
  contact_number?: string;
  hospital?: string;
  created_at?: string;
  children_count?: number;
}

export const PHMDashboard: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<PHMTab>('children');
  const [children, setChildren] = useState<any[]>([]);
  const [parents, setParents] = useState<ParentUser[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing Midwife's Own Hospital
  const [midwifeHospital, setMidwifeHospital] = useState(user?.hospital || '');
  const [isEditingFacility, setIsEditingFacility] = useState(false);
  const [updatingFacility, setUpdatingFacility] = useState(false);

  // Edit Child State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [childSearch, setChildSearch] = useState('');

  // Parent Assignment State
  const [parentSearch, setParentSearch] = useState('');
  const [assigningParentId, setAssigningParentId] = useState<string | null>(null);
  const [selectedParentClinic, setSelectedParentClinic] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [childrenData, clinicsData, parentsData] = await Promise.all([
        phmService.getAllChildren(),
        clinicService.getAll(),
        staffService.getParents()
      ]);

      setChildren(childrenData.children || []);
      setClinics(clinicsData || []);
      setParents(parentsData.parents || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch midwife dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Midwife facility update
  const handleUpdateMidwifeFacility = async () => {
    if (!user?.id || !midwifeHospital.trim()) {
      alert('Please select a clinic/hospital.');
      return;
    }

    setUpdatingFacility(true);
    try {
      await staffService.assignHospital(user.id, midwifeHospital);
      alert('Assigned hospital updated successfully!');
      setIsEditingFacility(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update hospital assignment.');
    } finally {
      setUpdatingFacility(false);
    }
  };

  // Handle Parent clinic update
  const handleAssignParentClinic = async (profileId: string) => {
    if (!selectedParentClinic.trim()) {
      alert('Please select a clinic/hospital.');
      return;
    }

    try {
      await staffService.assignParentHospital(profileId, selectedParentClinic);
      setParents(parents.map(p => p.profile_id === profileId ? { ...p, hospital: selectedParentClinic } : p));
      setAssigningParentId(null);
      setSelectedParentClinic('');
      alert('Parent clinic assigned successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to assign parent clinic.');
    }
  };

  // Edit Child handlers
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

  const handleSaveChild = async (childId: string) => {
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
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to update child.');
    }
  };

  const filteredChildren = children.filter(c => 
    c.full_name.toLowerCase().includes(childSearch.toLowerCase()) || 
    (c.birth_cert_number && c.birth_cert_number.toLowerCase().includes(childSearch.toLowerCase()))
  );

  const filteredParents = parents.filter(p =>
    (p.full_name?.toLowerCase() || '').includes(parentSearch.toLowerCase()) ||
    (p.email?.toLowerCase() || '').includes(parentSearch.toLowerCase()) ||
    (p.contact_number?.toLowerCase() || '').includes(parentSearch.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      {/* Midwife Profile & Facility Banner */}
      <div className="card" style={{ marginBottom: 24, padding: 20, background: 'linear-gradient(135deg, rgba(22,121,121,0.08) 0%, rgba(13,99,93,0.04) 100%)', border: '1px solid rgba(22,121,121,0.2)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ backgroundColor: 'var(--color-primary)', padding: 14, borderRadius: '50%', color: '#fff' }}>
              <UserCheck size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Public Health Midwife Portal</h3>
              <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'var(--color-surface)', padding: '8px 14px', borderRadius: 20, border: '1px solid var(--color-border)' }}>
              <Building2 size={18} color="var(--color-primary)" />
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                {midwifeHospital ? midwifeHospital : <span style={{ color: 'var(--color-warning)' }}>No Facility Assigned</span>}
              </span>
            </div>

            {isEditingFacility ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="input-field"
                  value={midwifeHospital}
                  onChange={e => setMidwifeHospital(e.target.value)}
                  style={{ padding: '6px 10px', fontSize: 13 }}
                >
                  <option value="">Select Hospital/Clinic...</option>
                  {clinics.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={handleUpdateMidwifeFacility} disabled={updatingFacility}>
                  Save
                </button>
                <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setIsEditingFacility(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 14 }} onClick={() => setIsEditingFacility(true)}>
                Change Facility
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 12 }}>
        <button
          className={`btn ${activeTab === 'children' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setActiveTab('children')}
        >
          <Baby size={18} /> Children Directory ({children.length})
        </button>

        <button
          className={`btn ${activeTab === 'parents' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 20px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => setActiveTab('parents')}
        >
          <Users size={18} /> Parent & Clinic Directory ({parents.length})
        </button>
      </div>

      {/* Tab 1: Children Directory */}
      {activeTab === 'children' ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Children Records</h4>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by child name or birth cert..." 
                value={childSearch}
                onChange={e => setChildSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>
          
          {loading ? (
            <p>Loading children records...</p>
          ) : error ? (
            <p style={{ color: 'var(--color-error)' }}>{error}</p>
          ) : filteredChildren.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No children found matching criteria.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', backgroundColor: 'var(--color-bg)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Child Profile</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>DOB & Gender</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Birth Weight (kg)</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Blood Group</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Primary Clinic</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChildren.map(child => {
                    const isEditing = editingId === child.id;

                    return (
                      <tr key={child.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{child.full_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Cert: {child.birth_cert_number || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div>{new Date(child.dob).toLocaleDateString()}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{child.gender}</div>
                        </td>
                        
                        <td style={{ padding: '14px 16px' }}>
                          {isEditing ? (
                            <input 
                              type="number" 
                              className="input-field" 
                              step="0.1"
                              style={{ padding: '6px 8px', width: 90 }}
                              value={editForm.birth_weight_kg}
                              onChange={e => setEditForm({ ...editForm, birth_weight_kg: e.target.value })}
                            />
                          ) : (
                            child.birth_weight_kg
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {isEditing ? (
                            <input 
                              type="text" 
                              className="input-field" 
                              style={{ padding: '6px 8px', width: 80 }}
                              value={editForm.blood_group}
                              onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}
                            />
                          ) : (
                            child.blood_group
                          )}
                        </td>

                        <td style={{ padding: '14px 16px' }}>
                          {isEditing ? (
                            <select
                              className="input-field"
                              style={{ padding: '6px 8px', fontSize: 13 }}
                              value={editForm.primary_clinic}
                              onChange={e => setEditForm({ ...editForm, primary_clinic: e.target.value })}
                            >
                              <option value="">Select Clinic...</option>
                              {clinics.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            child.primary_clinic ? (
                              <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>{child.primary_clinic}</span>
                            ) : (
                              <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                            )
                          )}
                        </td>

                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                              <button onClick={() => handleSaveChild(child.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-success)' }} title="Save">
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
      ) : (
        /* Tab 2: Parent & Clinic Directory */
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Registered Parents & Family Clinic Assignments</h4>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search parent by name, email, or phone..." 
                value={parentSearch}
                onChange={e => setParentSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          {loading ? (
            <p>Loading parent profiles...</p>
          ) : filteredParents.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No parent profiles found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left', backgroundColor: 'var(--color-bg)' }}>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Parent Profile</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Contact Info</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Children Registered</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned Clinic / Hospital</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParents.map((p) => (
                    <tr key={p.profile_id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{p.full_name || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{p.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.contact_number ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Phone size={14} color="var(--color-text-muted)" /> {p.contact_number}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Baby size={16} color="var(--color-primary)" />
                          <span style={{ fontWeight: 600 }}>{p.children_count || 0}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.hospital ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontWeight: 600 }}>
                            <Building2 size={16} /> {p.hospital}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-warning)', fontWeight: 500 }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {assigningParentId === p.profile_id ? (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <select
                              className="input-field"
                              value={selectedParentClinic}
                              onChange={e => setSelectedParentClinic(e.target.value)}
                              style={{ padding: '6px 10px', minWidth: 180, fontSize: 13 }}
                            >
                              <option value="">Select Clinic...</option>
                              {clinics.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </select>
                            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => handleAssignParentClinic(p.profile_id)}>Save</button>
                            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => { setAssigningParentId(null); setSelectedParentClinic(''); }}>Cancel</button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', fontSize: 13 }}
                            onClick={() => { setAssigningParentId(p.profile_id); setSelectedParentClinic(p.hospital || ''); }}
                          >
                            {p.hospital ? 'Change Clinic' : 'Assign Clinic'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
