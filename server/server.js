// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
import serverlessExpress from '@vendia/serverless-express';
import { mockSpinResponse, mockCookResponse } from './mockData.js';
import os from 'os';

dotenv.config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const PORT = process.env.PORT || 3001;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const LAMBDA = process.env.LAMBDA === 'true';
const TEST_MODE = process.env.TEST_MODE === 'true';

// Log the current mode
console.log(`🔧 Running in ${TEST_MODE ? 'TEST MODE' : 'LIVE MODE'}`);

// Recipe spin endpoint
app.get('/spin', async (req, res) => {
    // If in test mode, return mock data
    if (TEST_MODE) {
        console.log('🧪 Using mock data for /spin endpoint');
        return res.json({
            id: mockSpinResponse.results[0].id,
            title: mockSpinResponse.results[0].title,
            image: mockSpinResponse.results[0].image,
            readyInMinutes: 45 // Hardcoded since it's not in the mock data
        });
    }

    const { maxTime, ...rest } = req.query;
    const maxReadyTime = parseInt(maxTime) || 60;

    // Extract intolerances from remaining query params
    const intolerances = Object.keys(rest)
        .filter(key => rest[key] === 'true')
        .map(key => key.charAt(0).toUpperCase() + key.slice(1))
        .join(',');

    const type = "main course, side dish, salad, soup";

    try {
        const axiosParams = {
            apiKey: SPOONACULAR_API_KEY,
            maxReadyTime,
            instructionsRequired: true,
            intolerances,
            type,
            number: 1,
            sort: 'random',
            diet: 'vegan'
        };

        // Log the request parameters and URL
        console.log('\n=== SPIN REQUEST ===');
        console.log('Query params:', req.query);
        console.log('Processed intolerances:', intolerances);
        console.log('Spoonacular URL:', axios.getUri({
            url: 'https://api.spoonacular.com/recipes/complexSearch',
            params: axiosParams
        }));
        console.log('Axios params:', axiosParams);

        const searchResponse = await axios.get('https://api.spoonacular.com/recipes/complexSearch', {
            params: axiosParams
        });

        const results = searchResponse.data.results;
        if (!results || results.length === 0) {
            console.log('No recipes found');
            return res.status(404).json({ error: 'No recipes found' });
        }

        const recipe = results[0];
        console.log('Recipe found:', { id: recipe.id, title: recipe.title, image: recipe.image });

        res.json({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes
        });
    } catch (error) {
        console.error('Error fetching recipes:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// Cook endpoint - returns detailed recipe information
app.get('/cook', async (req, res) => {
    // If in test mode, return mock data
    if (TEST_MODE) {
        console.log('🧪 Using mock data for /cook endpoint');
        return res.json(mockCookResponse);
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Recipe ID is required' });
    }

    try {
        const axiosParams = {
            apiKey: SPOONACULAR_API_KEY
        };

        // Log the request parameters and URL
        console.log('\n=== COOK REQUEST ===');
        console.log('Recipe ID:', id);
        console.log('Spoonacular URL:', axios.getUri({
            url: `https://api.spoonacular.com/recipes/${id}/information`,
            params: axiosParams
        }));

        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
            params: axiosParams
        });

        // Return the complete recipe data without processing
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recipe:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});

// Simple test endpoint to verify connectivity
app.get('/test', (req, res) => {
  console.log('📱 Test connection received from:', req.headers['user-agent']);
  res.json({ 
    success: true, 
    message: 'Server connection successful!',
    mode: TEST_MODE ? 'test' : 'live',
    timestamp: new Date().toISOString()
  });
});

// ✅ Mode: Local development
if (!LAMBDA) {
    app.listen(PORT, () => {
      console.log(`🚀 Local server running at http://localhost:${PORT}`);
      console.log(`💻 On network: http://${getLocalIpAddress()}:${PORT}`);
    });
  }
  
// ✅ Mode: AWS Lambda
export const handler = LAMBDA ? serverlessExpress({ app }) : undefined;

// Helper function to get the local IP address
function getLocalIpAddress() {
    const nets = os.networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (loopback) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}