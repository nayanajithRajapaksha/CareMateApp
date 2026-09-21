jjjjjjjjjjjjvvvvvvvvvvvcimport React from 'react';
import { Shield, Edit2, Trash2 } from 'lucide-react';
import type { Vaccine } from '../services/vaccineService';

interface VaccineTableProps {
  groups: Vaccine[][];
  onEdit: (group: Vaccine[]) => void;
  onDelete: (name: string) => void;
}

export const VaccineTable: React.FC<VaccineTableProps> = ({ groups, onEdit, onDelete }) => {
  return (
    <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <tr>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Vaccine Name</th>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Doses</th>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Age Range</th>
            <th style={{ padding: '16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No vaccines found.
              </td>
            </tr>
          ) : (
            groups.map(group => {
              const sorted = [...group].sort((a, b) => (a.dose_number || 1) - (b.dose_number || 1));
              const name = sorted[0].name;
              const totalDoses = sorted.length;
              const firstAge = sorted[0].recommended_age_months;
              const lastAge = sorted[totalDoses - 1].recommended_age_months;

              return (
                <tr key={name} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ backgroundColor: 'rgba(22, 121, 121, 0.1)', padding: 8, borderRadius: 8 }}>
                        <Shield size={20} color="var(--color-primary)" />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-dark)' }}>{name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                    {totalDoses} {totalDoses === 1 ? 'Dose' : 'Doses'}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                    {firstAge === lastAge ? `${firstAge} months` : `${firstAge} - ${lastAge} months`}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px' }}
                        onClick={() => onEdit(group)}
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', color: '#EF4444', borderColor: '#FEE2E2', backgroundColor: '#FEF2F2' }}
                        onClick={() => onDelete(name)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
