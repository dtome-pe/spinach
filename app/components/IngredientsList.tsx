import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Share,
    StyleSheet,
    TextStyle,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { decimalToFraction } from '../utils/recipeUtils';
import { styles as appStyles } from '../styles';

interface Ingredient {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
    measures?: {
        metric: {
            amount: number;
            unitShort: string;
            unitLong: string;
        };
        us: {
            amount: number;
            unitShort: string;
            unitLong: string;
        };
    };
    baseAmount: number;
    baseUnit: string;
    baseServings: number;
    measureSystem?: string; // track which measurement system is being used
}

interface IngredientsListProps {
    recipe: {
        title: string;
        servings: number;
    };
    ingredients: Ingredient[];
    servings: number;
    readyInMinutes: number;
    onServingsChange: (newServings: number) => void;
    onStartSteps: () => void;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
    recipe,
    ingredients,
    servings,
    readyInMinutes,
    onServingsChange,
    onStartSteps,
}) => {
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

    const toggleIngredient = (id: number) => {
        setCheckedIngredients(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleAllIngredients = () => {
        if (checkedIngredients.size === ingredients.length) {
            setCheckedIngredients(new Set());
        } else {
            setCheckedIngredients(new Set(ingredients.map(i => i.id)));
        }
    };

    const formatAmount = (ingredient: Ingredient) => {
        const amount = ingredient.amount;
        const unit = ingredient.unit;
        
        // For metric units (g, ml, l, kg) or US volume units (cups, oz, etc.)
        const isVolumetricOrWeight = 
            ['g', 'ml', 'l', 'kg', 'cups', 'cup', 'oz', 'ounces', 'lbs', 'tbsp', 'tsp'].includes(unit.toLowerCase());
            
        if (isVolumetricOrWeight) {
            return Math.round(amount).toString();
        }
        
        return decimalToFraction(amount);
    };

    // Function to format the unit for display
    const formatUnit = (unit: string) => {
        // Special case for empty units or units that shouldn't be displayed
        if (!unit || unit === '' || unit.toLowerCase() === 'large' || unit.toLowerCase() === 'medium' || unit.toLowerCase() === 'small') {
            return '';
        }
        return unit;
    };

    const shareShoppingList = () => {
        const uncheckedIngredients = ingredients
            .filter(i => !checkedIngredients.has(i.id))
            .map(i => {
                const formattedAmount = formatAmount(i);
                const formattedUnit = formatUnit(i.unit);
                return `• ${formattedAmount}${formattedUnit ? ' ' + formattedUnit : ''} ${i.name}`;
            })
            .join('\n');
        
        const message = `${recipe.title}:

${uncheckedIngredients}

Get Spinach App to start cooking delicious plant-based recipes today!`;
        
        Share.share({
            message: message,
            title: "Spinach Shopping List"
        });
    };

    return (
        <View style={appStyles.container}>
            <View style={styles.titleContainer}>
                <Text style={appStyles.recipeTitle}>{recipe.title}</Text>
            </View>
            <View style={styles.header}>
                <View style={styles.servingsContainer}>
                    <TouchableOpacity
                        style={[appStyles.numberButton, { marginRight: 8 }]}
                        onPress={() => onServingsChange(Math.max(1, servings - 1))}
                    >
                        <Text style={appStyles.numberButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.servingsTextContainer}>
                        <Ionicons name="people" size={24} color={COLORS.primaryDark} />
                        <Text style={[appStyles.numberValue, { fontWeight: '600' }]}>{servings}</Text>
                    </View>
                    <TouchableOpacity
                        style={[appStyles.numberButton, { marginLeft: 8 }]}
                        onPress={() => onServingsChange(servings + 1)}
                    >
                        <Text style={appStyles.numberButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={20} color={COLORS.primaryDark} />
                    <Text style={styles.timeText}>{readyInMinutes} minutes</Text>
                </View>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareShoppingList}
                >
                    <Ionicons name="share-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.ingredientsList}>
                <TouchableOpacity
                    style={styles.toggleAllButton}
                    onPress={toggleAllIngredients}
                >
                    <Text style={{ color: COLORS.primary, fontSize: appStyles.body, fontWeight: '600' }}>
                        {checkedIngredients.size === ingredients.length ? 'Uncheck All' : 'Check All'}
                    </Text>
                </TouchableOpacity>

                {ingredients.map(ingredient => (
                    <TouchableOpacity
                        key={ingredient.id}
                        style={[
                            styles.ingredientItem,
                            checkedIngredients.has(ingredient.id) && styles.checkedIngredient
                        ]}
                        onPress={() => toggleIngredient(ingredient.id)}
                    >
                        <View style={[
                            styles.ingredientCheckbox,
                            { borderColor: COLORS.primary },
                            checkedIngredients.has(ingredient.id) && styles.checkedIngredientCheckbox
                        ]}>
                            {checkedIngredients.has(ingredient.id) && (
                                <Ionicons name="checkmark" size={20} color="#999" />
                            )}
                        </View>
                        <Text style={[
                            styles.ingredientText,
                            { color: COLORS.textLight },
                            checkedIngredients.has(ingredient.id) && styles.checkedIngredientText
                        ]}>
                            {formatAmount(ingredient)}{formatUnit(ingredient.unit) ? ' ' + formatUnit(ingredient.unit) : ''} {ingredient.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={[appStyles.recipeButton, appStyles.cookButton, { margin: 20 }]}
                onPress={onStartSteps}
            >
                <Text style={appStyles.recipeButtonText}>Start Cooking</Text>
            </TouchableOpacity>
        </View>
    );
};

// Define colors here to match the app-wide colors
const COLORS = {
    background: '#f0fdf4',        // Light green background
    primary: '#16a34a',           // Primary green 
    primaryDark: '#166534',       // Dark green for text
    secondaryBg: '#dcfce7',       // Secondary background/highlight
    text: '#166534',              // Main text color (dark green)
    textLight: '#374151',         // Secondary text color (gray)
    white: '#ffffff',             // White color
};

// Keep only the local styles that aren't already in the app styles
const styles = {
    titleContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.secondaryBg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.secondaryBg,
    },
    servingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    servingsTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondaryBg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeText: {
        marginLeft: 4,
        color: COLORS.primaryDark,
    },
    shareButton: {
        padding: 8,
    },
    ingredientsList: {
        flex: 1,
    },
    toggleAllButton: {
        padding: 16,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.secondaryBg,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.secondaryBg,
    },
    checkedIngredient: {
        backgroundColor: COLORS.background,
    },
    ingredientCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedIngredientCheckbox: {
        backgroundColor: COLORS.background,
        borderColor: '#999',
    },
    ingredientText: {
        fontSize: 16,
        flex: 1,
    },
    checkedIngredientText: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
};

export default IngredientsList; 