import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
    BackHandler,
    Animated,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles as appStyles } from '../styles';

const { width, height } = Dimensions.get('window');
// Set image height to be at most 1/3 of the screen height with padding
const IMAGE_HEIGHT = Math.min(width * 0.6, height * 0.3);
const IMAGE_WIDTH = width - 40; // Adding padding of 20 on each side

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
    isSpinning: boolean;
    onTryAnother: () => void;
    onStartCooking: () => void;
    onBack: () => void;
}

export const RecipeReveal: React.FC<RecipeRevealProps> = ({
    recipe,
    isSpinning,
    onTryAnother,
    onStartCooking,
    onBack,
}) => {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onBack();
            return true; // Prevent default back behavior
        });

        if (isSpinning) {
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            spinValue.setValue(0);
        }

        return () => {
            backHandler.remove(); // Cleanup on unmount
        };
    }, [onBack]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

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
                        style={[
                            styles.button, 
                            styles.tryAnotherButton,
                            isSpinning && styles.disabledButton
                        ]}
                        onPress={onTryAnother}
                        disabled={isSpinning}
                    >
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons 
                                name="refresh" 
                                size={24} 
                                color={isSpinning ? COLORS.textLight : COLORS.primary} 
                            />
                        </Animated.View>
                        <Text style={[
                            styles.tryAnotherButtonText,
                            isSpinning && styles.disabledButtonText
                        ]}>Try Another</Text>
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
        paddingTop: Platform.OS === 'ios' ? height * 0.05 : height * 0.03,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        justifyContent: 'center',
    },
    title: {
        fontSize: width * 0.07,
        fontWeight: 'bold',
        marginBottom: height * 0.04,
        color: COLORS.primaryDark,
        textAlign: 'center',
        paddingHorizontal: width * 0.05,
    },
    imageContainer: {
        width: width * 0.9,
        height: height * 0.3,
        borderRadius: width * 0.04,
        overflow: 'hidden',
        marginBottom: height * 0.05,
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
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: width * 0.05,
        gap: width * 0.03,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: width * 0.04,
        borderRadius: width * 0.03,
        minWidth: width * 0.35,
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
        fontSize: width * 0.04,
        fontWeight: '600',
        marginLeft: width * 0.02,
    },
    startCookingButtonText: {
        color: COLORS.white,
        fontSize: width * 0.04,
        fontWeight: '600',
        marginLeft: width * 0.02,
    },
    disabledButton: {
        opacity: 0.7,
        backgroundColor: '#e5e7eb',
        borderColor: '#9ca3af',
    },
    disabledButtonText: {
        color: '#6b7280',
    },
}); 