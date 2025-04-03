import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    Switch,
    Platform,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get screen dimensions
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface UserSettings {
    useMetric: boolean;
    maxCookingTime: number;
    allergens: {
        gluten: boolean;
        grain: boolean;
        peanut: boolean;
        sesame: boolean;
        soy: boolean;
        sulfite: boolean;
        treeNut: boolean;
        wheat: boolean;
    };
}

interface SettingsProps {
    visible: boolean;
    onClose: () => void;
    onSave: (settings: UserSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ visible, onClose, onSave }) => {
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

    useEffect(() => {
        loadSettings();
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

    const handleSave = async () => {
        try {
            await AsyncStorage.setItem('recipeSettings', JSON.stringify(settings));
            onSave(settings);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const toggleAllergen = (allergen: keyof UserSettings['allergens']) => {
        setSettings(prev => ({
            ...prev,
            allergens: {
                ...prev.allergens,
                [allergen]: !prev.allergens[allergen]
            }
        }));
    };

    const updateCookingTime = (type: 'min' | 'max', value: number) => {
        setSettings(prev => ({
            ...prev,
            [`${type}CookingTime`]: Math.max(0, value)
        }));
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Recipe Preferences</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contentContainer}>
                        <ScrollView style={styles.scrollView}>
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Cooking Time</Text>
                                <View style={styles.timeContainer}>
                                    <View style={styles.timeInput}>
                                        <Text style={styles.label}>Max (minutes)</Text>
                                        <TouchableOpacity
                                            style={styles.timeButton}
                                            onPress={() => setSettings(prev => ({
                                                ...prev,
                                                maxCookingTime: Math.max(5, prev.maxCookingTime - 5)
                                            }))}
                                        >
                                            <Ionicons name="remove" size={20} color="#007AFF" />
                                        </TouchableOpacity>
                                        <Text style={styles.timeValue}>{settings.maxCookingTime}</Text>
                                        <TouchableOpacity
                                            style={styles.timeButton}
                                            onPress={() => setSettings(prev => ({
                                                ...prev,
                                                maxCookingTime: Math.min(180, prev.maxCookingTime + 5)
                                            }))}
                                        >
                                            <Ionicons name="add" size={20} color="#007AFF" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Allergens</Text>
                                <View style={styles.allergensGrid}>
                                    {Object.entries(settings.allergens).map(([allergen, value]) => (
                                        <View key={allergen} style={styles.allergenItem}>
                                            <Text style={styles.allergenLabel}>
                                                {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                                            </Text>
                                            <Switch
                                                value={value}
                                                onValueChange={() => toggleAllergen(allergen as keyof UserSettings['allergens'])}
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={value ? '#007AFF' : '#f4f3f4'}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Units</Text>
                                <View style={styles.unitRow}>
                                    <Text>Use Metric System</Text>
                                    <Switch
                                        value={settings.useMetric}
                                        onValueChange={(value) => setSettings(prev => ({ ...prev, useMetric: value }))}
                                        trackColor={{ false: '#767577', true: '#81b0ff' }}
                                        thumbColor={settings.useMetric ? '#007AFF' : '#f4f3f4'}
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>

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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: SCREEN_HEIGHT * 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    closeButton: {
        padding: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginVertical: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    timeContainer: {
        gap: 12,
    },
    timeInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
    },
    label: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    timeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        ...Platform.select({
            android: {
                elevation: 2,
            },
        }),
    },
    timeValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        minWidth: 40,
        textAlign: 'center',
    },
    allergensGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    allergenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
        width: '48%',
    },
    allergenLabel: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 10,
        margin: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    unitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 12,
        borderRadius: 10,
    },
});

// Add default export for Expo Router compatibility
export default Settings; 