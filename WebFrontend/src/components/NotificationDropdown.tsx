import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationService.getUserNotifications();
        setNotifications(res.notifications || []);
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    };
    
    // Initial fetch
    fetchNotifications();

    // Setup polling every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
          padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)'
        }}
      >
        <Bell size={24} color={unreadCount > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)'} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute', top: 4, right: 4, background: 'var(--color-error)',
            color: 'white', fontSize: 10, fontWeight: 'bold', borderRadius: '10px',
            padding: '2px 6px', minWidth: 16, textAlign: 'center'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 8,
          width: 350, maxHeight: 400, backgroundColor: 'white',
          borderRadius: 'var(--radius-md)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            backgroundColor: '#F8FAFC'
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--color-text-dark)' }}>Notifications</h3>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: 0 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <Bell size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
                <p style={{ margin: 0 }}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkAsRead(notif.id)}
                  style={{
                    padding: '12px 16px', borderBottom: '1px solid var(--color-border)',
                    backgroundColor: notif.is_read ? 'white' : '#F0F9FA',
                    cursor: notif.is_read ? 'default' : 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: notif.is_read ? 500 : 700, color: 'var(--color-text-dark)' }}>
                      {notif.title}
                    </h4>
                    {!notif.is_read && <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'var(--color-primary)', marginTop: 4 }} />}
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
                    <Clock size={12} style={{ marginRight: 4 }} />
                    {formatDate(notif.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
