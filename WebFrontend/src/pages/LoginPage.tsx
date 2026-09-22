import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, UserCheck, Stethoscope, Users } from 'lucide-react';
import logo from '../assets/logo.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

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
        <img src={logo} alt="CareMate Logo" style={{ marginBottom: 24, width: '128px', height: '128px', objectFit: 'contain' }} />
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>CareMate Portal</h1>
        <p style={{ fontSize: 18, opacity: 0.9, textAlign: 'center', maxWidth: 400 }}>
          Centralized management for Public Health Midwives, MOH Officers, Parents, and System Administrators.
        </p>

        {/* Quick Demo Login Badges */}
        <div style={{ marginTop: 40, width: '100%', maxWidth: 420, backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: 20, border: '1px solid rgba(255, 255, 255, 0.2)' }}>
          <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, opacity: 0.9, textAlign: 'center' }}>
            Quick Demo Logins (Click to autofill)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@caremate.gov', 'Admin@123')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
            >
              <ShieldCheck size={16} /> Admin
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('moh@caremate.gov', 'Moh@123')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
            >
              <UserCheck size={16} /> MOH Officer
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('midwife@caremate.gov', 'Midwife@123')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
            >
              <Stethoscope size={16} /> Midwife (PHM)
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('parent@caremate.gov', 'Parent@123')}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 8, color: 'white', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
            >
              <Users size={16} /> Parent
            </button>
          </div>
        </div>
      </div>

      {/* Right login pane */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
          <h2 className="text-h2" style={{ marginBottom: 8 }}>Portal Login</h2>
          <p className="text-body" style={{ marginBottom: 32 }}>Enter your credentials to access your dashboard.</p>

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
                placeholder="e.g. admin@caremate.gov"
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
