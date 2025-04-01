// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Recipe spin endpoint
app.get('/spin', async (req, res) => {
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
        console.log('Recipe found:', { id: recipe.id, title: recipe.title });

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

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
