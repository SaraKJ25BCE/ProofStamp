import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();

    const handlePageShow = (e) => {
      if (e.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  async function fetchUser() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setPassport(res.data.passport);
    } catch {
      setUser(null);
      setPassport(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }

  async function login() {
    await fetchUser();
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // ignore error on logout
    }
    localStorage.removeItem('token');
    setUser(null);
    setPassport(null);
    window.location.replace('/login');
  }

  return (
    <AuthContext.Provider value={{ user, passport, loading, login, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
