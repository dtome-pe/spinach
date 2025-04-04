import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Share,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { decimalToFraction } from '../utils/recipeUtils';
import { styles as appStyles } from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    onMetricChange?: (useMetric: boolean) => void;
    useMetric?: boolean;
}

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

// Font sizes
const FONTS = {
    body: 16,
};

export const IngredientsList: React.FC<IngredientsListProps> = ({
    recipe,
    ingredients,
    servings,
    readyInMinutes,
    onServingsChange,
    onStartSteps,
    onMetricChange,
    useMetric: externalUseMetric,
}) => {
    const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
    const [internalUseMetric, setInternalUseMetric] = useState<boolean>(true);
    const [localIngredients, setLocalIngredients] = useState<Ingredient[]>(ingredients);
    
    // Determine which metric value to use - external prop or internal state
    const useMetric = externalUseMetric !== undefined ? externalUseMetric : internalUseMetric;

    // Load user settings on mount
    useEffect(() => {
        if (externalUseMetric === undefined) {
            loadSettings();
        }
    }, [externalUseMetric]);

    // Update local ingredients when props change or measurement system changes
    useEffect(() => {
        updateIngredientsDisplay();
    }, [ingredients, useMetric]);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem('recipeSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (onMetricChange) {
                    onMetricChange(settings.useMetric);
                } else {
                    setInternalUseMetric(settings.useMetric);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const updateIngredientsDisplay = () => {
        const updatedIngredients = ingredients.map(ingredient => {
            // Update the measurement system if needed
            const measureSystem = useMetric ? 'metric' : 'us';
            
            // If measurement system changed, update the displayed values
            let amount = ingredient.amount;
            let unit = ingredient.unit;
            
            if (ingredient.measureSystem !== measureSystem && ingredient.measures) {
                amount = ingredient.measures[measureSystem]?.amount || amount;
                unit = ingredient.measures[measureSystem]?.unitShort || unit;
            }
            
            return {
                ...ingredient,
                amount,
                unit,
                measureSystem
            };
        });
        
        setLocalIngredients(updatedIngredients);
    };

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
        if (checkedIngredients.size === localIngredients.length) {
            setCheckedIngredients(new Set());
        } else {
            setCheckedIngredients(new Set(localIngredients.map(i => i.id)));
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
        const uncheckedIngredients = localIngredients
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

    // Handle servings change with a max limit of 99
    const handleServingsDecrease = () => {
        onServingsChange(Math.max(1, servings - 1));
    };

    const handleServingsIncrease = () => {
        // Limit max servings to 99
        onServingsChange(Math.min(99, servings + 1));
    };

    return (
        <View style={appStyles.container}>
            <View style={[styles.titleContainer, { paddingTop: Platform.OS === 'ios' ? 60 : 50 }]}>
                <Text style={appStyles.recipeTitle}>{recipe.title}</Text>
            </View>
            <View style={styles.header}>
                <View style={styles.servingsContainer}>
                    <TouchableOpacity
                        style={[appStyles.numberButton, { marginRight: 4 }]}
                        onPress={handleServingsDecrease}
                    >
                        <Text style={appStyles.numberButtonText}>-</Text>
                    </TouchableOpacity>
                    <View style={styles.servingsTextContainer}>
                        <Ionicons name="people" size={20} color={COLORS.primaryDark} />
                        <Text style={[appStyles.numberValue, { 
                            fontWeight: '600', 
                            minWidth: 28, 
                            marginHorizontal: 4
                        }]}>{servings}</Text>
                    </View>
                    <TouchableOpacity
                        style={[appStyles.numberButton, { marginLeft: 4 }]}
                        onPress={handleServingsIncrease}
                    >
                        <Text style={appStyles.numberButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={[styles.timeContainer, { marginLeft: 'auto' }]}>
                    <Ionicons name="time-outline" size={20} color={COLORS.primaryDark} />
                    <Text style={styles.timeText}>{readyInMinutes} minutes</Text>
                </View>
            </View>

            <ScrollView style={styles.ingredientsList}>
                <TouchableOpacity
                    style={styles.toggleAllButton}
                    onPress={toggleAllIngredients}
                >
                    <Text style={{ color: COLORS.primary, fontSize: FONTS.body, fontWeight: '600' }}>
                        {checkedIngredients.size === localIngredients.length ? 'Uncheck All' : 'Check All'}
                    </Text>
                </TouchableOpacity>

                {localIngredients.map((ingredient, index) => (
                    <TouchableOpacity
                        key={`ingredient-${ingredient.id}-${index}`}
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

                {/* Share Shopping List button at the bottom of the ingredients list */}
                <TouchableOpacity
                    style={styles.shareListContainer}
                    onPress={shareShoppingList}
                >
                    <View style={styles.shareIconContainer}>
                        <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                    </View>
                    <Text style={styles.shareListText}>Share Shopping List</Text>
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
                style={styles.cookButton}
                onPress={onStartSteps}
            >
                <Text style={styles.cookButtonText}>Start Cooking</Text>
            </TouchableOpacity>
        </View>
    );
};

// Keep only the local styles that aren't already in the app styles
const styles = StyleSheet.create({
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
        marginHorizontal: 8,
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
    shareListContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.secondaryBg,
        marginTop: 8,
    },
    shareIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shareListText: {
        color: COLORS.primary,
        fontSize: FONTS.body,
        fontWeight: '600',
    },
    cookButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
        marginHorizontal: 24,
    },
    cookButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default IngredientsList; 