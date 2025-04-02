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

// Add default export
export default SpinachLogo; 