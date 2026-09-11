import React, { createContext, useState, useEffect, useContext } from 'react';
import storage from '../utils/storage';
import { getMe, login as apiLogin, signup as apiSignup } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const storedToken = await storage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        // Validate token by fetching user profile
        const { data } = await getMe();
        setUser(data);
      }
    } catch (e) {
      console.log('Restoring token failed', e);
      await storage.deleteItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    setUser(data.user);
    setToken(data.token);
    await storage.setItem('token', data.token);
  };

  const signup = async (email, password) => {
    const { data } = await apiSignup({ email, password });
    setUser(data.user);
    setToken(data.token);
    await storage.setItem('token', data.token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.deleteItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
