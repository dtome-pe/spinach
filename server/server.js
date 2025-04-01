// server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors()); // 👈 Add this line!

const PORT = process.env.PORT || 3001;
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

app.use(express.json());

// Recipe spin endpoint
app.get('/spin', (req, res) => {
    // For now, return a simple response
    // PETICION A SPOONACULAR 

    res.json({
        id: 1,
        title: "Server Recipe API Response",
        image: "https://images.unsplash.com/photo-1637361874063-e5e415d7bcf7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        description: "This is a test response from the server's recipe spin endpoint."
    });
});

app.get('/cook', (req, res) => {
    // Extract the recipe ID from query parameters
    const recipeId = req.query.id;

    // Validate that we received a recipe ID
    if (!recipeId) {
        return res.status(400).json({ error: 'Recipe ID is required' });
    }

    // For now, return a test response with the received ID
    res.json({
            "id": 1095679,
            "image": "https://img.spoonacular.com/recipes/1095679-312x231.jpg",
            "imageType": "jpg",
            "title": "Strawberry Matcha Chia Pudding",
            "readyInMinutes": 45,
            "servings": 1,
            "sourceUrl": "https://www.foodista.com/recipe/L6KMWPGW/strawberry-matcha-chia-pudding-recipe-paleo-keto-vegan",
            "vegetarian": true,
            "vegan": true,
            "glutenFree": true,
            "dairyFree": true,
            "veryHealthy": false,
            "cheap": false,
            "veryPopular": false,
            "sustainable": false,
            "lowFodmap": true,
            "weightWatcherSmartPoints": 20,
            "gaps": "no",
            "preparationMinutes": null,
            "cookingMinutes": null,
            "aggregateLikes": 1,
            "healthScore": 7.0,
            "creditsText": "Foodista.com – The Cooking Encyclopedia Everyone Can Edit",
            "license": "CC BY 3.0",
            "sourceName": "Foodista",
            "pricePerServing": 166.79,
            "extendedIngredients": [
                {
                    "id": 98932,
                    "aisle": "Tea and Coffee",
                    "image": "matcha-powder.jpg",
                    "consistency": "SOLID",
                    "name": "matcha powder",
                    "nameClean": "matcha",
                    "original": "1/2 teaspoon (2 g) matcha powder",
                    "originalName": "1/2 teaspoon matcha powder",
                    "amount": 2.0,
                    "unit": "g",
                    "meta": [],
                    "measures": {
                        "us": {
                            "amount": 0.071,
                            "unitShort": "oz",
                            "unitLong": "ounces"
                        },
                        "metric": {
                            "amount": 2.0,
                            "unitShort": "g",
                            "unitLong": "grams"
                        }
                    }
                },
                {
                    "id": 12118,
                    "aisle": "Milk, Eggs, Other Dairy",
                    "image": "coconut-milk.png",
                    "consistency": "LIQUID",
                    "name": "coconut milk",
                    "nameClean": "coconut milk",
                    "original": "3/4 cup (175 ml) coconut milk",
                    "originalName": "3/4 cup coconut milk",
                    "amount": 175.0,
                    "unit": "ml",
                    "meta": [],
                    "measures": {
                        "us": {
                            "amount": 5.653,
                            "unitShort": "fl. oz",
                            "unitLong": "fl. ozs"
                        },
                        "metric": {
                            "amount": 175.0,
                            "unitShort": "ml",
                            "unitLong": "milliliters"
                        }
                    }
                },
                {
                    "id": 12006,
                    "aisle": "Health Foods",
                    "image": "chia-seeds.jpg",
                    "consistency": "SOLID",
                    "name": "chia seeds",
                    "nameClean": "chia seeds",
                    "original": "1.5 Tablespoons (15 g) chia seeds",
                    "originalName": "1.5 Tablespoons chia seeds",
                    "amount": 15.0,
                    "unit": "g",
                    "meta": [],
                    "measures": {
                        "us": {
                            "amount": 0.529,
                            "unitShort": "oz",
                            "unitLong": "ounces"
                        },
                        "metric": {
                            "amount": 15.0,
                            "unitShort": "g",
                            "unitLong": "grams"
                        }
                    }
                },
                {
                    "id": 9316,
                    "aisle": "Produce",
                    "image": "strawberries.png",
                    "consistency": "SOLID",
                    "name": "strawberries",
                    "nameClean": "strawberries",
                    "original": "2 strawberries, diced small",
                    "originalName": "strawberries, diced small",
                    "amount": 2.0,
                    "unit": "small",
                    "meta": [
                        "diced"
                    ],
                    "measures": {
                        "us": {
                            "amount": 2.0,
                            "unitShort": "small",
                            "unitLong": "smalls"
                        },
                        "metric": {
                            "amount": 2.0,
                            "unitShort": "small",
                            "unitLong": "smalls"
                        }
                    }
                }
            ],
            "summary": "If you want to add more <b>gluten free, dairy free, paleolithic, and lacto ovo vegetarian</b> recipes to your repertoire, Strawberry Matcha Chia Pudding might be a recipe you should try. One serving contains <b>413 calories</b>, <b>7g of protein</b>, and <b>40g of fat</b>. For <b>$1.67 per serving</b>, this recipe <b>covers 14%</b> of your daily requirements of vitamins and minerals. This recipe serves 1. 1 person were glad they tried this recipe. It will be a hit at your <b>Mother's Day</b> event. Head to the store and pick up matcha powder, coconut milk, chia seeds, and a few other things to make it today. From preparation to the plate, this recipe takes approximately <b>45 minutes</b>. It is brought to you by Foodista. Overall, this recipe earns a <b>pretty good spoonacular score of 43%</b>. <a href=\"https://spoonacular.com/recipes/how-to-make-chia-pudding-and-a-strawberry-banana-chia-pudding-parfait-902573\">How to Make Chia Pudding – and a Strawberry Banana Chia Pudding Parfait</a>, <a href=\"https://spoonacular.com/recipes/matcha-chia-seed-pudding-apricot-smoothie-parfaits-670264\">Matcha Chia Seed Pudding & Apricot Smoothie Parfaits</a>, and <a href=\"https://spoonacular.com/recipes/the-hype-about-chia-seeds-strawberry-chia-pudding-497839\">The Hype about Chia Seeds & Strawberry Chia Pudding</a> are very similar to this recipe.",
            "cuisines": [],
            "dishTypes": [],
            "diets": [
                "gluten free",
                "dairy free",
                "paleolithic",
                "lacto ovo vegetarian",
                "primal",
                "fodmap friendly",
                "whole 30",
                "vegan",
                "ketogenic"
            ],
            "occasions": [
                "mother's day"
            ],
            "analyzedInstructions": [
                {
                    "name": "",
                    "steps": [
                        {
                            "number": 1,
                            "step": "Place the coconut milk, matcha powder, chia seeds, and sweeteners (if youre using any) into a cup with a lid. Shake well for 5-10 seconds.",
                            "ingredients": [
                                {
                                    "id": 98932,
                                    "name": "matcha",
                                    "localizedName": "matcha",
                                    "image": "matcha-powder.jpg"
                                },
                                {
                                    "id": 12118,
                                    "name": "coconut milk",
                                    "localizedName": "coconut milk",
                                    "image": "coconut-milk.png"
                                },
                                {
                                    "id": 12006,
                                    "name": "chia seeds",
                                    "localizedName": "chia seeds",
                                    "image": "chia-seeds.jpg"
                                },
                                {
                                    "id": 0,
                                    "name": "shake",
                                    "localizedName": "shake",
                                    "image": ""
                                }
                            ],
                            "equipment": []
                        },
                        {
                            "number": 2,
                            "step": "Pour mixture into a glass and place into fridge for 4 hours.",
                            "ingredients": [],
                            "equipment": [],
                            "length": {
                                "number": 240,
                                "unit": "minutes"
                            }
                        },
                        {
                            "number": 3,
                            "step": "Mix the diced strawberries into the pudding and serve  reserve 1 teaspoon of diced strawberries for topping.",
                            "ingredients": [
                                {
                                    "id": 9316,
                                    "name": "strawberries",
                                    "localizedName": "strawberries",
                                    "image": "strawberries.png"
                                }
                            ],
                            "equipment": []
                        }
                    ]
                }
            ],
            "spoonacularScore": 50.86536407470703,
            "spoonacularSourceUrl": "https://spoonacular.com/strawberry-matcha-chia-pudding-1095679",
            "usedIngredientCount": 0,
            "missedIngredientCount": 4,
            "missedIngredients": [
                {
                    "id": 98932,
                    "amount": 2.0,
                    "unit": "g",
                    "unitLong": "grams",
                    "unitShort": "g",
                    "aisle": "Tea and Coffee",
                    "name": "matcha powder",
                    "original": "1/2 teaspoon (2 g) matcha powder",
                    "originalName": "1/2 teaspoon matcha powder",
                    "meta": [],
                    "image": "https://img.spoonacular.com/ingredients_100x100/matcha-powder.jpg"
                },
                {
                    "id": 12118,
                    "amount": 175.0,
                    "unit": "ml",
                    "unitLong": "milliliters",
                    "unitShort": "ml",
                    "aisle": "Milk, Eggs, Other Dairy",
                    "name": "coconut milk",
                    "original": "3/4 cup (175 ml) coconut milk",
                    "originalName": "3/4 cup coconut milk",
                    "meta": [],
                    "image": "https://img.spoonacular.com/ingredients_100x100/coconut-milk.png"
                },
                {
                    "id": 12006,
                    "amount": 15.0,
                    "unit": "g",
                    "unitLong": "grams",
                    "unitShort": "g",
                    "aisle": "Health Foods",
                    "name": "chia seeds",
                    "original": "1.5 Tablespoons (15 g) chia seeds",
                    "originalName": "1.5 Tablespoons chia seeds",
                    "meta": [],
                    "image": "https://img.spoonacular.com/ingredients_100x100/chia-seeds.jpg"
                },
                {
                    "id": 9316,
                    "amount": 2.0,
                    "unit": "small",
                    "unitLong": "smalls",
                    "unitShort": "small",
                    "aisle": "Produce",
                    "name": "strawberries",
                    "original": "2 strawberries, diced small",
                    "originalName": "strawberries, diced small",
                    "meta": [
                        "diced"
                    ],
                    "extendedName": "diced strawberries",
                    "image": "https://img.spoonacular.com/ingredients_100x100/strawberries.png"
                }
            ],
            "likes": 0,
            "usedIngredients": [],
            "unusedIngredients": []
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
