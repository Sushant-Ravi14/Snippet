// Use localhost for Android emulator (10.0.2.2) or iOS simulator (localhost)
// You might need to change this to your computer's local IP address if testing on a physical device.
import { Platform } from 'react-native';

const HOST = Platform.OS === 'android' ? '192.168.1.75' : '192.168.1.75';
export const API_BASE_URL = `http://${HOST}:5000/api`;
export const UPLOADS_BASE_URL = `http://${HOST}:5000`;

export const PAGE_SIZE = 10;

export const COLORS = {
  primary: '#0a7ea4',
  background: '#ffffff',
  text: '#11181C',
  textMuted: '#687076',
  border: '#e6e8eb',
  error: '#ff4d4f',
  success: '#52c41a',
  surface: '#f8f9fa',
};
