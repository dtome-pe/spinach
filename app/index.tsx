import 'react-native-gesture-handler';
import React from 'react';
import App from './App';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Index() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <App />
        </GestureHandlerRootView>
    );
}