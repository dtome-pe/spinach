// Script to toggle between test mode and live mode
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the .env file (one level up from the server directory)
const envPath = path.join(__dirname, '..', '.env');

// Load current environment variables
dotenv.config({ path: envPath });

// Get current mode
const currentTestMode = process.env.TEST_MODE === 'true';
const newTestMode = !currentTestMode;

// Read the current .env file content
let envContent = fs.readFileSync(envPath, 'utf8');

// Update the TEST_MODE value
if (envContent.includes('TEST_MODE=')) {
    // Replace the existing TEST_MODE line
    envContent = envContent.replace(/TEST_MODE=.*/g, `TEST_MODE=${newTestMode}`);
} else {
    // Add TEST_MODE if it doesn't exist
    envContent += `\nTEST_MODE=${newTestMode}`;
}

// Write the updated content back to the .env file
fs.writeFileSync(envPath, envContent);

console.log(`🔄 Mode switched from ${currentTestMode ? 'TEST' : 'LIVE'} to ${newTestMode ? 'TEST' : 'LIVE'} mode`);
console.log(`✅ .env file updated with TEST_MODE=${newTestMode}`);
console.log('\n📋 To use this mode, restart your server if it\'s already running'); 