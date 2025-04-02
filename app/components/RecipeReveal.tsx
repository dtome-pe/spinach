import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image 
                    source={{ uri: recipe.image }} 
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{recipe.title}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.tryAnotherButton]}
                        onPress={onTryAnother}
                    >
                        <Ionicons name="refresh" size={24} color="#007AFF" />
                        <Text style={styles.tryAnotherButtonText}>Try Another</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.startCookingButton]}
                        onPress={onStartCooking}
                    >
                        <Ionicons name="restaurant" size={24} color="#fff" />
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
        backgroundColor: '#fff',
    },
    imageContainer: {
        width: '100%',
        height: IMAGE_HEIGHT,
        backgroundColor: '#f3f4f6',
    },
    image: {
        width: '100%',
        height: '100%',
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