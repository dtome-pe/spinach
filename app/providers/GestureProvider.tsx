import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface GestureProviderProps {
  children: React.ReactNode;
}

const GestureProvider: React.FC<GestureProviderProps> = ({ children }) => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {children}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});

export default GestureProvider; 