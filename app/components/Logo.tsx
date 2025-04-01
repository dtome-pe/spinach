import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles';

type SizeOption = 'small' | 'default' | 'large';

// SpinachLogo component
export const SpinachLogo = ({ size = 'default' }: { size?: SizeOption }) => {
    const sizes = {
        small: { fontSize: 20 },
        default: { fontSize: 28 },
        large: { fontSize: 36 },
    };

    const currentSize = sizes[size];

    return (
        <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
                <Text style={[
                    styles.logoText,
                    {
                        fontSize: currentSize.fontSize,
                        color: '#16a34a',
                        letterSpacing: 1,
                    }
                ]}>SPINACH</Text>
            </View>
            <View style={[
                styles.logoUnderline,
                {
                    width: '100%',
                    height: 3,
                    backgroundColor: '#16a34a',
                    marginTop: 4,
                    borderRadius: 2,
                    opacity: 0.8,
                }
            ]} />
        </View>
    );
}; 