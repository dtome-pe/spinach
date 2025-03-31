// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors()); // 👈 Add this line!

const PORT = process.env.PORT || 3001;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const CATEGORIES = ['vegetarian', 'quick', 'comfort']; // or any tags you want

const RECIPE_CACHE_FILE = './data/todayRecipes.json';

app.use(express.json());

// Recipe spin endpoint
app.get('/spin', (req, res) => {
    // For now, return a simple response
    res.json({
        title: "Server Recipe API Response",
        image: "https://images.unsplash.com/photo-1637361874063-e5e415d7bcf7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "This is a test response from the server's recipe spin endpoint."
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
