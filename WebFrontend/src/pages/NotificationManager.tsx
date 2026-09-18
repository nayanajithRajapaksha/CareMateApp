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
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary-500" />
            Notification Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Configure when automated reminders should be sent and manually trigger them if needed.
          </p>
        </div>
        
        <button
          onClick={handleTriggerNow}
          disabled={triggering}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {triggering ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
          ) : (
            <BellRing className="h-5 w-5" />
          )}
          {triggering ? 'Triggering...' : 'Trigger Reminders Now'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
        } animate-in slide-in-from-top-2`}>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Reminder Intervals</h2>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="number"
              min="1"
              value={newDays}
              onChange={(e) => setNewDays(e.target.value)}
              placeholder="Days before"
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-32 dark:text-white"
            />
            <button
              onClick={handleAddInterval}
              className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {settings.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No reminder intervals configured. Add one above.
            </div>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold">
                    {setting.days_before}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {setting.days_before} Day{setting.days_before !== 1 ? 's' : ''} Before
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reminders will be sent {setting.days_before} day{setting.days_before !== 1 ? 's' : ''} prior to the appointment.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveInterval(setting.days_before)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Remove interval"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
