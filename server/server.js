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

const convertUnits = (amount, unit, toMetric) => {
    const conversions = {
        cups: { metric: 236.588, imperial: 'ml' },
        tablespoons: { metric: 14.7868, imperial: 'ml' },
        teaspoons: { metric: 4.92892, imperial: 'ml' },
        ounces: { metric: 28.3495, imperial: 'g' },
        pounds: { metric: 453.592, imperial: 'g' },
        fluid_ounces: { metric: 29.5735, imperial: 'ml' },
        pints: { metric: 473.176, imperial: 'ml' },
        quarts: { metric: 946.353, imperial: 'ml' },
        gallons: { metric: 3785.41, imperial: 'ml' },
        inches: { metric: 2.54, imperial: 'cm' },
        feet: { metric: 30.48, imperial: 'cm' },
        yards: { metric: 91.44, imperial: 'cm' },
        miles: { metric: 1609.34, imperial: 'm' },
        fahrenheit: { metric: (f) => (f - 32) * 5/9, imperial: 'celsius' },
        celsius: { metric: (c) => c, imperial: 'celsius' },
    };

    if (!conversions[unit]) {
        return { amount, unit };
    }

    const newAmount = toMetric ? amount * conversions[unit].metric : amount / conversions[unit].metric;
    const newUnit = conversions[unit].imperial;

    return { amount: Math.round(newAmount * 100) / 100, unit: newUnit };
};

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
        console.log('Axios params:', axiosParams);

        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
            params: axiosParams
        });

        const recipe = response.data;
        console.log('Recipe details fetched:', { 
            id: recipe.id, 
            title: recipe.title,
            ingredientsCount: recipe.extendedIngredients?.length,
            stepsCount: recipe.analyzedInstructions?.[0]?.steps?.length
        });

        // Process ingredients with unit conversion and ensure proper structure
        const processedIngredients = recipe.extendedIngredients.map((ingredient, index) => {
            const converted = convertUnits(
                ingredient.amount,
                ingredient.unit.toLowerCase(),
                true
            );
            return {
                id: ingredient.id || index + 1,
                name: ingredient.name,
                amount: converted.amount,
                unit: converted.unit,
                original: `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`,
            };
        });

        // Process instructions
        const processedInstructions = recipe.analyzedInstructions.map(instruction => ({
            ...instruction,
            steps: instruction.steps.map((step, index) => ({
                number: step.number || index + 1,
                step: step.step,
                ingredients: (step.ingredients || []).map(ingredient => {
                    const converted = convertUnits(
                        ingredient.amount || 0,
                        (ingredient.unit || '').toLowerCase(),
                        true
                    );
                    return {
                        id: ingredient.id,
                        name: ingredient.name,
                        amount: converted.amount,
                        unit: converted.unit,
                    };
                }),
                equipment: (step.equipment || []).map(equipment => ({
                    ...equipment,
                    temperature: equipment.temperature ? {
                        ...equipment.temperature,
                        value: convertUnits(
                            equipment.temperature.value,
                            equipment.temperature.unit,
                            true
                        ).amount,
                        unit: convertUnits(
                            equipment.temperature.value,
                            equipment.temperature.unit,
                            true
                        ).unit,
                    } : null,
                })),
            })),
        }));

        console.log('Processed recipe:', {
            ingredientsCount: processedIngredients.length,
            stepsCount: processedInstructions[0]?.steps?.length
        });

        res.json({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            description: recipe.summary,
            readyInMinutes: recipe.readyInMinutes || 30,
            servings: recipe.servings || 4,
            extendedIngredients: processedIngredients,
            analyzedInstructions: processedInstructions
        });
    } catch (error) {
        console.error('Error fetching recipe:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
