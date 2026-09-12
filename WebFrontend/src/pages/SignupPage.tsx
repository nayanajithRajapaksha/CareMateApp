import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { authService } from '../services/authService';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.registerPHM({ 
        email, 
        password, 
        full_name: fullName, 
        contact_number: contactNumber 
      });
      setSuccess('Registration successful! You will be redirected to login.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Left branding pane */}
      <div style={{ flex: 1, backgroundColor: 'var(--color-primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', padding: 40 }}>
        <Activity size={64} style={{ marginBottom: 24 }} />
        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Join CareMate</h1>
        <p style={{ fontSize: 18, opacity: 0.9, textAlign: 'center', maxWidth: 400 }}>
          Public Health Midwives can register here. Once registered, your MOH Supervisor will assign you to a hospital.
        </p>
      </div>
      
      {/* Right signup pane */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
          <h2 className="text-h2" style={{ marginBottom: 8 }}>PHM Registration</h2>
          <p className="text-body" style={{ marginBottom: 32 }}>Create your account to access the staff portal.</p>
          
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
                placeholder="e.g. Jane Doe"
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
                placeholder="e.g. jane.doe@caremate.gov"
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
              style={{ width: '100%', padding: '12px' }}
              disabled={isLoading || !!success}
            >
              {isLoading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
