import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles as appStyles } from '../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.75;

interface RecipeRevealProps {
    recipe: {
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
    return (
        <View style={appStyles.recipeRevealContainer}>
            <View style={appStyles.recipeImage}>
                <Image 
                    source={{ uri: recipe.image }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                />
            </View>
            <View style={appStyles.recipeContent}>
                <Text style={appStyles.recipeTitle}>{recipe.title}</Text>
                <View style={appStyles.recipeButtons}>
                    <TouchableOpacity
                        style={[appStyles.recipeButton, appStyles.resetButton]}
                        onPress={onTryAnother}
                    >
                        <Text style={appStyles.recipeButtonText}>Try Another</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[appStyles.recipeButton, appStyles.cookButton]}
                        onPress={onStartCooking}
                    >
                        <Text style={appStyles.recipeButtonText}>Start Cooking</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default RecipeReveal; 