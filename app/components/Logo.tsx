import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Svg, Path, Circle } from 'react-native-svg';
import { styles } from '../styles';

type SizeOption = 'small' | 'default' | 'large';

// Custom S Logo with arrows component
const CustomSLogo = ({ color = '#16a34a', size = 24 }) => (
    <View style={{ width: size, height: size }}>
        <View style={{ position: 'relative' }}>
            {/* Top arrow */}
            <Svg width={size / 2} height={size / 2} viewBox="0 0 24 24" style={{ position: 'absolute', top: -size / 4, left: -size / 8 }}>
                <Path
                    d="M5 15L12 8L19 15"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>

            {/* Bottom arrow */}
            <Svg width={size / 2} height={size / 2} viewBox="0 0 24 24" style={{ position: 'absolute', bottom: -size / 4, right: -size / 8 }}>
                <Path
                    d="M19 9L12 16L5 9"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </Svg>

            {/* S letter */}
            <Text style={{ fontSize: size, color, fontWeight: 'bold' }}>S</Text>
        </View>
    </View>
);

// SpinachLogo component
export const SpinachLogo = ({ size = 'default' }: { size?: SizeOption }) => {
    const sizes = {
        small: { fontSize: 20, leafSize: 16 },
        default: { fontSize: 28, leafSize: 24 },
        large: { fontSize: 36, leafSize: 30 },
    };

    const currentSize = sizes[size];

    return (
        <View style={styles.logoContainer}>
            <View style={styles.logoRow}>
                <Feather name={"leaf" as any} size={currentSize.leafSize} color="#16a34a" style={{ marginRight: 4 }} />
                <View style={styles.logoTextContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <CustomSLogo color="#16a34a" size={currentSize.fontSize} />
                        <Text style={[styles.logoText, { fontSize: currentSize.fontSize, color: '#16a34a' }]}>PIN</Text>
                    </View>
                    <Text style={[styles.logoText, { fontSize: currentSize.fontSize, color: '#166534' }]}>ACH</Text>
                </View>
            </View>
            <View style={styles.logoUnderline} />
        </View>
    );
}; 