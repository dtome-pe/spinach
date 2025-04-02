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
    console.log('RecipeReveal rendering with image URL:', recipe.image);
    
    return (
        <View style={appStyles.recipeRevealContainer}>
            <View style={appStyles.recipeImage}>
                <Image 
                    source={{ uri: recipe.image }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    onError={(error) => {
                        console.error('Image loading error in RecipeReveal:', error.nativeEvent);
                        console.log('Failed to load image URL:', recipe.image);
                        console.log('Image dimensions:', {
                            width: SCREEN_WIDTH,
                            height: IMAGE_HEIGHT
                        });
                    }}
                    onLoad={() => {
                        console.log('Image loaded successfully in RecipeReveal:', recipe.image);
                        console.log('Image dimensions:', {
                            width: SCREEN_WIDTH,
                            height: IMAGE_HEIGHT
                        });
                    }}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 160,
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
        backgroundColor: '#f3f4f6',
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: IMAGE_HEIGHT,
        backgroundColor: '#f3f4f6',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
        paddingBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    tryAnotherButton: {
        backgroundColor: '#f0f0f0',
    },
    startCookingButton: {
        backgroundColor: '#007AFF',
    },
    tryAnotherButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    startCookingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
}); 
