import React, { useState, useCallback } from 'react';
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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);

    const goToNextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, steps.length]);

    const goToPreviousStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            onBack();
        }
    }, [currentStep, onBack]);

    const handleBackNavigation = useCallback(() => {
        onBack();
    }, [onBack]);

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
            if (event.translationY < -50 && currentStep < steps.length - 1) {
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
                if (currentStep > 0) {
                    // Swipe down - previous step
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
                    // Swipe down at first step - go back
                    opacity.value = withTiming(0, { duration: 300 });
                    setTimeout(() => runOnJS(handleBackNavigation)(), 300);
                }
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

    const handleNextStep = () => {
        if (currentStep < steps.length - 1) {
            translateY.value = withSequence(
                withTiming(-20, { duration: 100 }),
                withTiming(0, { duration: 100 })
            );
            opacity.value = withSequence(
                withTiming(0, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePreviousStep = () => {
        if (currentStep > 0) {
            translateY.value = withSequence(
                withTiming(20, { duration: 100 }),
                withTiming(0, { duration: 100 })
            );
            opacity.value = withSequence(
                withTiming(0, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );
            setCurrentStep(prev => prev - 1);
        } else {
            onBack();
        }
    };

    return (
        <View style={styles.container}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.stepCard, cardStyle]}>
                    <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{steps[currentStep].step}</Text>
                </Animated.View>
            </GestureDetector>

            <View style={styles.navigationButtons}>
                <TouchableOpacity
                    style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
                    onPress={handlePreviousStep}
                    disabled={currentStep === 0}
                >
                    <Ionicons name="chevron-up" size={24} color={currentStep === 0 ? "#ccc" : "#007AFF"} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.navButton, currentStep === steps.length - 1 && styles.navButtonDisabled]}
                    onPress={handleNextStep}
                    disabled={currentStep === steps.length - 1}
                >
                    <Ionicons name="chevron-down" size={24} color={currentStep === steps.length - 1 ? "#ccc" : "#007AFF"} />
                </TouchableOpacity>
            </View>

            {currentStep === steps.length - 1 && (
                <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleComplete}
                >
                    <Text style={styles.completeButtonText}>Bon Appétit! 🍽️</Text>
                </TouchableOpacity>
            )}

            <View style={styles.swipeIndicator}>
                <Ionicons name="chevron-down" size={24} color="rgba(0,0,0,0.3)" />
                <Text style={styles.swipeText}>Swipe or tap arrows to navigate</Text>
            </View>
        </View>
    );
};

// Add default export
export default CookingSteps;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    stepCard: {
        height: SCREEN_HEIGHT * 0.7,
        margin: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    stepText: {
        fontSize: 24,
        textAlign: 'center',
        lineHeight: 36,
        color: '#333',
    },
    navigationButtons: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: [{ translateY: -50 }],
        alignItems: 'center',
    },
    navButton: {
        padding: 10,
        marginVertical: 5,
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 20,
    },
    navButtonDisabled: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    completeButton: {
        backgroundColor: '#007AFF',
        padding: 20,
        borderRadius: 10,
        margin: 20,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    swipeIndicator: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        opacity: 0.7,
    },
    swipeText: {
        color: 'rgba(0,0,0,0.3)',
        fontSize: 14,
        marginTop: 5,
    },
}); 