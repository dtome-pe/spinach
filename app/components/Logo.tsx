import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { styles } from '../styles';

type SizeOption = 'small' | 'default' | 'large' | 'medium';

interface LogoProps {
    size?: SizeOption;
}

// SpinachLogo component
export const SpinachLogo: React.FC<LogoProps> = ({ size = 'default' }) => {
    const sizes = {
        small: { fontSize: 20 },
        default: { fontSize: 32 },
        medium: { fontSize: 32 },
        large: { fontSize: 48 },
    };

    const currentSize = sizes[size];
    const baseColor = '#16a34a';
    const spinColor = '#15803d'; // A slightly darker green for SPIN

    return (
        <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
                <Text style={[
                    styles.logoText,
                    {
                        fontSize: currentSize.fontSize,
                        letterSpacing: 1,
                    }
                ]}>
                    <Text style={{ color: spinColor }}>SPIN</Text>
                    <Text style={{ color: baseColor }}>ACH</Text>
                </Text>
            </View>
            <View style={[
                styles.logoUnderline,
                {
                    width: '100%',
                    height: 3,
                    backgroundColor: baseColor,
                    marginTop: 4,
                    borderRadius: 2,
                    opacity: 0.8,
                }
            ]} />
        </View>
    );
};

// Add default export
export default SpinachLogo; 