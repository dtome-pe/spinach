// server/server.js
import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const CATEGORIES = ['vegetarian', 'quick', 'comfort']; // or any tags you want

const RECIPE_CACHE_FILE = './data/todayRecipes.json';

app.use(express.json());

// Serve today's recipes
app.get('/api/recipes/today', (req, res) => {

    fs.readFile(RECIPE_CACHE_FILE, 'utf-8', (err, data) => {

        if (err) return res.status(500).json({ error: 'Could not load recipes.' });
    res.json(JSON.parse(data));
    });

});

// Fetch 3 recipes from Spoonacular daily
async function fetchAndCacheRecipes() {
    const results = [];

    for (const tag of CATEGORIES) {
        const url = `https://api.spoonacular.com/recipes/random?apiKey=${SPOONACULAR_API_KEY}&number=1&tags=${tag}`;
        try {
            const res = await fetch(url);
            const json = await res.json();
        if (json.recipes && json.recipes.length > 0) {
            results.push({ category: tag, recipe: json.recipes[0] });
        }
        } catch (error) {
        console.error(`Error fetching recipe for ${tag}:`, error);
        }
    }

    fs.writeFileSync(RECIPE_CACHE_FILE, JSON.stringify(results, null, 2));
    console.log('✅ Recipes updated');
}

// Schedule once per day at 4am
cron.schedule('0 4 * * *', fetchAndCacheRecipes);

// Run immediately on startup
fetchAndCacheRecipes();

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
