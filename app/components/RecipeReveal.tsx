import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles as appStyles } from '../styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Set image height to be at most 1/3 of the screen height with padding
const IMAGE_HEIGHT = Math.min(SCREEN_WIDTH * 0.6, SCREEN_HEIGHT * 0.3);
const IMAGE_WIDTH = SCREEN_WIDTH - 40; // Adding padding of 20 on each side

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
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{recipe.title}</Text>
                
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: recipe.image }} 
                        style={styles.image}
                        resizeMode="cover"
                        onError={(error) => {
                            console.error('Image loading error in RecipeReveal:', error.nativeEvent);
                            console.log('Failed to load image URL:', recipe.image);
                        }}
                    />
                </View>
                
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.tryAnotherButton]}
                        onPress={onTryAnother}
                    >
                        <Ionicons name="refresh" size={24} color={COLORS.primary} />
                        <Text style={styles.tryAnotherButtonText}>Try Another</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.startCookingButton]}
                        onPress={onStartCooking}
                    >
                        <Ionicons name="restaurant" size={24} color={COLORS.white} />
                        <Text style={styles.startCookingButtonText}>Start Cooking</Text>
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
        backgroundColor: COLORS.background,
        width: '100%',
        paddingTop: Platform.OS === 'ios' ? 45 : 35, // Slightly less space at the top
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        justifyContent: 'flex-start', // Align content from top instead of center
        paddingTop: 30, // Add some padding at the top
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30, // More space between title and image
        color: COLORS.primaryDark,
        textAlign: 'center',
    },
    imageContainer: {
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT * 1.2, // Slightly larger image
        borderRadius: 15,
        overflow: 'hidden',
        marginBottom: 35, // More space before buttons
        borderWidth: 1,
        borderColor: COLORS.secondaryBg,
    },
    image: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.secondaryBg,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
        marginBottom: 20,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
    },
    tryAnotherButton: {
        backgroundColor: COLORS.secondaryBg,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    startCookingButton: {
        backgroundColor: COLORS.primary,
    },
    tryAnotherButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    startCookingButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
}); 