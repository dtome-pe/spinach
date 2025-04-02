import { Platform } from 'react-native';
import Constants from 'expo-constants';

// When testing on a physical device with Expo Go
// We need to use the special Expo URL format to bypass some mobile restrictions
const DEV_SERVER_URL = '192.168.2.100:3001'; // Your computer's IP and port

// Configuration for server endpoints
export const API_CONFIG = {
  // Use the appropriate URL format based on platform and environment
  baseURL: Platform.select({
    // For web/emulator
    web: 'http://localhost:3001',
    // For iOS simulator
    ios: Constants.appOwnership === 'expo' 
      ? `http://${DEV_SERVER_URL}`  // Expo Go
      : 'http://localhost:3001',    // Standalone app
    // For Android emulator (10.0.2.2 is Android's special IP for host machine)
    android: Constants.appOwnership === 'expo'
      ? `http://${DEV_SERVER_URL}`  // Expo Go
      : 'http://10.0.2.2:3001',     // Standalone app
    // Default for safety
    default: `http://${DEV_SERVER_URL}`,
  }),
};

// For debugging connection issues - log the current URL being used
console.log('🔌 API URL:', API_CONFIG.baseURL);

// Export other configuration values as needed
export default {
  API_CONFIG,
}; 