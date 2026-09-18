import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key } from 'lucide-react';
import logo from '../assets/logo.png';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.forgotPassword({ email });
      setSuccess('If that email is in our system, we have sent a reset code.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await authService.resetPassword({ email, token, newPassword });
      setSuccess('Password has been reset successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your code and try again.');
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
          Secure account recovery for Public Health Midwives, MOH Officers, and Administrators.
        </p>
      </div>

      {/* Right reset pane */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
        <div className="card animate-fade-in" style={{ width: '100%', maxWidth: 420 }}>
          <h2 className="text-h2" style={{ marginBottom: 8 }}>Password Recovery</h2>
          <p className="text-body" style={{ marginBottom: 32 }}>
            {step === 1 ? 'Enter your email to receive a reset code.' : 'Enter the code sent to your email and your new password.'}
          </p>

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

          {step === 1 ? (
            <form onSubmit={handleSendCode}>
              <div className="input-group" style={{ marginBottom: 32 }}>
                <label className="input-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="email"
                    className="input-field"
                    style={{ paddingLeft: 38 }}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="e.g. user@caremate.gov"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isLoading}>
                {isLoading ? 'Sending Code...' : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="input-group" style={{ marginBottom: 20 }}>
                <label className="input-label">Reset Code (6 digits)</label>
                <div style={{ position: 'relative' }}>
                  <Key size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="text"
                    className="input-field"
                    style={{ paddingLeft: 38, letterSpacing: '4px', fontWeight: 600 }}
                    value={token}
                    onChange={e => setToken(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="123456"
                  />
                </div>
              </div>
              
              <div className="input-group" style={{ marginBottom: 32 }}>
                <label className="input-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input
                    type="password"
                    className="input-field"
                    style={{ paddingLeft: 38 }}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={isLoading}>
                {isLoading ? 'Resetting Password...' : 'Reset Password'}
              </button>
              
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '12px', marginTop: 12 }} 
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </form>
          )}

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
            Remembered your password? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Sign In here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
