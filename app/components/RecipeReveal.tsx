import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '../styles';

interface RecipeRevealProps {
    recipe: {
        id: number;
        title: string;
        image: string;
        description: string;
        readyInMinutes: number;
        servings: number;
        extendedIngredients: any[];
        analyzedInstructions: { steps: any[] }[];
    };
    onTryAnother: () => void;
    onStartCooking: () => void;
}

export const RecipeReveal: React.FC<RecipeRevealProps> = ({
    recipe,
    onTryAnother,
    onStartCooking,
}) => {
    const handleCook = async () => {
        try {
            const response = await fetch(`http://localhost:3001/cook?id=${recipe.id}`);
            if (!response.ok) {
                throw new Error('Failed to start cooking');
            }
            const data = await response.json();
            console.log('Cooking started:', data);
            // You might want to show a success message or navigate to a cooking screen
        } catch (error) {
            console.error('Error starting cooking:', error);
            // You might want to show an error message to the user
        }
    };

    return (
        <View style={styles.recipeRevealContainer}>
            {/* Recipe Image */}
            <Image
                source={{ uri: recipe.image }}
                style={styles.recipeImage}
                resizeMode="cover"
            />

            {/* Recipe Title */}
            <View style={styles.recipeContent}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeDescription}>{recipe.description}</Text>
                <View style={styles.recipeButtons}>
                    <TouchableOpacity
                        style={[styles.recipeButton, styles.resetButton]}
                        onPress={onTryAnother}
                    >
                        <Text style={styles.recipeButtonText}>Try Another</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.recipeButton, styles.cookButton]}
                        onPress={onStartCooking}
                    >
                        <Text style={styles.recipeButtonText}>Cook</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}; 