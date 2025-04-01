import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsProps {
    visible: boolean;
    onClose: () => void;
    onSave: (settings: RecipeSettings) => void;
}

export type Allergens = {
    gluten: boolean;
    grain: boolean;
    peanut: boolean;
    sesame: boolean;
    soy: boolean;
    sulfite: boolean;
    treeNut: boolean;
    wheat: boolean;
};

type UserSettings = {
    useMetric: boolean;
    maxCookingTime: number;
    allergens: Allergens;
};

const DIET_OPTIONS = [
    'vegetarian',
    'vegan',
    'gluten free',
    'dairy free',
    'ketogenic',
    'paleo',
    'whole30',
];

const ALLERGY_OPTIONS = [
    'dairy',
    'egg',
    'gluten',
    'grain',
    'peanut',
    'seafood',
    'sesame',
    'shellfish',
    'soy',
    'sulfite',
    'tree nut',
    'wheat',
];

export const Settings: React.FC<SettingsProps> = ({ visible, onClose, onSave }) => {
    const [settings, setSettings] = useState<RecipeSettings>({
        maxReadyTime: 60,
        minReadyTime: 15,
        allergies: [],
        diet: [],
    });

    const toggleDiet = (diet: string) => {
        setSettings(prev => ({
            ...prev,
            diet: prev.diet.includes(diet)
                ? prev.diet.filter(d => d !== diet)
                : [...prev.diet, diet],
        }));
    };

    const toggleAllergy = (allergy: string) => {
        setSettings(prev => ({
            ...prev,
            allergies: prev.allergies.includes(allergy)
                ? prev.allergies.filter(a => a !== allergy)
                : [...prev.allergies, allergy],
        }));
    };

    const handleSave = async () => {
        try {
            await AsyncStorage.setItem('recipeSettings', JSON.stringify(settings));
            onSave(settings);
            onClose();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Recipe Preferences</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>


                {/* Cooking Time Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsTitle}>Maximum Cooking Time</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Time (minutes)</Text>
                        <View style={styles.numberInput}>
                            <TouchableOpacity 
                                onPress={() => onUpdateSettings({ ...settings, maxCookingTime: Math.max(5, settings.maxCookingTime - 5) })}
                                style={styles.numberButton}
                            >
                                <Text style={styles.numberButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.numberValue}>{settings.maxCookingTime}</Text>
                            <TouchableOpacity 
                                onPress={() => onUpdateSettings({ ...settings, maxCookingTime: settings.maxCookingTime + 5 })}
                                style={styles.numberButton}
                            >
                                <Text style={styles.numberButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                {/* Allergens Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsTitle}>Intolerances</Text>
                    {Object.entries(settings.allergens).map(([key, value]) => (
                        <View key={key} style={styles.settingRow}>
                            <Text style={styles.settingLabel}>
                                {key === 'treeNut' ? 'Tree Nut' : key.charAt(0).toUpperCase() + key.slice(1)}
                            </Text>
                            <TouchableOpacity
                                onPress={() => updateAllergen(key as keyof Allergens)}
                                style={[
                                    styles.allergenButton,
                                    value ? styles.allergenButtonExclude : styles.allergenButtonInclude
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name={value ? 'close' : 'check'}
                                    size={24}
                                    color={value ? '#dc2626' : '#16a34a'}
                                />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Preferences</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
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
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    timeInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    timeInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 10,
    },
    timeButton: {
        padding: 5,
        marginHorizontal: 10,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '600',
        minWidth: 30,
        textAlign: 'center',
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 16,
        textTransform: 'capitalize',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 