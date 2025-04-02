import React, { useState, useRef, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    Alert,
    StyleSheet,
    Platform,
} from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { Feather, Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { SpinachLogo } from './components/Logo';
import { RecipeReveal } from './components/RecipeReveal';
import { Settings, UserSettings } from './components/Settings';
import { IngredientsList } from './components/IngredientsList';
import { CookingSteps } from './components/CookingSteps';
import { Favorites } from './components/Favorites';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, processRecipeData, adjustServings } from './utils/recipeUtils';
import { API_CONFIG } from './config';
import { testApiConnection } from './utils/apiTest';
import { cacheRecipe, getCachedRecipe, getRecentRecipeIds } from './utils/cacheUtils';
import { TEST_MODE } from '@env';

// Get screen dimensions
const { width } = Dimensions.get('window');

type VeggieAnimation = {
    translateY: Animated.Value;
    translateX: Animated.Value;
    rotate: Animated.Value;
    opacity: Animated.Value;
    scale: Animated.Value;
};

type AppState = 'landing' | 'recipe' | 'ingredients' | 'cooking';

export default function App() {
    const [isSpinning, setIsSpinning] = useState(false);
    const [showRecipe, setShowRecipe] = useState(false);
    const [currentState, setCurrentState] = useState<AppState>('landing');
    const [recipe, setRecipe] = useState<Recipe | null>(null);
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
    const [showSettings, setShowSettings] = useState(false);
    const [showFavorites, setShowFavorites] = useState(false);
    const [servings, setServings] = useState(4);

    const spinAnim = useRef(new Animated.Value(0)).current;
    const outerCircleOpacity = useRef(new Animated.Value(0.7)).current;
    const innerCircleOpacity = useRef(new Animated.Value(1)).current;
    const outerCircleRotate = useRef(new Animated.Value(0)).current;
    const innerCircleRotate = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;
    const buttonOpacity = useRef(new Animated.Value(1)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const contentTranslateY = useRef(new Animated.Value(0)).current;

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

    useEffect(() => {
        loadSettings();
        
        // Test API connection on startup
        testApiConnection().then(success => {
            if (success) {
                console.log('✅ Ready to fetch recipes!');
            }
        });
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem('recipeSettings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

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
                    duration: 150,
                    delay: sequentialDelay,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                // Settle to normal size
                Animated.timing(veggieAnimations[index].scale, {
                    toValue: randomScale,
                    duration: 150,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                // Faster scale down as they fly away
                Animated.timing(veggieAnimations[index].scale, {
                    toValue: randomScale * 0.7,
                    duration: randomDuration - 300,
                    easing: Easing.in(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
            // Opacity with shorter visibility
            Animated.sequence([
                // Fade in quickly
                Animated.timing(veggieAnimations[index].opacity, {
                    toValue: 1,
                    duration: 100,
                    delay: sequentialDelay,
                    useNativeDriver: true,
                }),
                // Stay visible for shorter time
                Animated.timing(veggieAnimations[index].opacity, {
                    toValue: 1,
                    duration: randomDuration - 200,
                    useNativeDriver: true,
                }),
                // Faster fade out
                Animated.timing(veggieAnimations[index].opacity, {
                    toValue: 0,
                    duration: 150,
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
        ]).start(async () => {
            try {
                // Test the API connection before making the actual request
                const connectionSuccess = await testApiConnection();
                if (!connectionSuccess) {
                    // If we're offline, try to get a random cached recipe
                    try {
                        const recentRecipeIds = await getRecentRecipeIds();
                        if (recentRecipeIds.length > 0) {
                            // Get a random recipe from cache
                            const randomIndex = Math.floor(Math.random() * recentRecipeIds.length);
                            const randomId = recentRecipeIds[randomIndex];
                            const cachedRecipe = await getCachedRecipe(randomId);
                            
                            if (cachedRecipe) {
                                Alert.alert(
                                    "Offline Mode", 
                                    "You're currently offline. Showing a recipe from your cache.",
                                    [{ text: "OK" }]
                                );
                                setRecipe(cachedRecipe);
                                setShowRecipe(true);
                                setCurrentState('recipe');
                                setIsSpinning(false);
                                return;
                            }
                        }
                    } catch (cacheError) {
                        console.error('Error retrieving from cache:', cacheError);
                    }
                    
                    // If we couldn't get a cached recipe
                    setIsSpinning(false);
                    return;
                }

                const queryParams = new URLSearchParams({
                    maxTime: settings.maxCookingTime.toString(),
                    ...Object.entries(settings.allergens)
                        .filter(([_, value]) => value)
                        .map(([key]) => key)
                        .reduce((acc, key) => ({ ...acc, [key]: 'true' }), {})
                });

                const response = await fetch(`${API_CONFIG.baseURL}/spin?${queryParams}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recipe');
                }
                const data = await response.json();
                setRecipe(data);
                setShowRecipe(true);
                setCurrentState('recipe');

                // Cache the recipe for offline use
                if (data) {
                    cacheRecipe(data);
                }
            } catch (error) {
                console.error('Error fetching recipe:', error);
                Alert.alert('Error', 'Failed to fetch recipe. Please try again.');
            } finally {
                setIsSpinning(false);
            }
        });
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
        setCurrentState('landing');
        // Reset all animations
        contentOpacity.setValue(1);
        contentTranslateY.setValue(0);
        buttonScale.setValue(1);
        buttonOpacity.setValue(1);
    };

    const handleStartCooking = async () => {
        if (!recipe) return;
        
        try {
            // Check if we have connection
            const connectionSuccess = await testApiConnection();
            
            // If offline, check if we already have the full recipe cached
            if (!connectionSuccess) {
                const cachedRecipe = await getCachedRecipe(recipe.id);
                if (cachedRecipe && cachedRecipe.analyzedInstructions) {
                    // We have a complete cached recipe
                    setRecipe(cachedRecipe);
                    setServings(cachedRecipe.servings);
                    setCurrentState('ingredients');
                    return;
                } else {
                    Alert.alert(
                        "Network Required", 
                        "You need an internet connection to view the full recipe details.",
                        [{ text: "OK" }]
                    );
                    return;
                }
            }
            
            // Fetch from network if we have connection
            const response = await fetch(`${API_CONFIG.baseURL}/cook?id=${recipe.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipe details');
            }
            const rawRecipe = await response.json();
            const processedRecipe = processRecipeData(rawRecipe, settings.useMetric);
            
            // Cache the full recipe
            cacheRecipe(processedRecipe);
            
            setRecipe(processedRecipe);
            setServings(processedRecipe.servings);
            setCurrentState('ingredients');
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            Alert.alert(
                'Error',
                'Failed to load recipe details. Please try again.'
            );
        }
    };

    const handleStartSteps = () => {
        setCurrentState('cooking');
    };

    const handleComplete = () => {
        setCurrentState('landing');
        setRecipe(null);
    };

    const handleBackFromSteps = () => {
        setCurrentState('ingredients');
    };

    const handleServingsChange = (newServings: number) => {
        setServings(newServings);
        setRecipe(prev => {
            if (!prev) return null;
            return adjustServings(prev, newServings, settings.useMetric);
        });
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flex: 1 }}>
                {currentState === 'landing' && (
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

                        {/* Add Favorites Button */}
                        <TouchableOpacity
                            style={styles.favoritesButton}
                            onPress={() => setShowFavorites(true)}
                        >
                            <Ionicons name="heart" size={24} color="#16a34a" />
                        </TouchableOpacity>

                        {/* Settings Button */}
                        <TouchableOpacity
                            style={styles.settingsButton}
                            onPress={() => setShowSettings(true)}
                        >
                            <Feather name="settings" size={24} color="#16a34a" />
                        </TouchableOpacity>
                    </>
                )}

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

                {currentState === 'recipe' && recipe && (
                    <RecipeReveal
                        recipe={recipe}
                        onTryAnother={handleSpin}
                        onStartCooking={handleStartCooking}
                    />
                )}

                {currentState === 'ingredients' && recipe && (
                    <IngredientsList
                        recipe={recipe}
                        ingredients={recipe.extendedIngredients}
                        servings={servings}
                        readyInMinutes={recipe.readyInMinutes}
                        onServingsChange={handleServingsChange}
                        onStartSteps={handleStartSteps}
                    />
                )}

                {currentState === 'cooking' && recipe && (
                    <CookingSteps
                        steps={recipe.analyzedInstructions[0].steps}
                        onComplete={handleComplete}
                        onBack={handleBackFromSteps}
                    />
                )}

                {showSettings && (
                    <Settings
                        visible={showSettings}
                        onClose={() => setShowSettings(false)}
                        onSave={(newSettings) => {
                            setSettings(newSettings);
                            setShowSettings(false);
                        }}
                    />
                )}

                {showFavorites && (
                    <Favorites
                        visible={showFavorites}
                        onClose={() => setShowFavorites(false)}
                    />
                )}
            </View>
        </SafeAreaView>
    );
} 