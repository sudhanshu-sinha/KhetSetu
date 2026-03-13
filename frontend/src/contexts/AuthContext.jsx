import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('khetsetu-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('khetsetu-token'));

  useEffect(() => {
    const token = localStorage.getItem('khetsetu-token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('khetsetu-user', JSON.stringify(data.user));
      setIsAuthenticated(true);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (phone) => {
    const { data } = await api.post('/auth/send-otp', { phone });
    return data;
  };

  const verifyOtp = async (phone, otp) => {
    const { data } = await api.post('/auth/verify-otp', { phone, otp });
    localStorage.setItem('khetsetu-token', data.accessToken);
    localStorage.setItem('khetsetu-refresh-token', data.refreshToken);
    localStorage.setItem('khetsetu-user', JSON.stringify(data.user));
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser(data.user);
    localStorage.setItem('khetsetu-user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    localStorage.removeItem('khetsetu-token');
    localStorage.removeItem('khetsetu-refresh-token');
    localStorage.removeItem('khetsetu-user');
    setUser(null);
    setIsAuthenticated(false);
    api.post('/auth/logout').catch(() => {});
  };

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated, sendOtp, verifyOtp, updateProfile, logout, fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
