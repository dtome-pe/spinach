import 'react-native-gesture-handler';
import React from 'react';
import App from './App';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Redirects to the main App component
export default function Index() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <App />
        </GestureHandlerRootView>
    );
}