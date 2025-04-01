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

interface Ingredient {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
    originalAmount: number;
    originalUnit: string;
}

interface IngredientsListProps {
    ingredients: Ingredient[];
    servings: number;
    readyInMinutes: number;
    onServingsChange: (newServings: number) => void;
    onStartSteps: () => void;
}

export const IngredientsList: React.FC<IngredientsListProps> = ({
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

    const shareShoppingList = () => {
        const uncheckedIngredients = ingredients
            .filter(i => !checkedIngredients.has(i.id))
            .map(i => `• ${i.amount} ${i.unit} ${i.name}`)
            .join('\n');
        
        Share.share({
            message: `Shopping List:\n\n${uncheckedIngredients}`,
            title: 'Shopping List',
        });
    };

    const adjustAmount = (amount: number, unit: string) => {
        const baseAmount = amount / servings;
        const adjustedAmount = baseAmount * servings;
        
        if (unit === 'g' || unit === 'ml') {
            return Math.round(adjustedAmount);
        }
        return adjustedAmount.toFixed(1);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.servingsContainer}>
                    <TouchableOpacity
                        style={styles.servingsButton}
                        onPress={() => onServingsChange(Math.max(1, servings - 1))}
                    >
                        <Ionicons name="remove" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.servingsText}>{servings} servings</Text>
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
                        <View style={styles.ingredientCheckbox}>
                            {checkedIngredients.has(ingredient.id) && (
                                <Ionicons name="checkmark" size={20} color="#fff" />
                            )}
                        </View>
                        <Text style={[
                            styles.ingredientText,
                            checkedIngredients.has(ingredient.id) && styles.checkedIngredientText
                        ]}>
                            {adjustAmount(ingredient.amount, ingredient.unit)} {ingredient.unit} {ingredient.name}
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
    servingsText: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 16,
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