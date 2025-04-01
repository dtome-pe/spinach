import React, { useState, useRef } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import { SpinachLogo } from './components/Logo';
import { RecipeReveal } from './components/RecipeReveal';
import { Settings, Allergens } from './components/Settings';

// Get screen dimensions
const { width } = Dimensions.get('window');

type UserSettings = {
    useMetric: boolean;
    maxCookingTime: number;
    allergens: Allergens;
};

type VeggieAnimation = {
    translateY: Animated.Value;
    translateX: Animated.Value;
    rotate: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
};

export default function App() {
    const [isSpinning, setIsSpinning] = useState(false);
    const [showRecipe, setShowRecipe] = useState(false);
    const [recipe, setRecipe] = useState({
        id: 0,
        title: "",
        image: "",
        description: ""
    });
    const spinAnim = useRef(new Animated.Value(0)).current;
    const outerCircleOpacity = useRef(new Animated.Value(0.7)).current;
    const innerCircleOpacity = useRef(new Animated.Value(1)).current;
    const outerCircleRotate = useRef(new Animated.Value(0)).current;
    const innerCircleRotate = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const buttonOpacity = useRef(new Animated.Value(1)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const contentTranslateY = useRef(new Animated.Value(0)).current;
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<UserSettings>({
        useMetric: true,
        maxCookingTime: 60,
        allergens: {
            gluten: false,
            grain: false,
            peanut: false,
            sesame: false,
            soy: false,
            sulfite: false,
            treeNut: false,
            wheat: false,
        }
    });

    // Increased number of vegetables significantly
    const veggieAnimations = useRef<VeggieAnimation[]>(
        Array(40).fill(0).map((_: unknown, index: number) => ({
            translateY: new Animated.Value(-100),
            translateX: new Animated.Value(0),
            rotate: new Animated.Value(0),
            opacity: new Animated.Value(0),
            scale: new Animated.Value(1),
        }))
    ).current;

    // Helper function to get a random vegetable emoji and its color
    const getVeggieEmoji = (index: number): { emoji: string; color: string } => {
        const veggies = [
            { emoji: "🥕", color: "#ff6b35" },  // Carrot
            { emoji: "🥦", color: "#4CAF50" },  // Broccoli
            { emoji: "🍆", color: "#7B1FA2" },  // Eggplant
            { emoji: "🥬", color: "#8BC34A" },  // Lettuce
            { emoji: "🥑", color: "#33691E" },  // Avocado
            { emoji: "🧅", color: "#B39DDB" },  // Onion
            { emoji: "🥒", color: "#2E7D32" },  // Cucumber
            { emoji: "🌶️", color: "#D32F2F" },  // Pepper
            { emoji: "🍅", color: "#D32F2F" },  // Tomato
            { emoji: "🥔", color: "#795548" },  // Potato
        ];
        return veggies[index % veggies.length];
    };

    const createVeggieAnimation = (index: number): Animated.CompositeAnimation => {
        const buttonCenterY = 450;
        const numVeggies = veggieAnimations.length;
        
        // Calculate angle with faster rotation for emission points
        const baseAngle = (2 * Math.PI) / numVeggies;
        const rotationSpeed = 1.69; // Reduced from 2.25 to 1.69 (25% slower)
        const finalAngle = (index * baseAngle) + (index * baseAngle * rotationSpeed);
        
        // Calculate final position (radiating outward)
        const radiateDistance = 600 + Math.random() * 200;
        const finalX = Math.cos(finalAngle) * radiateDistance;
        const finalY = Math.sin(finalAngle) * radiateDistance;

        // Shorter, more frequent timing
        const baseDuration = 1500; // Reduced from 2500 to 1500
        const sequentialDelay = index * 50; // Reduced from 100 to 50 for more frequent emissions
        const randomDuration = baseDuration + Math.random() * 300; // Reduced random variation
        const randomScale = 1.2 + Math.random() * 1.3;

        // Reset initial values to center position
        veggieAnimations[index].translateY.setValue(buttonCenterY);
        veggieAnimations[index].translateX.setValue(0);
        veggieAnimations[index].rotate.setValue(0);
        veggieAnimations[index].opacity.setValue(0);
        veggieAnimations[index].scale.setValue(0.3);

        return Animated.parallel([
            // Radial translation with easing
            Animated.timing(veggieAnimations[index].translateY, {
                toValue: buttonCenterY + finalY,
                duration: randomDuration,
                delay: sequentialDelay,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.timing(veggieAnimations[index].translateX, {
                toValue: finalX,
                duration: randomDuration,
                delay: sequentialDelay,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            // Moderate rotation for the veggies themselves
            Animated.timing(veggieAnimations[index].rotate, {
                toValue: 4 + Math.random() * 2,
                duration: randomDuration,
                delay: sequentialDelay,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            // Scale with gentle burst effect
            Animated.sequence([
                // Quick scale up at start
                Animated.timing(veggieAnimations[index].scale, {
                    toValue: randomScale * 1.1,
                    duration: 150, // Reduced from 200
                    delay: sequentialDelay,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                // Settle to normal size
                Animated.timing(veggieAnimations[index].scale, {
                    toValue: randomScale,
                    duration: 150, // Reduced from 200
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                // Faster scale down as they fly away
                Animated.timing(veggieAnimations[index].scale, {
                    toValue: randomScale * 0.7,
                    duration: randomDuration - 300, // Reduced from 400
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            // Opacity with shorter visibility
            Animated.sequence([
                // Fade in quickly
                Animated.timing(veggieAnimations[index].opacity, {
                    toValue: 1,
                    duration: 100, // Reduced from 150
                    delay: sequentialDelay,
                    useNativeDriver: true,
                }),
                // Stay visible for shorter time
                Animated.timing(veggieAnimations[index].opacity, {
                    toValue: 1,
                    duration: randomDuration - 200, // Reduced from 300
                    useNativeDriver: true,
                }),
                // Faster fade out
                Animated.timing(veggieAnimations[index].opacity, {
                    toValue: 0,
                    duration: 150, // Reduced from 200
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        ]);
    };

    const handleSpin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setShowRecipe(false);
        setShowSettings(false);

        // Start animations
        Animated.parallel([
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            ...veggieAnimations.flatMap(animation => [
                Animated.timing(animation.translateY, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(animation.translateX, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(animation.rotate, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(animation.opacity, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                Animated.timing(animation.scale, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                })
            ])
        ]).start();

        try {
            // Prepare query parameters
            const queryParams = new URLSearchParams({
                maxTime: settings.maxCookingTime.toString(),
                ...Object.entries(settings.allergens)
                    .filter(([_, value]) => value) // Only include allergens that are set to true
                    .map(([key]) => key)
                    .reduce((acc, key) => ({ ...acc, [key]: 'true' }), {})
            });

            const response = await fetch(`http://localhost:3001/spin?${queryParams}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipe');
            }
            const data = await response.json();
            setRecipe(data);
            setShowRecipe(true);
        } catch (error) {
            console.error('Error fetching recipe:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsSpinning(false);
        }
    };

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1440deg'],
    });

    const outerRotate = outerCircleRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '1440deg'],
    });

    const innerRotate = innerCircleRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-1440deg'],
    });

    const resetApp = () => {
        setShowRecipe(false);
        // Reset all animations
        contentOpacity.setValue(1);
        contentTranslateY.setValue(0);
        buttonScale.setValue(1);
        buttonOpacity.setValue(1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {!showRecipe && !showSettings ? (
                    <>
                        <Animated.View style={{
                            opacity: contentOpacity,
                            transform: [{ translateY: contentTranslateY }],
                        }}>
                            <SpinachLogo size="large" />
                            <Text style={styles.tagline}>
                                Give it a <Text style={styles.taglineHighlight}>SPIN</Text> to discover today's mystery vegan recipe!
                            </Text>
                        </Animated.View>

                        <View style={styles.spinButtonContainer}>
                            {/* Decorative circles */}
                            <Animated.View style={[
                                styles.decorativeCircleOuter,
                                {
                                    opacity: Animated.multiply(outerCircleOpacity, buttonOpacity),
                                    transform: [
                                        { scale: buttonScale },
                                        { rotate: outerRotate }
                                    ]
                                }
                            ]} />
                            <Animated.View style={[
                                styles.decorativeCircleInner,
                                {
                                    opacity: Animated.multiply(innerCircleOpacity, buttonOpacity),
                                    transform: [
                                        { scale: buttonScale },
                                        { rotate: innerRotate }
                                    ]
                                }
                            ]} />

                            {/* Main spin button */}
                            <Animated.View style={[
                                styles.spinButtonWrapper,
                                {
                                    opacity: buttonOpacity,
                                    transform: [
                                        { scale: buttonScale },
                                        { rotate: isSpinning ? spin : '0deg' }
                                    ]
                                }
                            ]}>
                                <TouchableOpacity
                                    style={styles.spinButton}
                                    onPress={handleSpin}
                                    disabled={isSpinning}
                                    activeOpacity={0.8}
                                >
                                    {isSpinning ? (
                                        <View style={styles.spinButtonWrapper}>
                                            <TouchableOpacity
                                                style={styles.spinButton}
                                                onPress={handleSpin}
                                                disabled={isSpinning}
                                            >
                                                <Text style={styles.spinButtonText}>SPIN</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View>
                                            <Svg height="100%" width="100%" viewBox="0 0 100 100" style={styles.spinButtonSvg}>
                                                <Circle
                                                    cx="50"
                                                    cy="50"
                                                    r="40"
                                                    stroke="rgba(255,255,255,0.3)"
                                                    strokeWidth="2"
                                                    strokeDasharray="5,5"
                                                    fill="none"
                                                />
                                                <Path
                                                    d="M 85,50 L 90,45 L 95,50"
                                                    stroke="rgba(255,255,255,0.7)"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    fill="none"
                                                />
                                            </Svg>
                                            <View style={styles.spinTextContainer}>
                                                <Text style={styles.spinButtonText}>SPIN</Text>
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        </View>

                        <Animated.View style={{
                            opacity: contentOpacity,
                            transform: [{ translateY: contentTranslateY }],
                        }}>
                            <Text style={styles.footerText}>
                                Eco-friendly • Organic • 100% Plant-based
                            </Text>
                        </Animated.View>

                        {/* Add Settings Button */}
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => setShowSettings(true)}
                        >
                            <Feather name="settings" size={24} color="#16a34a" />
                        </TouchableOpacity>
                    </>
                ) : null}

                {/* Falling vegetables - always visible */}
                {veggieAnimations.map((anim, index) => {
                    const veggie = getVeggieEmoji(index);
                    return (
                        <Animated.View
                            key={index}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: [
                                    { translateY: anim.translateY },
                                    { translateX: anim.translateX },
                                    { rotate: anim.rotate.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg']
                                    })},
                                    { scale: anim.scale }
                                ],
                                opacity: anim.opacity,
                                zIndex: showRecipe ? 1 : 0,
                            }}
                        >
                            <View style={{
                                backgroundColor: 'rgba(22, 163, 74, 0.15)',
                                borderRadius: 20,
                                padding: 4,
                            }}>
                                <Text style={{ 
                                    fontSize: 40,
                                    opacity: 0.9,
                                }}>{veggie.emoji}</Text>
                            </View>
                        </Animated.View>
                    );
                })}

                {showRecipe ? <RecipeReveal onReset={resetApp} recipe={recipe} /> : null}
                {showSettings ? (
                    <Settings 
                        settings={settings} 
                        onUpdateSettings={setSettings}
                        onClose={() => setShowSettings(false)}
                    />
                ) : null}
            </View>
        </SafeAreaView>
    );
} 