import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { BACKEND_URL } from '@env';

// Debug logging
console.log('Raw BACKEND_URL from env:', BACKEND_URL);
console.log('Platform:', Platform.OS);

// When testing on a physical device with Expo Go
// We need to use the special Expo URL format to bypass some mobile restrictions
const DEFAULT_URL = 'http://192.168.2.100:3001';
const DEV_SERVER_URL = BACKEND_URL || DEFAULT_URL;

// Log the server URL being used
console.log('DEV_SERVER_URL:', DEV_SERVER_URL);

// Configuration for server endpoints
export const API_CONFIG = {
  // Use the appropriate URL format based on platform and environment
  baseURL: Platform.select({
    // For web/emulator
    web: BACKEND_URL || 'http://localhost:3001',
    // For iOS
    ios: DEV_SERVER_URL,
    // For Android
    android: DEV_SERVER_URL,
    // Default for safety
    default: DEV_SERVER_URL,
  }),
};

// For debugging connection issues - log the current URL being used
console.log('🔌 Final API URL:', API_CONFIG.baseURL);

// Export other configuration values as needed
export default {
  API_CONFIG,
}; 