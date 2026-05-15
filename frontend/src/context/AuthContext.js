import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as loginAPI, register as registerAPI, updatePassword as updatePasswordAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const clearMessages = () => { setError(null); setSuccess(null); };

  const persist = (data) => {
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const login = async (credentials) => {
    setLoading(true); clearMessages();
    try {
      const { data } = await loginAPI(credentials);
      persist(data);
      setSuccess('Logged in successfully!');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true); clearMessages();
    try {
      const { data } = await registerAPI(userData);
      persist(data);
      setSuccess('Account created successfully!');
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (passwords) => {
    setLoading(true); clearMessages();
    try {
      await updatePasswordAPI(passwords);
      setSuccess('Password updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Called by Axios 401 interceptor via custom event — clears session silently
  const logout = useCallback((expired = false) => {
    localStorage.removeItem('user');
    setUser(null);
    if (expired) setError('Session expired. Please log in again.');
  }, []);

  // Listen for the event fired by the Axios interceptor
  useEffect(() => {
    const handler = (e) => logout(e.detail?.expired);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user, loading, error, success,
      login, register, logout, updatePassword, clearMessages,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
