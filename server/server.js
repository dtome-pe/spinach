// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors()); // 👈 Add this line!

const PORT = process.env.PORT || 3001;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

app.use(express.json());

// Recipe spin endpoint
app.get('/spin', async (req, res) => {

    //We extract the query params, max time and then the rest (intolerances)
    const { maxTime, ...rest } = req.query;

    //We parse the maxTime to an integer
    const maxReadyTime = parseInt(maxTime) || 60;

    // Extract intolerances from remaining query params
    const intolerances = Object.keys(rest)
        .filter(key => rest[key] === 'true')  // only true flags
        .map(key => key.charAt(0).toUpperCase() + key.slice(1)) // Capitalize for Spoonacular
        .join(',');


    const type = "main course, side dish, salad, soup";

    //We build the Spoonacular URL for a
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch`;

    try {

        //We build the axios params for the get request to spoonacular
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

        //We log the final Spoonacular URL
        /* console.log('Final Spoonacular URL:', axios.getUri({
            url: spoonacularUrl,
            params: axiosParams
        })); */

        //We make the get request to spoonacular
        const response = await axios.get(spoonacularUrl, {
            params: axiosParams
        });

        //We extract the results from the response
        const results = response.data.results;

        //We check if we have results
        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'No recipes found' });
        }

        //We extract the first recipe from the results
        const recipe = results[0];

        //We return the recipe
        res.json({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
        });
        } catch (error) {
        console.error('Error fetching recipes:', error);
        return res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

app.get('/cook', async (req, res) => {
    // Extract the recipe ID from query parameters
    const recipeId = req.query.id;

    // Validate that we received a recipe ID
    if (!recipeId) {
        return res.status(400).json({ error: 'Recipe ID is required' });
    }

    //We build the Spoonacular URL for a recipe information
    const spoonacularUrl = `https://api.spoonacular.com/recipes/${recipeId}/information`;

    //We build the axios params for the get request to spoonacular
    const axiosParams = {
        apiKey: SPOONACULAR_API_KEY
    };

    try {
        //We make the get request to spoonacular
        const response = await axios.get(spoonacularUrl, {
            params: axiosParams
        });

        //We return the recipe  
        res.json(response.data);

    } catch (error) {
        console.error('Error fetching recipes:', error);
        return res.status(500).json({ error: 'Failed to fetch recipes' });
    }

});

//We start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
