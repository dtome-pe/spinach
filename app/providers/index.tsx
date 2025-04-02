import React from 'react';
import GestureProvider from './GestureProvider';
import ErrorBoundary from '../components/ErrorBoundary';

interface AppProvidersProps {
  children: React.ReactNode;
}

// App providers component to wrap the entire app with all necessary providers
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <GestureProvider>
        {children}
      </GestureProvider>
    </ErrorBoundary>
  );
};

export default AppProviders; 