import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Platform-aware storage wrapper.
 * Uses expo-secure-store on native (iOS/Android) and localStorage on web.
 */
const storage = {
  getItem(key) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItem(key);
  },

  setItem(key, value) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    SecureStore.setItem(key, value);
  },

  deleteItem(key) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    SecureStore.deleteItem(key);
  },
};

export default storage;
