import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
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
      const storedToken = await SecureStore.getItemAsync('token');
      if (storedToken) {
        setToken(storedToken);
        // Validate token by fetching user profile
        const { data } = await getMe();
        setUser(data);
      }
    } catch (e) {
      console.log('Restoring token failed', e);
      await SecureStore.deleteItemAsync('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    setUser(data.user);
    setToken(data.token);
    await SecureStore.setItemAsync('token', data.token);
  };

  const signup = async (email, password, username) => {
    const { data } = await apiSignup({ email, password, username });
    setUser(data.user);
    setToken(data.token);
    await SecureStore.setItemAsync('token', data.token);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
