import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Modal,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles as appStyles } from '../styles';
import { getRecentRecipeIds, getCachedRecipe } from '../utils/cacheUtils';
import { Recipe } from '../utils/recipeUtils';

// Get screen dimensions at the top level
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_HEIGHT = CARD_WIDTH * 0.6;

interface HistoryProps {
    visible: boolean;
    onClose: () => void;
    onSelectRecipe: (recipe: Recipe) => void;
}

export const History: React.FC<HistoryProps> = ({ visible, onClose, onSelectRecipe }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        if (visible) {
            loadHistory();
        }
    }, [visible]);

    const loadHistory = async () => {
        try {
            const recentIds = await getRecentRecipeIds();
            const recipePromises = recentIds.map(id => getCachedRecipe(id));
            const loadedRecipes = await Promise.all(recipePromises);
            const validRecipes = loadedRecipes.filter(recipe => recipe !== null) as Recipe[];
            setRecipes(validRecipes);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { minHeight: 300 }]}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Recent Recipes</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#16a34a" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView 
                        style={styles.scrollView}
                        contentContainerStyle={{ flexGrow: 1 }}
                    >
                        {recipes.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="time-outline" size={48} color="#16a34a" />
                                <Text style={styles.emptyStateText}>No recent recipes</Text>
                            </View>
                        ) : (
                            recipes.map((recipe) => (
                                <TouchableOpacity
                                    key={recipe.id}
                                    style={styles.recipeCard}
                                    onPress={() => onSelectRecipe(recipe)}
                                >
                                    <Image
                                        source={{ uri: recipe.image }}
                                        style={styles.recipeImage}
                                    />
                                    <View style={styles.recipeInfo}>
                                        <Text style={styles.recipeTitle}>{recipe.title}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default History;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#f0fdf4',
        borderRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    recipeCard: {
        flexDirection: 'row',
        width: '100%',
        height: 80,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    recipeImage: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
    },
    recipeInfo: {
        flex: 1,
        padding: 12,
        justifyContent: 'center',
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#166534',
        marginBottom: 4,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyStateText: {
        fontSize: 16,
        color: '#16a34a',
        marginTop: 10,
        textAlign: 'center',
    },
}); 