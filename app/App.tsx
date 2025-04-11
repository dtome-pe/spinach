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
    ViewStyle,
    BackHandler,
} from 'react-native';
import { Svg, Circle, Path } from 'react-native-svg';
import { Feather, Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import { SpinachLogo } from './components/Logo';
import { RecipeReveal } from './components/RecipeReveal';
import { Settings, UserSettings } from './components/Settings';
import { IngredientsList } from './components/IngredientsList';
import { CookingSteps } from './components/CookingSteps';
import { History } from './components/History';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe, processRecipeData, adjustServings } from './utils/recipeUtils';
import { API_CONFIG } from './config';
import { testApiConnection } from './utils/apiTest';
import { cacheRecipe, getCachedRecipe, getRecentRecipeIds, getHistoryRecipe, clearRecipeCache, clearAllCache } from './utils/cacheUtils';
import { TEST_MODE } from '@env';

// Get screen dimensions at the top level
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    const [showHistory, setShowHistory] = useState(false);
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
        //testApiConnection().then(success => {
        //    if (success) {
        //        console.log('✅ Ready to fetch recipes!');
        //    }
        //});

        // Add back button handler
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (currentState === 'ingredients') {
                setCurrentState('recipe');
                return true;
            } else if (currentState === 'cooking') {
                setCurrentState('ingredients');
                return true;
            }
            return false;
        });
        return () => backHandler.remove();
    }, [currentState]);

    // Development test functions
    useEffect(() => {
        if (__DEV__) {
            // For testing purposes only in dev environment
            const testCache = async () => {
                try {
                    // Get all recipe IDs
                    const recipeIds = await getRecentRecipeIds();
                    
                    if (recipeIds.length > 0) {
                        const testId = recipeIds[0];
                        console.log('\n=== CACHE TEST ===');
                        console.log(`Testing cache for recipe ID: ${testId}`);
                        
                        // Check if recipe is in recipe cache
                        const cachedRecipe = await getCachedRecipe(testId);
                        console.log(`Recipe in detail cache: ${!!cachedRecipe}`);
                        
                        // Check if recipe is in history cache
                        const historyRecipe = await getHistoryRecipe(testId);
                        console.log(`Recipe in history cache: ${!!historyRecipe}`);
                        
                        if (historyRecipe) {
                            console.log(`History cache contains: ${historyRecipe.title}`);
                        }
                        
                        console.log('=== END CACHE TEST ===\n');
                    }
                } catch (error) {
                    console.error('Error in test cache:', error);
                }
            };

            // Uncomment to run test
            // testCache();
        }
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
                const queryParams = new URLSearchParams({
                    maxTime: settings.maxCookingTime.toString(),
                    ...Object.entries(settings.allergens)
                        .filter(([_, value]) => value)
                        .map(([key]) => key)
                        .reduce((acc, key) => ({ ...acc, [key]: 'true' }), {})
                });
                
                const response = await fetch(`${API_CONFIG.baseURL}/spin?${queryParams}`);
                if (!response.ok) {
                    // If offline, try to get a random cached recipe
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
                    
                    throw new Error('Failed to fetch recipe');
                }
                const data = await response.json();

                // Ensure we have an image URL
                if (!data.image) {
                    throw new Error('Recipe data is missing image URL');
                }

                // Clean up the image URL
                if (data.image.startsWith('//')) {
                    data.image = 'https:' + data.image;
                } else if (!data.image.startsWith('http')) {
                    data.image = `${API_CONFIG.baseURL}${data.image.startsWith('/') ? '' : '/'}${data.image}`;
                }
                
                setRecipe(data);
                setShowRecipe(true);
                setCurrentState('recipe');

                // Cache the minimal recipe data from spin endpoint for history
                if (data) {
                    console.log('\n=== Caching Spin Recipe for History ===');
                    
                    // Create a minimal recipe object with just the data we need for history
                    const minimalRecipe = {
                        id: data.id,
                        title: data.title,
                        image: data.image,
                        readyInMinutes: data.readyInMinutes,
                        servings: data.servings,
                        // Keep empty arrays to satisfy Recipe type
                        extendedIngredients: [],
                        analyzedInstructions: [{ steps: [] }],
                        summary: '',
                        description: ''
                    };
                    
                    // Get current recipe IDs from cache
                    const recentRecipeIds = await getRecentRecipeIds();
                    console.log('Current recipe IDs in cache:', recentRecipeIds);
                    
                    // Check if this recipe is already in cache
                    if (!recentRecipeIds.includes(data.id)) {
                        console.log('New recipe, adding to cache');
                        
                        // If we have 10 recipes, remove the oldest one
                        if (recentRecipeIds.length >= 10) {
                            console.log('Cache full, removing oldest recipe');
                            const oldestId = recentRecipeIds[0];
                            await AsyncStorage.removeItem(`recipe_${oldestId}`);
                            // Remove from recent IDs list
                            recentRecipeIds.shift();
                        }
                        
                        // Add new recipe to cache
                        await cacheRecipe(minimalRecipe);
                        console.log('Recipe cached successfully');
                    } else {
                        console.log('Recipe already in cache, skipping');
                    }
                    console.log('=== End Recipe Caching ===\n');
                }
            } catch (error) {
                console.error('Error fetching recipe:', error);
                Alert.alert('Error', 'Failed to fetch recipe. Please check your internet connection and try again.');
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
            console.log('\n=== CHECKING CACHE ===');
            console.log('Recipe ID to check:', recipe.id);
            
            // First, check if we have the full recipe from cook endpoint cached
            const cachedRecipe = await getCachedRecipe(recipe.id);
            console.log('Cached recipe found:', !!cachedRecipe);
            if (cachedRecipe) {
                console.log('Has analyzedInstructions:', !!cachedRecipe.analyzedInstructions);
                console.log('Has non-empty analyzedInstructions:', cachedRecipe.analyzedInstructions && cachedRecipe.analyzedInstructions.length > 0);
                console.log('Has non-empty steps:', cachedRecipe.analyzedInstructions && cachedRecipe.analyzedInstructions[0]?.steps?.length > 0);
            }
            
            // Only use cache if it has non-empty analyzedInstructions from cook endpoint
            if (cachedRecipe && cachedRecipe.analyzedInstructions && cachedRecipe.analyzedInstructions[0]?.steps?.length > 0) {
                console.log('\n=== USING CACHED COOK RECIPE ===');
                console.log('Recipe ID:', recipe.id);
                console.log('Recipe Title:', recipe.title);
                console.log('=== END CACHE LOAD ===\n');
                
                setRecipe(cachedRecipe);
                setServings(cachedRecipe.servings);
                setCurrentState('ingredients');
                return;
            }
            
            console.log('\n=== COOK ENDPOINT CALL ===');
            console.log('URL:', `${API_CONFIG.baseURL}/cook?id=${recipe.id}`);
            console.log('Recipe ID:', recipe.id);
            
            const response = await fetch(`${API_CONFIG.baseURL}/cook?id=${recipe.id}`);
            if (!response.ok) {
                Alert.alert(
                    "Network Required", 
                    "You need an internet connection to view the full recipe details.",
                    [{ text: "OK" }]
                );
                return;
            }
            const rawRecipe = await response.json();
            console.log('=== END COOK CALL ===\n');
            
            const processedRecipe = processRecipeData(rawRecipe, settings.useMetric);
            
            // Cache the full recipe from cook endpoint
            await cacheRecipe(processedRecipe);
            console.log('\n=== CACHING FULL COOK RECIPE ===');
            console.log('Recipe ID:', processedRecipe.id);
            console.log('Recipe Title:', processedRecipe.title);
            console.log('=== END CACHING ===\n');
            
            setRecipe(processedRecipe);
            setServings(processedRecipe.servings);
            setCurrentState('ingredients');
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            Alert.alert(
                'Error',
                'Failed to load recipe details. Please check your internet connection and try again.'
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

    // Handle metric preferences update from IngredientsList component
    const handleMetricPreferenceChange = async (useMetric: boolean) => {
        setSettings(prev => ({
            ...prev,
            useMetric
        }));
        
        // Update recipe with new measurement system
        if (recipe) {
            setRecipe(adjustServings(recipe, servings, useMetric));
        }
    };

    const handleHomePress = () => {
        // Reset to landing page
        setCurrentState('landing');
        setRecipe(null);
        setShowRecipe(false);
    };

    const handleHistorySelect = async (selectedRecipe: Recipe) => {
        setShowHistory(false);
        
        try {
            // First check if we have the full recipe cached
            const cachedRecipe = await getCachedRecipe(selectedRecipe.id);
            console.log('\n=== CHECKING CACHE FOR HISTORY SELECTION ===');
            console.log('Recipe ID to check:', selectedRecipe.id);
            console.log('Cached recipe found:', !!cachedRecipe);
            if (cachedRecipe) {
                console.log('Has analyzedInstructions:', !!cachedRecipe.analyzedInstructions);
                console.log('Has non-empty steps:', cachedRecipe.analyzedInstructions && cachedRecipe.analyzedInstructions[0]?.steps?.length > 0);
            }
            
            // Only use cache if it has non-empty analyzedInstructions from cook endpoint
            if (cachedRecipe && cachedRecipe.analyzedInstructions && cachedRecipe.analyzedInstructions[0]?.steps?.length > 0) {
                console.log('\n=== USING CACHED COOK RECIPE ===');
                console.log('Recipe ID:', cachedRecipe.id);
                console.log('Recipe Title:', cachedRecipe.title);
                console.log('=== END CACHE LOAD ===\n');
                
                setRecipe(cachedRecipe);
                setServings(cachedRecipe.servings);
                setCurrentState('ingredients');
                return;
            }
            
            console.log('\n=== COOK ENDPOINT CALL ===');
            console.log('URL:', `${API_CONFIG.baseURL}/cook?id=${selectedRecipe.id}`);
            console.log('Recipe ID:', selectedRecipe.id);
            
            const response = await fetch(`${API_CONFIG.baseURL}/cook?id=${selectedRecipe.id}`);
            if (!response.ok) {
                console.error('Cook endpoint failed:', response.status, response.statusText);
                throw new Error(`Cook endpoint failed with status ${response.status}`);
            }
            const rawRecipe = await response.json();
            console.log('Response:', rawRecipe);
            console.log('=== END COOK CALL ===\n');
            
            if (!rawRecipe || !rawRecipe.analyzedInstructions || !rawRecipe.analyzedInstructions[0]?.steps) {
                console.error('Invalid recipe data from cook endpoint:', rawRecipe);
                throw new Error('Invalid recipe data received from cook endpoint');
            }
            
            const processedRecipe = processRecipeData(rawRecipe, settings.useMetric);
            
            // Cache the full recipe from cook endpoint
            await cacheRecipe(processedRecipe);
            console.log('\n=== CACHING FULL COOK RECIPE ===');
            console.log('Recipe ID:', processedRecipe.id);
            console.log('Recipe Title:', processedRecipe.title);
            console.log('=== END CACHING ===\n');
            
            setRecipe(processedRecipe);
            setServings(processedRecipe.servings);
            setCurrentState('ingredients');
        } catch (error) {
            console.error('Error in handleHistorySelect:', error);
            Alert.alert(
                'Error',
                'Failed to load recipe details. Please check your internet connection and try again.'
            );
            // Reset to landing page on error
            setCurrentState('landing');
        }
    };

    // Render the floating action buttons based on current state
    const renderActionButtons = () => {
        // Common button styles
        const buttonStyle: ViewStyle = {
            position: 'absolute',
            padding: 10,
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            borderRadius: 20,
            zIndex: 999,
        };

        if (currentState === 'landing') {
            return (
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    paddingHorizontal: SCREEN_WIDTH * 0.05,
                    position: 'absolute',
                    top: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.05 : SCREEN_HEIGHT * 0.03
                }}>

                    {/* History Button */}
                    <TouchableOpacity
                        style={[buttonStyle, { left: 0 }]}
                        onPress={() => setShowHistory(true)}
                    >
                        <Ionicons name="time" size={24} color="#16a34a" />
                    </TouchableOpacity>

                    {/* Settings Button */}
                    <TouchableOpacity
                        style={[buttonStyle, { right: 0 }]}
                        onPress={() => setShowSettings(true)}
                    >
                        <Feather name="settings" size={24} color="#16a34a" />
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    width: '100%', 
                    paddingHorizontal: SCREEN_WIDTH * 0.05,
                    position: 'absolute',
                    top: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.05 : SCREEN_HEIGHT * 0.03
                }}>
                    {/* Home Button */}
                    <TouchableOpacity
                        style={[buttonStyle, { left: 0 }]}
                        onPress={handleHomePress}
                    >
                        <Ionicons name="leaf" size={24} color="#16a34a" />
                    </TouchableOpacity>

                    {/* Settings Button */}
                    <TouchableOpacity
                        style={[buttonStyle, { right: 0 }]}
                        onPress={() => setShowSettings(true)}
                    >
                        <Feather name="settings" size={24} color="#16a34a" />
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.mainContent}>
                {/* Action Buttons (Home/History and Settings) */}
                {renderActionButtons()}

                {/* Landing page content */}
                {currentState === 'landing' && (
                    <>
                        <View style={[styles.logoContainer, { marginTop: SCREEN_HEIGHT * 0.03 }]}>
                            <View style={styles.logoRow}>
                                <SpinachLogo size="large" />
                            </View>
                        </View>
                        
                        {/* Tagline */}
                        <Animated.Text style={[styles.tagline, { opacity: contentOpacity, marginBottom: SCREEN_HEIGHT * 0.04 }]}>
                            Find <Text style={styles.taglineHighlight}>delicious</Text> vegan recipes for{'\n'}
                            <Text style={styles.taglineHighlight}>every day</Text> meals
                        </Animated.Text>

                        {/* Spin Button */}
                        <View style={[styles.spinButtonContainer, { marginTop: 0 }]}>
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
                                Simple • Inspiring • 100% Vegan
                            </Text>
                        </Animated.View>
                    </>
                )}

                {/* Recipe page */}
                {currentState === 'recipe' && recipe && (
                    <RecipeReveal
                        recipe={recipe}
                        isSpinning={isSpinning}
                        onTryAnother={() => {
                            if (isSpinning) return;
                            console.log('🔄 TRY ANOTHER button pressed');
                            handleSpin();
                        }}
                        onStartCooking={handleStartCooking}
                        onBack={() => {
                            setCurrentState('landing' as AppState);
                            setShowRecipe(false);
                        }}
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
                        onMetricChange={handleMetricPreferenceChange}
                        useMetric={settings.useMetric}
                        onBack={() => setCurrentState('recipe')}
                    />
                )}

                {currentState === 'cooking' && recipe && (
                    <CookingSteps
                        steps={recipe.analyzedInstructions[0].steps}
                        onComplete={handleComplete}
                        onBack={handleBackFromSteps}
                    />
                )}

                {/* Modals */}
                {showSettings && (
                    <Settings
                        visible={showSettings}
                        onClose={() => setShowSettings(false)}
                        onSave={(newSettings) => {
                            setSettings(newSettings);
                            // Update recipe with new measurement system if it changed
                            if (newSettings.useMetric !== settings.useMetric && recipe) {
                                setRecipe(adjustServings(recipe, servings, newSettings.useMetric));
                            }
                            setShowSettings(false);
                        }}
                        initialSettings={settings}
                    />
                )}

                {showHistory && (
                    <History
                        visible={showHistory}
                        onClose={() => setShowHistory(false)}
                        onSelectRecipe={handleHistorySelect}
                    />
                )}
            </View>
        </SafeAreaView>
    );
} 