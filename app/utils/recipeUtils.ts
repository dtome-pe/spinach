import { convertUnits } from './unitConversion';

export interface Recipe {
    id: number;
    title: string;
    image: string;
    summary: string;
    description: string;
    readyInMinutes: number;
    servings: number;
    extendedIngredients: any[];
    analyzedInstructions: { steps: any[] }[];
}

export interface UserSettings {
    useMetric: boolean;
    maxCookingTime: number;
    allergens: {
        [key: string]: boolean;
    };
}

export const processRecipeData = (recipe: Recipe, useMetric: boolean = true) => {
    const processedIngredients = recipe.extendedIngredients.map((ingredient, index) => {
        // Determine which measurement system to use
        const measureSystem = useMetric ? 'metric' : 'us';
        
        // Get values from the selected measurement system if available
        const measureAmount = ingredient.measures?.[measureSystem]?.amount || ingredient.amount;
        const measureUnit = ingredient.measures?.[measureSystem]?.unitShort || ingredient.unit;
        
        return {
            id: ingredient.id || index + 1,
            name: ingredient.name,
            amount: measureAmount,
            unit: measureUnit,
            original: ingredient.original,
            // Store the measures for calculations
            measures: ingredient.measures,
            // This will be the baseline for all serving calculations
            baseAmount: measureAmount,
            baseUnit: measureUnit,
            baseServings: recipe.servings,
            // Store the measurement system used
            measureSystem
        };
    });

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
                    originalAmount: ingredient.amount,
                    originalUnit: ingredient.unit,
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

    return {
        ...recipe,
        extendedIngredients: processedIngredients,
        analyzedInstructions: processedInstructions,
    };
};

export const adjustServings = (recipe: Recipe, newServings: number, useMetric: boolean = true) => {
    const adjustedIngredients = recipe.extendedIngredients.map(ingredient => {
        // Update the measurement system if needed
        const measureSystem = useMetric ? 'metric' : 'us';
        
        // If measurement system changed, update the base values
        let baseAmount = ingredient.baseAmount;
        let baseUnit = ingredient.baseUnit;
        
        if (ingredient.measureSystem !== measureSystem && ingredient.measures) {
            baseAmount = ingredient.measures[measureSystem]?.amount || baseAmount;
            baseUnit = ingredient.measures[measureSystem]?.unitShort || baseUnit;
        }
        
        // Calculate amount per serving based on original recipe servings
        const amountPerServing = baseAmount / ingredient.baseServings;
        
        // Calculate new amount based on new servings
        const newAmount = amountPerServing * newServings;
        
        // Determine if this is a volumetric or weight unit for rounding
        const isVolumetricOrWeight = 
            ['g', 'ml', 'l', 'kg'].includes(baseUnit.toLowerCase());
        
        return {
            ...ingredient,
            amount: isVolumetricOrWeight ? 
                Math.round(newAmount) : 
                Math.round(newAmount * 4) / 4,
            unit: baseUnit,
            baseAmount,
            baseUnit,
            measureSystem
        };
    });

    return {
        ...recipe,
        servings: newServings,
        extendedIngredients: adjustedIngredients,
    };
};

export const decimalToFraction = (decimal: number): string => {
    // If it's a whole number, just return it
    if (Math.round(decimal) === decimal) {
        return decimal.toString();
    }

    // Common fractions to display
    if (Math.abs(decimal - Math.floor(decimal) - 0.25) < 0.01) {
        return `${Math.floor(decimal) === 0 ? '' : Math.floor(decimal) + ' '}1/4`;
    }
    if (Math.abs(decimal - Math.floor(decimal) - 0.5) < 0.01) {
        return `${Math.floor(decimal) === 0 ? '' : Math.floor(decimal) + ' '}1/2`;
    }
    if (Math.abs(decimal - Math.floor(decimal) - 0.75) < 0.01) {
        return `${Math.floor(decimal) === 0 ? '' : Math.floor(decimal) + ' '}3/4`;
    }
    if (Math.abs(decimal - Math.floor(decimal) - 0.33) < 0.01) {
        return `${Math.floor(decimal) === 0 ? '' : Math.floor(decimal) + ' '}1/3`;
    }
    if (Math.abs(decimal - Math.floor(decimal) - 0.67) < 0.01) {
        return `${Math.floor(decimal) === 0 ? '' : Math.floor(decimal) + ' '}2/3`;
    }

    // For other values, round to the nearest quarter
    const rounded = Math.round(decimal * 4) / 4;
    if (Math.round(rounded) === rounded) {
        return rounded.toString();
    }
    
    if (Math.abs(rounded - Math.floor(rounded) - 0.25) < 0.01) {
        return `${Math.floor(rounded) === 0 ? '' : Math.floor(rounded) + ' '}1/4`;
    }
    if (Math.abs(rounded - Math.floor(rounded) - 0.5) < 0.01) {
        return `${Math.floor(rounded) === 0 ? '' : Math.floor(rounded) + ' '}1/2`;
    }
    if (Math.abs(rounded - Math.floor(rounded) - 0.75) < 0.01) {
        return `${Math.floor(rounded) === 0 ? '' : Math.floor(rounded) + ' '}3/4`;
    }
    
    // If all else fails, just show the decimal rounded to 1 place
    return rounded.toFixed(1);
};

// Add a default export
export default {
  processRecipeData,
  adjustServings,
}; 