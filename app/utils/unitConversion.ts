interface ConversionUnit {
    metric: number | ((value: number) => number);
    imperial: string;
}

interface ConversionMap {
    [key: string]: ConversionUnit;
}

const conversions: ConversionMap = {
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
    fahrenheit: { metric: (f: number) => (f - 32) * 5/9, imperial: 'celsius' },
    celsius: { metric: (c: number) => c, imperial: 'celsius' },
};

/**
 * Converts a measurement from one unit to another
 */
export const convertUnits = (amount: number, unit: string, toMetric: boolean): { amount: number; unit: string } => {
    // Normalize unit name
    const normalizedUnit = unit.toLowerCase().replace(/\s+/g, '_');
    
    if (!conversions[normalizedUnit]) {
        return { amount, unit };
    }

    const conversion = conversions[normalizedUnit];
    const newAmount = typeof conversion.metric === 'function' 
        ? conversion.metric(amount)
        : (toMetric ? amount * conversion.metric : amount / conversion.metric);
    const newUnit = conversion.imperial;

    return { 
        amount: Math.round(newAmount * 100) / 100, 
        unit: newUnit 
    };
};

/**
 * Converts a measurement to imperial units
 */
export const convertToImperial = (amount: number, unit: string): { amount: number; unit: string } => {
    return convertUnits(amount, unit, false);
};

/**
 * Converts a measurement to metric units
 */
export const convertToMetric = (amount: number, unit: string): { amount: number; unit: string } => {
    return convertUnits(amount, unit, true);
};

/**
 * Formats a unit for display
 */
export const formatUnit = (unit: string): string => {
    if (!unit) return '';
    
    // Handle common abbreviations
    const unitMap: {[key: string]: string} = {
        'g': 'g',
        'ml': 'ml',
        'l': 'l',
        'kg': 'kg',
        'oz': 'oz',
        'lb': 'lb',
        'cup': 'cup',
        'cups': 'cups',
        'tbsp': 'tbsp',
        'tsp': 'tsp',
        'tablespoon': 'tbsp',
        'tablespoons': 'tbsp',
        'teaspoon': 'tsp',
        'teaspoons': 'tsp',
    };
    
    const normalizedUnit = unit.toLowerCase().trim();
    return unitMap[normalizedUnit] || unit;
};

// Add a default export
export default {
  convertToImperial,
  convertToMetric,
  formatUnit,
  convertUnits,
}; 