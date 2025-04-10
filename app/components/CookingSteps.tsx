import React, { useState, useCallback, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { splitLongSteps } from '../utils/recipeUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface Step {
    number: number;
    step: string;
}

interface CookingStepsProps {
    steps: Step[];
    onComplete: () => void;
    onBack: () => void;
}

export const CookingSteps: React.FC<CookingStepsProps> = ({ steps, onComplete, onBack }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [processedSteps, setProcessedSteps] = useState<Step[]>([]);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    useEffect(() => {
        // Process steps on mount
        setProcessedSteps(splitLongSteps(steps));
    }, [steps]);

    const goToNextStep = useCallback(() => {
        if (currentStep < processedSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, processedSteps.length]);

    const goToPreviousStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            // Directly call onBack for swipe back from first step
            opacity.value = withTiming(0, { duration: 300 });
            setTimeout(() => onBack(), 300);
        }
    }, [currentStep, onBack, opacity]);

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            // Reset state when the gesture begins
            translateY.value = 0;
        })
        .onUpdate((event) => {
            // During the gesture, update translateY to follow the finger
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            if (event.translationY < -50 && currentStep < processedSteps.length - 1) {
                // Swipe up - next step
                translateY.value = withSequence(
                    withTiming(-20, { duration: 100 }),
                    withTiming(0, { duration: 100 })
                );
                opacity.value = withSequence(
                    withTiming(0, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                );
                runOnJS(goToNextStep)();
            } else if (event.translationY > 50) {
                // For both previous step and back, use the same function
                // which will decide what to do based on currentStep
                translateY.value = withSequence(
                    withTiming(20, { duration: 100 }),
                    withTiming(0, { duration: 100 })
                );
                opacity.value = withSequence(
                    withTiming(0, { duration: 100 }),
                    withTiming(1, { duration: 100 })
                );
                runOnJS(goToPreviousStep)();
            } else {
                // If the swipe wasn't significant, spring back to center
                translateY.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { scale: scale.value },
            ],
            opacity: opacity.value,
        };
    });

    const handleComplete = () => {
        scale.value = withSequence(
            withTiming(1.1, { duration: 200 }),
            withTiming(1, { duration: 200 })
        );
        setTimeout(onComplete, 500);
    };

    return (
        <View style={styles.container}>
            <View style={[
                styles.upSwipeIndicator, 
                { opacity: currentStep > 0 ? 1 : 0 }
            ]}>
                <Ionicons name="chevron-up" size={24} color="rgba(22, 101, 52, 0.4)" />
            </View>
            
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.stepCard, cardStyle]}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{processedSteps[currentStep]?.number || currentStep + 1}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.stepText}>{processedSteps[currentStep]?.step || ''}</Text>
                    </View>
                </Animated.View>
            </GestureDetector>

            {currentStep === processedSteps.length - 1 && (
                <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleComplete}
                >
                    <Text style={styles.completeButtonText}>Bon Appétit! 🍽️</Text>
                </TouchableOpacity>
            )}

            {currentStep < processedSteps.length - 1 && (
                <View style={styles.swipeIndicator}>
                    <Ionicons name="chevron-down" size={24} color="rgba(22, 101, 52, 0.4)" />
                    {currentStep === 0 && (
                        <Text style={styles.swipeText}>Swipe to navigate</Text>
                    )}
                </View>
            )}
        </View>
    );
};

// Add default export
export default CookingSteps;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'ios' ? 35 : 25,
        paddingHorizontal: 20,
    },
    stepCard: {
        height: SCREEN_HEIGHT * 0.65,
        marginHorizontal: 20,
        marginVertical: 20,
        padding: 20,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 5,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: SCREEN_WIDTH - 80,
        alignSelf: 'center',
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepNumberText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    textContainer: {
        width: '100%',
        flexDirection: 'row',
    },
    stepText: {
        fontSize: 22,
        textAlign: 'left',
        lineHeight: 32,
        color: COLORS.textLight,
        flexShrink: 1,
    },
    completeButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 16,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignSelf: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5,
    },
    completeButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    swipeIndicator: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    swipeText: {
        marginTop: 5,
        fontSize: 14,
        color: COLORS.textLight,
    },
    upSwipeIndicator: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        height: 30, // Fixed height for the indicator area
    },
}); 