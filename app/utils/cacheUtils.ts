import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './recipeUtils';

// Keys for AsyncStorage
const KEYS = {
  RECIPE_CACHE: 'RECIPE_CACHE_',
  HISTORY_CACHE: 'HISTORY_CACHE_',
  RECENT_RECIPES: 'RECENT_RECIPES',
  MAX_CACHE_SIZE: 10, // Maximum number of recipes to cache
};

interface CachedRecipe {
  recipe: Recipe;
  timestamp: number;
}

interface HistoryRecipe {
  id: number;
  title: string;
  image: string;
}

/**
 * Save a recipe to local cache
 * @param recipe The recipe to cache
 */
export const cacheRecipe = async (recipe: Recipe): Promise<void> => {
  try {
    if (!recipe || !recipe.id) return;
    
    // Cache the recipe data with timestamp
    const cachedRecipe: CachedRecipe = {
      recipe,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(
      `${KEYS.RECIPE_CACHE}${recipe.id}`, 
      JSON.stringify(cachedRecipe)
    );
    
    // Cache minimal recipe data for history (never expires)
    const historyRecipe: HistoryRecipe = {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image
    };
    
    await AsyncStorage.setItem(
      `${KEYS.HISTORY_CACHE}${recipe.id}`,
      JSON.stringify(historyRecipe)
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
        await AsyncStorage.removeItem(`${KEYS.HISTORY_CACHE}${id}`);
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
 * @returns The cached recipe or null if not found or cache expired
 */
export const getCachedRecipe = async (id: number): Promise<Recipe | null> => {
  try {
    const cachedData = await AsyncStorage.getItem(`${KEYS.RECIPE_CACHE}${id}`);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      
      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object') {
        console.error('Invalid cached data format');
        await AsyncStorage.removeItem(`${KEYS.RECIPE_CACHE}${id}`);
        return null;
      }
      
      const { recipe, timestamp } = parsedData;
      
      // Validate timestamp is a valid number
      if (!timestamp || typeof timestamp !== 'number' || isNaN(timestamp)) {
        console.error('Invalid timestamp in cached data');
        await AsyncStorage.removeItem(`${KEYS.RECIPE_CACHE}${id}`);
        return null;
      }
      
      // Check if cache is expired (1 minute for testing)
      const now = Date.now();
      const oneHourInMs = 60 * 60 * 1000; // 1 hour
      // const oneHourInMs = 60 * 1000; // 1 minute for testing
      const timeElapsed = now - timestamp;
      const timeLeftInMs = oneHourInMs - timeElapsed;
      
      // Log cache access information only in development
      if (__DEV__) {
        try {
          console.log(`[Recipe Cache] Accessing recipe ${id} at ${new Date(now).toISOString()}`);
          console.log(`[Recipe Cache] Recipe was cached at ${new Date(timestamp).toISOString()}`);
          console.log(`[Recipe Cache] Time left in cache: ${Math.floor(timeLeftInMs / 1000 / 60)} minutes and ${Math.floor((timeLeftInMs / 1000) % 60)} seconds`);
        } catch (dateError) {
          console.error('Error formatting dates:', dateError);
        }
      }
      
      if (timeLeftInMs > 0) {
        return recipe;
      }
      
      // Cache expired, remove it
      if (__DEV__) {
        console.log(`[Recipe Cache] Cache expired for recipe ${id}`);
      }
      await AsyncStorage.removeItem(`${KEYS.RECIPE_CACHE}${id}`);
    } else if (__DEV__) {
      console.log(`[Recipe Cache] No cache found for recipe ${id}`);
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
 * Get history recipe data (minimal data that doesn't expire)
 * @param id Recipe ID
 * @returns Basic recipe info for history display or null if not found
 */
export const getHistoryRecipe = async (id: number): Promise<{ id: number, title: string, image: string } | null> => {
  try {
    const historyData = await AsyncStorage.getItem(`${KEYS.HISTORY_CACHE}${id}`);
    return historyData ? JSON.parse(historyData) : null;
  } catch (error) {
    console.error('Error retrieving history recipe:', error);
    return null;
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
      // Don't remove history cache when clearing recipe cache
    }
  } catch (error) {
    console.error('Error clearing recipe cache:', error);
  }
};

/**
 * Clear all history and recipe cache
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const recentIds = await getRecentRecipeIds();
    
    // Remove all cached recipes and history
    for (const id of recentIds) {
      await AsyncStorage.removeItem(`${KEYS.RECIPE_CACHE}${id}`);
      await AsyncStorage.removeItem(`${KEYS.HISTORY_CACHE}${id}`);
    }
    
    // Clear recent list
    await AsyncStorage.removeItem(KEYS.RECENT_RECIPES);
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

export default {
  cacheRecipe,
  getCachedRecipe,
  getRecentRecipeIds,
  getHistoryRecipe,
  clearRecipeCache,
  clearAllCache,
}; 