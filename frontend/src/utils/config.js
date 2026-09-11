// Use localhost for Android emulator (10.0.2.2) or iOS simulator (localhost)
// You might need to change this to your computer's local IP address if testing on a physical device.
import { Platform } from 'react-native';

const getHost = () => {
  if (Platform.OS === 'web') return 'localhost';
  // Use the laptop's local LAN IP so physical phones on the same WiFi can connect
  return '192.168.1.75';
};

export const API_BASE_URL = `https://snippet-j541.onrender.com/api`;
export const UPLOADS_BASE_URL = `https://snippet-j541.onrender.com`;

export const PAGE_SIZE = 10;

export const COLORS = {
  primary: '#3B82F6',
  background: '#121212',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  border: '#2C2C2C',
  error: '#EF4444',
  success: '#22C55E',
  surface: '#1E1E1E',
};
