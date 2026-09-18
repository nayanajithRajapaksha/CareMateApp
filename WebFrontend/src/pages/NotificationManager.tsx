import React, { useState, useEffect } from 'react';
import { notificationService, type NotificationSetting } from '../services/notificationService';
import { Bell, BellRing, Plus, Trash2, CalendarClock } from 'lucide-react';

export const NotificationManager: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSetting[]>([]);
  const [newDays, setNewDays] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [triggering, setTriggering] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getSettings();
      setSettings(data.settings);
    } catch (err) {
      showMessage('error', 'Failed to load notification settings.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAddInterval = async () => {
    const days = parseInt(newDays, 10);
    if (isNaN(days) || days <= 0) {
      showMessage('error', 'Please enter a valid positive number of days.');
      return;
    }
    if (settings.some(s => s.days_before === days)) {
      showMessage('error', 'This interval already exists.');
      return;
    }

    try {
      const newIntervals = [...settings.map(s => s.days_before), days];
      const data = await notificationService.updateSettings(newIntervals);
      setSettings(data.settings);
      setNewDays('');
      showMessage('success', 'Notification interval added successfully.');
    } catch (err) {
      showMessage('error', 'Failed to add notification interval.');
    }
  };

  const handleRemoveInterval = async (daysToRemove: number) => {
    if (!window.confirm(`Are you sure you want to remove the ${daysToRemove}-day reminder?`)) return;
    
    try {
      const newIntervals = settings.filter(s => s.days_before !== daysToRemove).map(s => s.days_before);
      const data = await notificationService.updateSettings(newIntervals);
      setSettings(data.settings);
      showMessage('success', 'Notification interval removed successfully.');
    } catch (err) {
      showMessage('error', 'Failed to remove notification interval.');
    }
  };

  const handleTriggerNow = async () => {
    if (!window.confirm('This will manually trigger the reminder process now. Proceed?')) return;
    
    try {
      setTriggering(true);
      await notificationService.triggerReminders();
      showMessage('success', 'Reminders triggered successfully!');
    } catch (err) {
      showMessage('error', 'Failed to trigger reminders manually.');
    } finally {
      setTriggering(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: 40 }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ padding: '0', maxWidth: 850, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell color="var(--color-primary)" size={26} />
            Notification Management
          </h2>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
            Configure when automated reminders should be sent and manually trigger them if needed.
          </p>
        </div>
        
        <button
          onClick={handleTriggerNow}
          disabled={triggering}
          className="btn btn-primary"
          style={{ height: 42, padding: '0 20px' }}
        >
          {triggering ? (
            <div style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : (
            <BellRing size={16} />
          )}
          {triggering ? 'Triggering...' : 'Trigger Reminders Now'}
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: 'var(--radius-sm)', 
          marginBottom: 24, 
          fontSize: 14,
          backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'
        }}>
          {message.text}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid var(--color-border)', paddingBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CalendarClock color="var(--color-text-muted)" size={22} />
            <h4 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Reminder Intervals</h4>
          </div>
          
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              min="1"
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              placeholder="Days before"
              className="input-field"
              style={{ width: 130, padding: '8px 12px' }}
            />
            <button
              onClick={handleAddInterval}
              className="btn btn-primary"
              style={{ padding: '8px 16px' }}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div>
          {settings.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              No reminder intervals configured. Add one above.
            </div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ height: 42, width: 42, borderRadius: '50%', backgroundColor: 'rgba(22, 121, 121, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16 }}>
                    {setting.days_before}
                  </div>
                  <div>
                    <h5 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
                      {setting.days_before} Day{setting.days_before !== 1 ? 's' : ''} Before
                    </h5>
                    <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                      Reminders will be sent {setting.days_before} day{setting.days_before !== 1 ? 's' : ''} prior to the appointment.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveInterval(setting.days_before)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title="Remove interval"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
