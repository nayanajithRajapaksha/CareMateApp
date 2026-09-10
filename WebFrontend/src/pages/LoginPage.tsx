import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/') {
        navigate(from, { replace: true });
      } else {
        // We need to parse user role after login to redirect properly.
        // Wait for context to update (this is a simplified approach)
        window.location.href = '/'; 
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Left branding pane */}
      <div style={{ flex: 1, backgroundColor: 'var(--color-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', padding: 40 }}>
        <Activity size={64} style={{ marginBottom: 24 }} />
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>CareMate Portal</h1>
        <p style={{ fontSize: 18, opacity: 0.9, textAlign: 'center', maxWidth: 400 }}>
          Centralized management for Public Health Midwives, Supervisors, and Administrators.
        </p>
      </div>
      
      {/* Right login pane */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
          <h2 className="text-h2" style={{ marginBottom: 8 }}>Staff Login</h2>
          <p className="text-body" style={{ marginBottom: 32 }}>Enter your credentials to access the portal.</p>
          
          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: 24, fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="e.g. jane.doe@caremate.gov"
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
              style={{ width: '100%', padding: '12px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
            Are you a new Midwife? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign Up here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
