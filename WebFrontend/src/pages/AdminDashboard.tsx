import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { authService } from '../services/authService';

export const AdminDashboard: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.registerMOH({ 
        email, 
        password, 
        full_name: fullName, 
        contact_number: contactNumber 
      });
      setSuccess('MOH Supervisor successfully created.');
      setEmail('');
      setPassword('');
      setFullName('');
      setContactNumber('');
    } catch (err: any) {
      setError(err.message || 'Failed to create MOH supervisor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-h2" style={{ marginBottom: 24 }}>System Administration</h3>
      
      <div className="card" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ backgroundColor: 'rgba(22, 121, 121, 0.1)', padding: 12, borderRadius: 8, marginRight: 16 }}>
            <UserPlus color="var(--color-primary)" size={24} />
          </div>
          <h4 style={{ fontSize: 18, fontWeight: 600 }}>Register MOH Supervisor</h4>
        </div>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: 14 }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
              placeholder="e.g. Dr. John Smith"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="e.g. john.smith@moh.gov"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Contact Number (Optional)</label>
            <input 
              type="tel" 
              className="input-field" 
              value={contactNumber}
              onChange={e => setContactNumber(e.target.value)}
              placeholder="e.g. 0712345678"
            />
          </div>

          <div className="input-group" style={{ marginBottom: 32 }}>
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '12px 24px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Supervisor'}
          </button>
        </form>
      </div>
    </div>
  );
};
