import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

/**
 * A reusable component for handling safe area insets consistently across the app
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.statusBarStyle - Status bar style ('dark', 'light', 'auto')
 * @param {string} props.topColor - Background color for top safe area
 * @param {string} props.bottomColor - Background color for bottom safe area
 * @param {string} props.backgroundColor - Background color for main content area
 * @returns {JSX.Element} SafeAreaLayout component
 */
const SafeAreaLayout = ({
  children,
  statusBarStyle = 'dark',
  topColor = 'white',
  bottomColor = '#f8f8f8',
  backgroundColor = '#f8f8f8',
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style={statusBarStyle} />
      
      {/* Top safe area - usually colored the same as the header */}
      <SafeAreaView style={{ flex: 0, backgroundColor: topColor }} edges={['top']} />
      
      {/* Main content with bottom safe area */}
      <SafeAreaView 
        style={{ flex: 1, backgroundColor: bottomColor }} 
        edges={['bottom', 'left', 'right']}
      >
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaLayout; 