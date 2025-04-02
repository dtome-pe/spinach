import React, { useEffect } from 'react';
import { Stack } from "expo-router";
import AppProviders from './providers';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we initialize the app
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once the app is ready
    async function prepare() {
      try {
        // Pre-load fonts, images, and other data
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
