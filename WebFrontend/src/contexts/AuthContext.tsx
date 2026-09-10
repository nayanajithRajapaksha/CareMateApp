import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ideally we would fetch user profile here if a token exists
    const token = localStorage.getItem('webToken');
    const storedUser = localStorage.getItem('webUser');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const data = await authService.login(credentials);
    
    if (data.token && data.user) {
      localStorage.setItem('webToken', data.token);
      localStorage.setItem('webUser', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      throw new Error('Invalid login response');
    }
  };

  const logout = () => {
    localStorage.removeItem('webToken');
    localStorage.removeItem('webUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
