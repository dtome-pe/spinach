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

export const processRecipeData = (recipe: Recipe) => {
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
            // Store original values for serving size calculations
            originalAmount: ingredient.amount,
            originalUnit: ingredient.unit,
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

export const adjustServings = (recipe: Recipe, newServings: number) => {
    const ratio = newServings / recipe.servings;
    
    const adjustedIngredients = recipe.extendedIngredients.map(ingredient => {
        const newAmount = ingredient.originalAmount * ratio;
        return {
            ...ingredient,
            amount: Math.round(newAmount * 100) / 100,
        };
    });

    return {
        ...recipe,
        servings: newServings,
        extendedIngredients: adjustedIngredients,
    };
}; 