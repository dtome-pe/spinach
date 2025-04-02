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

    const handleSpin = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setShowRecipe(false);
        setShowSettings(false);

        // Reset animation value before starting new animation
        spinAnim.setValue(0);

        // Start animations
        Animated.parallel([
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
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
                console.log('Raw recipe data:', JSON.stringify(data, null, 2));

                // Ensure we have an image URL
                if (!data.image) {
                    console.error('No image URL in recipe data');
                    throw new Error('Recipe data is missing image URL');
                }

                // Clean up the image URL
                if (data.image.startsWith('//')) {
                    data.image = 'https:' + data.image;
                } else if (!data.image.startsWith('http')) {
                    data.image = `${API_CONFIG.baseURL}${data.image.startsWith('/') ? '' : '/'}${data.image}`;
                }

                console.log('Final image URL:', data.image);
                
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
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {currentState === 'landing' && (
                    <>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoRow}>
                                <SpinachLogo size="large" />
                            </View>
                            <Text style={styles.tagline}>
                                Give it a <Text style={styles.taglineHighlight}>SPIN</Text> to discover today's mystery vegan recipe!
                            </Text>
                        </View>

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
                                    <View style={styles.spinTextContainer}>
                                        <Text style={styles.spinButtonText}>SPIN</Text>
                                    </View>
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