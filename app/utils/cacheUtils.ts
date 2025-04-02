import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './recipeUtils';

// Keys for AsyncStorage
const KEYS = {
  RECIPE_CACHE: 'RECIPE_CACHE_',
  RECENT_RECIPES: 'RECENT_RECIPES',
  MAX_CACHE_SIZE: 10, // Maximum number of recipes to cache
};

/**
 * Save a recipe to local cache
 * @param recipe The recipe to cache
 */
export const cacheRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    if (!recipe || !recipe.id) return;
    
    // Cache the recipe data
    await AsyncStorage.setItem(
      `${KEYS.RECIPE_CACHE}${recipe.id}`, 
      JSON.stringify(recipe)
    );
    
    // Update the recent recipes list
    const recentRecipesJson = await AsyncStorage.getItem(KEYS.RECENT_RECIPES);
    let recentRecipes: number[] = recentRecipesJson ? JSON.parse(recentRecipesJson) : [];
    
    // Add this recipe to the front of the list (if not already there)
    recentRecipes = recentRecipes.filter(id => id !== recipe.id);
    recentRecipes.unshift(recipe.id);
    
    // Trim the list if it exceeds max size
    if (recentRecipes.length > KEYS.MAX_CACHE_SIZE) {
      const removedIds = recentRecipes.splice(KEYS.MAX_CACHE_SIZE);
      
      // Clean up removed recipes from cache
      for (const id of removedIds) {
        await AsyncStorage.removeItem(`${KEYS.RECIPE_CACHE}${id}`);
      }
    }
    
    // Save the updated list
    await AsyncStorage.setItem(
      KEYS.RECENT_RECIPES,
      JSON.stringify(recentRecipes)
    );
  } catch (error) {
    console.error('Error caching recipe:', error);
  }
};

/**
 * Retrieve a recipe from cache by ID
 * @param id Recipe ID
 * @returns The cached recipe or null if not found
 */
export const getCachedRecipe = async (id: number): Promise<Recipe | null> => {
  try {
    const recipeJson = await AsyncStorage.getItem(`${KEYS.RECIPE_CACHE}${id}`);
    if (recipeJson) {
      return JSON.parse(recipeJson);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving cached recipe:', error);
    return null;
  }
};

/**
 * Get a list of recently used recipe IDs
 * @returns Array of recipe IDs
 */
export const getRecentRecipeIds = async (): Promise<number[]> => {
  try {
    const recentJson = await AsyncStorage.getItem(KEYS.RECENT_RECIPES);
    return recentJson ? JSON.parse(recentJson) : [];
  } catch (error) {
    console.error('Error getting recent recipes:', error);
    return [];
  }
};

/**
 * Clear all cached recipes
 */
export const clearRecipeCache = async (): Promise<void> => {
  try {
    const recentIds = await getRecentRecipeIds();
    
    // Remove all cached recipes
    for (const id of recentIds) {
      await AsyncStorage.removeItem(`${KEYS.RECIPE_CACHE}${id}`);
    }
    
    // Clear recent list
    await AsyncStorage.removeItem(KEYS.RECENT_RECIPES);
  } catch (error) {
    console.error('Error clearing recipe cache:', error);
  }
};

export default {
  cacheRecipe,
  getCachedRecipe,
  getRecentRecipeIds,
  clearRecipeCache,
}; 