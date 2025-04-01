// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// Helper function to convert units to metric
const convertToMetric = (amount, unit) => {
    const conversions = {
        'cup': 236.588, // ml
        'tbsp': 14.7868, // ml
        'tsp': 4.92892, // ml
        'oz': 28.3495, // g
        'lb': 453.592, // g
        'fl oz': 29.5735, // ml
        'pint': 473.176, // ml
        'quart': 946.353, // ml
        'gallon': 3785.41, // ml
        'inch': 2.54, // cm
        'foot': 30.48, // cm
        'yard': 91.44, // cm
        'mile': 1609.34, // m
        'F': (f) => (f - 32) * 5/9, // °C
    };

    if (!unit || !conversions[unit.toLowerCase()]) return { amount, unit };

    const newAmount = amount * conversions[unit.toLowerCase()];
    let newUnit = '';

    switch(unit.toLowerCase()) {
        case 'cup':
        case 'tbsp':
        case 'tsp':
        case 'fl oz':
        case 'pint':
        case 'quart':
        case 'gallon':
            newUnit = 'ml';
            break;
        case 'oz':
        case 'lb':
            newUnit = 'g';
            break;
        case 'inch':
        case 'foot':
        case 'yard':
        case 'mile':
            newUnit = 'm';
            break;
        case 'f':
            newUnit = '°C';
            break;
        default:
            newUnit = unit;
    }

    return { amount: Math.round(newAmount * 100) / 100, unit: newUnit };
};

// Recipe spin endpoint with preferences
app.get('/spin', async (req, res) => {
    try {
        const { maxReadyTime, minReadyTime, allergies, diet } = req.query;
        
        let url = `https://api.spoonacular.com/recipes/random?apiKey=${SPOONACULAR_API_KEY}&number=1`;
        
        if (maxReadyTime) url += `&maxReadyTime=${maxReadyTime}`;
        if (minReadyTime) url += `&minReadyTime=${minReadyTime}`;
        if (allergies) url += `&intolerances=${allergies}`;
        if (diet) url += `&diet=${diet}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.recipes && data.recipes[0]) {
            const recipe = data.recipes[0];
            
            // Convert ingredients to metric
            recipe.extendedIngredients = recipe.extendedIngredients.map(ingredient => {
                const metric = convertToMetric(ingredient.amount, ingredient.unit);
                return {
                    ...ingredient,
                    amount: metric.amount,
                    unit: metric.unit,
                    original: `${metric.amount} ${metric.unit} ${ingredient.name}`
                };
            });

            res.json(recipe);
        } else {
            res.status(404).json({ error: 'No recipe found' });
        }
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});

// Get recipe by ID
app.get('/recipe/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}`;
        
        const response = await fetch(url);
        const recipe = await response.json();

        if (recipe.id) {
            // Convert ingredients to metric
            recipe.extendedIngredients = recipe.extendedIngredients.map(ingredient => {
                const metric = convertToMetric(ingredient.amount, ingredient.unit);
                return {
                    ...ingredient,
                    amount: metric.amount,
                    unit: metric.unit,
                    original: `${metric.amount} ${metric.unit} ${ingredient.name}`
                };
            });

            res.json(recipe);
        } else {
            res.status(404).json({ error: 'Recipe not found' });
        }
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
