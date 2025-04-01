import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { decimalToFraction } from '../utils/recipeUtils';

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
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>{recipe.title}</Text>
            </View>
            <View style={styles.header}>
                <View style={styles.servingsContainer}>
                    <TouchableOpacity
                        style={styles.servingsButton}
                        onPress={() => onServingsChange(Math.max(1, servings - 1))}
                    >
                        <Ionicons name="remove" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <View style={styles.servingsTextContainer}>
                        <Ionicons name="people" size={24} color="#333" />
                        <Text style={styles.servingsText}>{servings}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.servingsButton}
                        onPress={() => onServingsChange(servings + 1)}
                    >
                        <Ionicons name="add" size={24} color="#007AFF" />
                    </TouchableOpacity>
                </View>
                <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.timeText}>{readyInMinutes} minutes</Text>
                </View>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareShoppingList}
                >
                    <Ionicons name="share-outline" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.ingredientsList}>
                <TouchableOpacity
                    style={styles.toggleAllButton}
                    onPress={toggleAllIngredients}
                >
                    <Text style={styles.toggleAllText}>
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
                            checkedIngredients.has(ingredient.id) && styles.checkedIngredientCheckbox
                        ]}>
                            {checkedIngredients.has(ingredient.id) && (
                                <Ionicons name="checkmark" size={20} color="#999" />
                            )}
                        </View>
                        <Text style={[
                            styles.ingredientText,
                            checkedIngredients.has(ingredient.id) && styles.checkedIngredientText
                        ]}>
                            {formatAmount(ingredient)}{formatUnit(ingredient.unit) ? ' ' + formatUnit(ingredient.unit) : ''} {ingredient.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.startCookingButton}
                onPress={onStartSteps}
            >
                <Text style={styles.startCookingButtonText}>Start Cooking</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    titleContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    servingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    servingsButton: {
        padding: 8,
    },
    servingsTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    servingsText: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    timeText: {
        marginLeft: 4,
        color: '#666',
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
        borderBottomColor: '#eee',
    },
    toggleAllText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    checkedIngredient: {
        backgroundColor: '#f8f8f8',
    },
    ingredientCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkedIngredientCheckbox: {
        backgroundColor: '#f8f8f8',
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
    startCookingButton: {
        backgroundColor: '#007AFF',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    startCookingButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
}); 