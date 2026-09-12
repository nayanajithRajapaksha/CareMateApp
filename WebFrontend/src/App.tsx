import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PHMDashboard } from './pages/PHMDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { MOHDashboard } from './pages/MOHDashboard';

// A component that redirects users to their respective dashboards based on role
const RoleBasedRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const role = user.role.toLowerCase();
  if (role === 'phm' || role === 'midwife') return <Navigate to="/phm" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'moh' || role === 'supervisor') return <Navigate to="/moh" replace />;
  if (role === 'parent') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Welcome Parent / Guardian</h2>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Your parent portal is linked. Please use the CareMate Mobile App for full child growth and vaccination tracking features.
        </p>
      </div>
    );
  }

  return <div>Unknown role</div>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<AppLayout />}>
            <Route path="/" element={<RoleBasedRedirect />} />
            <Route path="/phm/*" element={<PHMDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/moh/*" element={<MOHDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
