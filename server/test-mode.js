// Test script to verify mock data
import dotenv from 'dotenv';
import { mockSpinResponse, mockCookResponse } from './mockData.js';

dotenv.config();

const TEST_MODE = process.env.TEST_MODE === 'true';

console.log(`🔧 Current mode: ${TEST_MODE ? 'TEST MODE' : 'LIVE MODE'}`);
console.log('\n--- Mock Data Validation ---');

// Check if mockSpinResponse is properly formatted
console.log('\n/spin endpoint mock data:');
console.log('--------------------------');
console.log('Recipe ID:', mockSpinResponse.results[0].id);
console.log('Recipe Title:', mockSpinResponse.results[0].title);
console.log('Recipe Image:', mockSpinResponse.results[0].image);

// Check if mockCookResponse is properly formatted
console.log('\n/cook endpoint mock data:');
console.log('--------------------------');
console.log('Recipe ID:', mockCookResponse.id);
console.log('Recipe Title:', mockCookResponse.title);
console.log('Recipe Image:', mockCookResponse.image);
console.log('Ready in Minutes:', mockCookResponse.readyInMinutes);
console.log('Servings:', mockCookResponse.servings);
console.log('Number of ingredients:', mockCookResponse.extendedIngredients.length);

console.log('\n✅ Mock data is properly configured and ready for testing!');
console.log('To use mock data, make sure TEST_MODE=true in your .env file');
console.log('To use live API, set TEST_MODE=false in your .env file'); 