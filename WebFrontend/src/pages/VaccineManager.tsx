import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { vaccineService, type Vaccine } from '../services/vaccineService';
import { VaccineTable } from '../components/VaccineTable';
import { VaccineModal } from '../components/VaccineModal';

export const VaccineManager: React.FC = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [initialGroupData, setInitialGroupData] = useState<Vaccine[]>([]);

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

  const groupedVaccines = Object.values(
    vaccines.reduce((acc, v) => {
      if (!acc[v.name]) acc[v.name] = [];
      acc[v.name].push(v);
      return acc;
    }, {} as Record<string, Vaccine[]>)
  );

  const filteredGroups = groupedVaccines.filter(g => g[0].name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openModal = (group?: Vaccine[]) => {
    if (group) {
      setEditingGroup(group[0].name);
      setInitialGroupData(group);
    } else {
      setEditingGroup(null);
      setInitialGroupData([]);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (name: string) => {
    if (window.confirm(`Are you sure you want to delete the vaccine group "${name}"? This will delete all its doses.`)) {
      try {
        await vaccineService.deleteVaccineGroup(name);
        fetchVaccines();
      } catch (err: any) {
        alert(err?.response?.data?.error || 'Cannot delete vaccine. It may have already been administered.');
        console.error(err);
      }
    }
  };

  const handleSaved = () => {
    setIsModalOpen(false);
    fetchVaccines();
  };

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
        <VaccineTable 
          groups={filteredGroups} 
          onEdit={openModal} 
          onDelete={handleDelete} 
        />
      )}

      <VaccineModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        editingGroup={editingGroup}
        initialGroupData={initialGroupData}
      />
    </div>
  );
};
