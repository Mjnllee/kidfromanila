import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = ({ title, showBackButton = false, hideIcons = false }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  // Calculate proper padding to account for status bar
  const statusBarHeight = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0;

  return (
    <View style={[
      styles.header, 
      { paddingTop: statusBarHeight }
    ]}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
          >
            <MaterialIcons name="menu" size={28} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      
      {!hideIcons && (
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="cart-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Tawk')} style={styles.headerIconButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconButton: {
    marginLeft: 15,
  },
});

export default Header; 