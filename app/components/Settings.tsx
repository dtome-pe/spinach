import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from '../styles';

type Allergens = {
    nuts: boolean;
    soy: boolean;
    gluten: boolean;
    dairy: boolean;
    shellfish: boolean;
    eggs: boolean;
    fish: boolean;
    sesame: boolean;
    mustard: boolean;
    celery: boolean;
    lupin: boolean;
    molluscs: boolean;
    sulfites: boolean;
};

type UserSettings = {
    useMetric: boolean;
    minCookingTime: number;
    maxCookingTime: number;
    allergens: Allergens;
};

type SettingsProps = {
    settings: UserSettings;
    onUpdateSettings: (settings: UserSettings) => void;
    onClose: () => void;
};

export const Settings = ({ settings, onUpdateSettings, onClose }: SettingsProps) => {
    const updateAllergen = (key: keyof Allergens) => {
        onUpdateSettings({
            ...settings,
            allergens: {
                ...settings.allergens,
                [key]: !settings.allergens[key]
            }
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.settingsHeader}>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={24} color="#16a34a" />
                </TouchableOpacity>
                <Text style={styles.settingsHeaderTitle}>Settings</Text>
            </View>
            <ScrollView style={{ flex: 1, backgroundColor: '#f0fdf4', padding: 20 }}>
                {/* Units Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsTitle}>Units</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Use Metric Units</Text>
                        <Switch
                            value={settings.useMetric}
                            onValueChange={(value) => onUpdateSettings({ ...settings, useMetric: value })}
                            trackColor={{ false: '#767577', true: '#16a34a' }}
                            thumbColor={settings.useMetric ? '#166534' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Cooking Time Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsTitle}>Cooking Time</Text>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Minimum Time (minutes)</Text>
                        <View style={styles.numberInput}>
                            <TouchableOpacity 
                                onPress={() => onUpdateSettings({ ...settings, minCookingTime: Math.max(0, settings.minCookingTime - 5) })}
                                style={styles.numberButton}
                            >
                                <Text style={styles.numberButtonText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.numberValue}>{settings.minCookingTime}</Text>
                            <TouchableOpacity 
                                onPress={() => onUpdateSettings({ ...settings, minCookingTime: Math.min(settings.maxCookingTime, settings.minCookingTime + 5) })}
                                style={styles.numberButton}
                            >
                                <Text style={styles.numberButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.settingRow}>
                        <Text style={styles.settingLabel}>Maximum Time (minutes)</Text>
                        <View style={styles.numberInput}>
                            <TouchableOpacity 
                                onPress={() => onUpdateSettings({ ...settings, maxCookingTime: Math.max(settings.minCookingTime, settings.maxCookingTime - 5) })}
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
                    </View>
                </View>

                {/* Allergens Section */}
                <View style={styles.settingsSection}>
                    <Text style={styles.settingsTitle}>Allergens</Text>
                    {Object.entries(settings.allergens).map(([key, value]) => (
                        <View key={key} style={styles.settingRow}>
                            <Text style={styles.settingLabel}>
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </Text>
                            <Switch
                                value={value}
                                onValueChange={() => updateAllergen(key as keyof Allergens)}
                                trackColor={{ false: '#767577', true: '#16a34a' }}
                                thumbColor={value ? '#166534' : '#f4f3f4'}
                            />
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}; 