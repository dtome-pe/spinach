import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withSequence,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface RecipeCardProps {
    recipe: {
        id: number;
        title: string;
        image: string;
        readyInMinutes: number;
        servings: number;
    };
    onSwipeLeft: () => void;
    onSettingsPress: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
    recipe,
    onSwipeLeft,
    onSettingsPress,
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const spoonRotation = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withSpring(-SCREEN_WIDTH);
                translateY.value = withSpring(0);
                scale.value = withSequence(
                    withTiming(0.8, { duration: 200 }),
                    withTiming(1, { duration: 200 })
                );
                opacity.value = withTiming(0, { duration: 200 });
                runOnJS(onSwipeLeft)();
            } else {
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value },
            ],
            opacity: opacity.value,
        };
    });

    const spoonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${spoonRotation.value}deg` }],
        };
    });

    useEffect(() => {
        // Animate spoon when swiping
        if (translateX.value < -SWIPE_THRESHOLD) {
            spoonRotation.value = withSequence(
                withTiming(45, { duration: 200 }),
                withTiming(-45, { duration: 200 }),
                withTiming(0, { duration: 200 })
            );
        }
    }, [translateX.value]);

    return (
        <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.card, cardStyle]}>
                <Image source={{ uri: recipe.image }} style={styles.image} />
                <View style={styles.overlay}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{recipe.title}</Text>
                        <Ionicons
                            name="settings-outline"
                            size={24}
                            color="white"
                            onPress={onSettingsPress}
                        />
                    </View>
                    <View style={styles.info}>
                        <View style={styles.infoItem}>
                            <Ionicons name="time-outline" size={20} color="white" />
                            <Text style={styles.infoText}>{recipe.readyInMinutes} min</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="people-outline" size={20} color="white" />
                            <Text style={styles.infoText}>{recipe.servings} servings</Text>
                        </View>
                    </View>
                </View>
                <Animated.View style={[styles.spoon, spoonStyle]}>
                    <Ionicons name="restaurant" size={32} color="white" />
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
};

export default RecipeCard;

const styles = StyleSheet.create({
    card: {
        width: SCREEN_WIDTH,
        height: SCREEN_WIDTH * 1.2,
        borderRadius: 20,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 20,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        marginRight: 10,
    },
    info: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 16,
    },
    spoon: {
        position: 'absolute',
        right: 20,
        top: '50%',
        transform: [{ translateY: -16 }],
    },
}); 