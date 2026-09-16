import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  hospital?: string;
}


interface AuthContextType {
  user: User | null;
  activeHospital: string | null;
  setActiveHospital: (hospital: string) => void;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
  updateUser: (newData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeHospital, setActiveHospital] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('webToken');
    const storedUser = localStorage.getItem('webUser');

    if (token && storedUser) {
      const cachedUser = JSON.parse(storedUser);
      setUser(cachedUser);
      if (cachedUser.hospital) {
        setActiveHospital(cachedUser.hospital.split(',')[0].trim());
      }
      authService.getProfile()
        .then(({ profile }) => {
          const currentUser = { ...cachedUser, ...profile };
          localStorage.setItem('webUser', JSON.stringify(currentUser));
          setUser(currentUser);
          if (currentUser.hospital) {
            setActiveHospital(prev => prev || currentUser.hospital.split(',')[0].trim());
          }
        })
        .catch(() => undefined);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: any) => {
    const data = await authService.login(credentials);
    
    if (data.token && data.user) {
      localStorage.setItem('webToken', data.token);
      localStorage.setItem('webUser', JSON.stringify(data.user));
      setUser(data.user);
      if (data.user.hospital) {
        setActiveHospital(data.user.hospital.split(',')[0].trim());
      }
    } else {
      throw new Error('Invalid login response');
    }
  };

  const logout = () => {
    localStorage.removeItem('webToken');
    localStorage.removeItem('webUser');
    setUser(null);
    setActiveHospital(null);
  };

  const updateUser = (newData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...newData };
      localStorage.setItem('webUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, activeHospital, setActiveHospital, loading, login, logout, updateUser }}>
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
