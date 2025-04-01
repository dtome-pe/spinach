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

export interface RecipeSettings {
    maxReadyTime: number;
    minReadyTime: number;
    allergies: string[];
    diet: string[];
}

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

                    <ScrollView style={styles.scrollView}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Cooking Time</Text>
                            <View style={styles.timeInputs}>
                                <View style={styles.timeInput}>
                                    <Text>Min Time (min)</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setSettings(prev => ({
                                            ...prev,
                                            minReadyTime: Math.max(5, prev.minReadyTime - 5),
                                        }))}
                                    >
                                        <Ionicons name="remove" size={20} color="#000" />
                                    </TouchableOpacity>
                                    <Text style={styles.timeValue}>{settings.minReadyTime}</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setSettings(prev => ({
                                            ...prev,
                                            minReadyTime: Math.min(prev.maxReadyTime - 5, prev.minReadyTime + 5),
                                        }))}
                                    >
                                        <Ionicons name="add" size={20} color="#000" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.timeInput}>
                                    <Text>Max Time (min)</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setSettings(prev => ({
                                            ...prev,
                                            maxReadyTime: Math.max(prev.minReadyTime + 5, prev.maxReadyTime - 5),
                                        }))}
                                    >
                                        <Ionicons name="remove" size={20} color="#000" />
                                    </TouchableOpacity>
                                    <Text style={styles.timeValue}>{settings.maxReadyTime}</Text>
                                    <TouchableOpacity
                                        style={styles.timeButton}
                                        onPress={() => setSettings(prev => ({
                                            ...prev,
                                            maxReadyTime: Math.min(180, prev.maxReadyTime + 5),
                                        }))}
                                    >
                                        <Ionicons name="add" size={20} color="#000" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Dietary Preferences</Text>
                            {DIET_OPTIONS.map(diet => (
                                <View key={diet} style={styles.option}>
                                    <Text style={styles.optionText}>{diet}</Text>
                                    <Switch
                                        value={settings.diet.includes(diet)}
                                        onValueChange={() => toggleDiet(diet)}
                                    />
                                </View>
                            ))}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Allergies</Text>
                            {ALLERGY_OPTIONS.map(allergy => (
                                <View key={allergy} style={styles.option}>
                                    <Text style={styles.optionText}>{allergy}</Text>
                                    <Switch
                                        value={settings.allergies.includes(allergy)}
                                        onValueChange={() => toggleAllergy(allergy)}
                                    />
                                </View>
                            ))}
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