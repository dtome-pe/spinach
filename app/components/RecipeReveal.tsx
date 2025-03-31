import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

type RecipeRevealProps = {
    onReset: () => void;
    recipe: {
        title: string;
        image: string;
        description: string;
    };
};

export const RecipeReveal = ({ onReset, recipe }: RecipeRevealProps) => {
    return (
        <View style={{ flex: 1, backgroundColor: '#f0fdf4' }}>
            {/* Recipe Image */}
            <Image
                source={{ uri: recipe.image }}
                style={{ width: '100%', height: 300, resizeMode: 'cover' }}
            />

            {/* Recipe Title */}
            <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: '#166534',
                    textAlign: 'center',
                }}>
                    {recipe.title}
                </Text>
                <Text style={{
                    fontSize: 16,
                    color: '#166534',
                    textAlign: 'center',
                    marginTop: 8,
                }}>
                    {recipe.description}
                </Text>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24 }}>
                <TouchableOpacity
                    onPress={onReset}
                    style={{
                        backgroundColor: '#16a34a',
                        paddingVertical: 16,
                        paddingHorizontal: 24,
                        borderRadius: 999,
                        flex: 1,
                        marginRight: 12,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>SPIN AGAIN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => alert('Cook mode coming soon!')}
                    style={{
                        backgroundColor: '#166534',
                        paddingVertical: 16,
                        paddingHorizontal: 24,
                        borderRadius: 999,
                        flex: 1,
                        marginLeft: 12,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>COOK</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}; 