import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { vaccineService, type ChildVaccinationTimeline } from '../services/vaccineService';

interface VaccinationCardModalProps {
  childId: string;
  childName: string;
  onClose: () => void;
}

export const VaccinationCardModal: React.FC<VaccinationCardModalProps> = ({ childId, childName, onClose }) => {
  const [timeline, setTimeline] = useState<ChildVaccinationTimeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTimeline = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await vaccineService.getChildVaccinations(childId);
      setTimeline(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vaccination timeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [childId]);

  const handleToggleVaccine = async (vaccineId: string, status: string, recordId?: string) => {
    try {
      if (status === 'Upcoming') {
        const today = new Date().toISOString().split('T')[0];
        await vaccineService.markVaccineAdministered(childId, vaccineId, today);
      } else if (status === 'Completed' && recordId) {
        if (!window.confirm('Are you sure you want to remove this vaccination record?')) return;
        await vaccineService.removeVaccineRecord(childId, recordId);
      }
      // Refresh the timeline
      fetchTimeline();
    } catch (err: any) {
      alert(err.message || 'Failed to update vaccination status');
    }
  };

  // Sort timeline by date if available, else by recommended age
  const list = (timeline?.timeline || []).slice().sort((a, b) => {
    const dateA = a.administered_date || a.scheduled_date;
    const dateB = b.administered_date || b.scheduled_date;
    if (dateA && dateB) {
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    }
    return a.recommended_age_months - b.recommended_age_months;
  });

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 className="text-h2" style={{ fontSize: 20, margin: 0 }}>Vaccination Card</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '4px 0 0' }}>{childName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading timeline...</div>
        ) : error ? (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '12px 16px', borderRadius: 8 }}>
            <AlertCircle size={18} style={{ marginBottom: 4 }} />
            {error}
          </div>
        ) : list.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>No vaccination records found.</div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: 8 }}>
            <div style={{ position: 'relative', paddingLeft: 24 }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 9, top: 20, bottom: 20, width: 2, backgroundColor: 'var(--color-border)' }} />

              {list.map((item, index) => (
                <div key={`${item.id}-${index}`} style={{ display: 'flex', gap: 16, marginBottom: 24, position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', left: -24, top: 4, 
                    backgroundColor: 'var(--color-bg)', padding: 2, borderRadius: '50%'
                  }}>
                    {item.status === 'Completed' ? (
                      <CheckCircle size={20} color="var(--color-success)" fill="rgba(16, 185, 129, 0.2)" />
                    ) : (
                      <Circle size={20} color="var(--color-text-muted)" fill="var(--color-bg)" />
                    )}
                  </div>

                  <div 
                    onClick={() => handleToggleVaccine(item.id, item.status, item.record_id || undefined)}
                    style={{ 
                      flex: 1, 
                      backgroundColor: item.status === 'Completed' ? 'rgba(16, 185, 129, 0.05)' : 'var(--color-surface)',
                      border: `1px solid ${item.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'var(--color-border)'}`,
                      padding: 16,
                      borderRadius: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.borderColor = item.status === 'Completed' ? 'var(--color-error)' : 'var(--color-primary)'}
                    onMouseOut={e => e.currentTarget.style.borderColor = item.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : 'var(--color-border)'}
                    title={item.status === 'Completed' ? 'Click to un-mark' : 'Click to mark as administered today'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: item.status === 'Completed' ? 'var(--color-success)' : 'var(--color-text-dark)' }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: 12, fontWeight: 600, color: item.status === 'Completed' ? 'var(--color-success)' : 'var(--color-text-muted)', backgroundColor: item.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'var(--color-bg)', padding: '4px 8px', borderRadius: 12 }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                      {item.status === 'Completed' ? 'Administered: ' : 'Scheduled: '}
                      {item.administered_date 
                        ? new Date(item.administered_date).toLocaleDateString()
                        : item.scheduled_date 
                          ? new Date(item.scheduled_date).toLocaleDateString() 
                          : 'Not scheduled'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
