import { Alert } from 'react-native';
import { API_CONFIG } from '../config';

/**
 * Tests the API connection to the server
 * @returns {Promise<boolean>} True if connection is successful, false otherwise
 */
export const testApiConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing API connection to:', `${API_CONFIG.baseURL}/test`);
    
    const response = await fetch(`${API_CONFIG.baseURL}/test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Server connection test successful:', data);
    return true;
  } catch (error: unknown) {
    console.error('❌ API connection test failed:', error);
    Alert.alert(
      'Connection Error',
      `Failed to connect to the server. Please check your network configuration.\n\nDetails: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
};

// Add a default export
export default {
  testApiConnection,
}; 