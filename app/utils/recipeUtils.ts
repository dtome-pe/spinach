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
            ingredients: (step.ingredients || []).map((ingredient: any) => {
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
            equipment: (step.equipment || []).map((equipment: any) => ({
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

export const splitLongSteps = (steps: { number: number; step: string }[]) => {
    const MAX_CHARS = 200;
    const MIN_CHARS = 50;
    let result: { number: number; step: string }[] = [];
    
    // Helper function to properly join step texts with correct punctuation
    const joinSteps = (first: string, second: string): string => {
        first = first.trim();
        second = second.trim();
        
        // Check if the first step ends with a punctuation mark
        const endsWithPunctuation = /[.!?]$/.test(first);
        
        if (endsWithPunctuation) {
            // If it already ends with punctuation, just add a space
            return first + ' ' + second;
        } else {
            // If it doesn't end with punctuation, add a period and a space
            return first + '. ' + second;
        }
    };
    
    for (const step of steps) {
        if (step.step.length <= MAX_CHARS) {
            result.push(step);
            continue;
        }

        // Split the step into sentences
        const sentences = step.step.match(/[^.!?]+[.!?]+/g) || [step.step];
        let currentStep = '';
        let currentNumber = step.number;

        for (const sentence of sentences) {
            // If adding this sentence doesn't exceed MAX_CHARS, add it to current step
            if (currentStep.length + sentence.length <= MAX_CHARS) {
                currentStep += sentence;
            } else {
                // Check if current step is too short to stand alone
                if (currentStep.length < MIN_CHARS && result.length > 0) {
                    // Merge with previous step if possible
                    const prevStep = result[result.length - 1];
                    if (prevStep.step.length + currentStep.length <= MAX_CHARS) {
                        prevStep.step = joinSteps(prevStep.step, currentStep);
                        currentStep = '';
                    }
                }

                // If we have content, add it as a step
                if (currentStep) {
                    result.push({
                        number: currentNumber,
                        step: currentStep.trim()
                    });
                    currentNumber++;
                }
                // Start new step with current sentence
                currentStep = sentence;
            }
        }

        // Add the last step if there's content
        if (currentStep) {
            // Check if last step is too short
            if (currentStep.length < MIN_CHARS && result.length > 0) {
                // Try to merge with the previous step
                const prevStep = result[result.length - 1];
                if (prevStep.step.length + currentStep.length <= MAX_CHARS) {
                    prevStep.step = joinSteps(prevStep.step, currentStep);
                } else {
                    result.push({
                        number: currentNumber,
                        step: currentStep.trim()
                    });
                }
            } else {
                result.push({
                    number: currentNumber,
                    step: currentStep.trim()
                });
            }
        }
    }
    
    // Final pass to merge very short steps with next step (forward pass)
    for (let i = 0; i < result.length - 1; i++) {
        if (result[i].step.length < MIN_CHARS) {
            // Try to merge with next step
            if (result[i].step.length + result[i+1].step.length <= MAX_CHARS) {
                result[i+1].step = joinSteps(result[i].step, result[i+1].step);
                result.splice(i, 1); // Remove the current step
                i--; // Adjust index after removal
            }
        }
    }
    
    // For short last step, try to merge with previous step (backward pass)
    if (result.length > 1) {
        const lastIndex = result.length - 1;
        const lastStep = result[lastIndex];
        
        if (lastStep.step.length < MIN_CHARS) {
            const prevStep = result[lastIndex - 1];
            if (prevStep.step.length + lastStep.step.length <= MAX_CHARS) {
                prevStep.step = joinSteps(prevStep.step, lastStep.step);
                result.pop(); // Remove the last step
            }
        }
    }
    
    // Fix step numbering to be consecutive
    result = result.map((step, index) => ({
        ...step,
        number: index + 1
    }));

    return result;
};

// Add a default export
export default {
  processRecipeData,
  adjustServings,
}; 