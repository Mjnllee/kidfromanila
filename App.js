import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import 'react-native-reanimated';

const App = () => {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </AuthProvider>
  );
};

export default App;
