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
    Easing,
    Animated as RNAnimated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

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
    const spinValue = useRef(new RNAnimated.Value(0)).current;
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onBack();
            return true; // Prevent default back behavior
        });

        if (isSpinning) {
            RNAnimated.loop(
                RNAnimated.timing(spinValue, {
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

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            translateX.value = 0;
        })
        .onUpdate((event) => {
            if (event.translationX > -20) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD && onBack) {
                translateX.value = withTiming(SCREEN_WIDTH, { duration: 300 });
                opacity.value = withTiming(0, { duration: 300 });
                runOnJS(onBack)();
            } else {
                translateX.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
            opacity: opacity.value,
        };
    });

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.container, cardStyle]}>
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
                            <RNAnimated.View style={{ transform: [{ rotate: spin }] }}>
                                <Ionicons 
                                    name="refresh" 
                                    size={24} 
                                    color={isSpinning ? COLORS.textLight : COLORS.primary} 
                                />
                            </RNAnimated.View>
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
            </Animated.View>
        </GestureDetector>
    );
};

export default RecipeReveal;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        width: '100%',
        paddingTop: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.05 : SCREEN_HEIGHT * 0.03,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SCREEN_WIDTH * 0.05,
        justifyContent: 'center',
    },
    title: {
        fontSize: SCREEN_WIDTH * 0.07,
        fontWeight: 'bold',
        marginBottom: SCREEN_HEIGHT * 0.04,
        color: COLORS.primaryDark,
        textAlign: 'center',
        paddingHorizontal: SCREEN_WIDTH * 0.05,
    },
    imageContainer: {
        width: SCREEN_WIDTH * 0.9,
        height: SCREEN_HEIGHT * 0.3,
        borderRadius: SCREEN_WIDTH * 0.04,
        overflow: 'hidden',
        marginBottom: SCREEN_HEIGHT * 0.05,
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
        paddingHorizontal: SCREEN_WIDTH * 0.05,
        gap: SCREEN_WIDTH * 0.03,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SCREEN_WIDTH * 0.04,
        borderRadius: SCREEN_WIDTH * 0.03,
        minWidth: SCREEN_WIDTH * 0.35,
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
        fontSize: SCREEN_WIDTH * 0.04,
        fontWeight: '600',
        marginLeft: SCREEN_WIDTH * 0.02,
    },
    startCookingButtonText: {
        color: COLORS.white,
        fontSize: SCREEN_WIDTH * 0.04,
        fontWeight: '600',
        marginLeft: SCREEN_WIDTH * 0.02,
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