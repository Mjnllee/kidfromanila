import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const DrawerContent = ({ navigation }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    orders: false,
    services: false,
  });

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Helper function for navigating to tabs
  const navigateToTab = (tabName) => {
    navigation.navigate('MainTabs', { screen: tabName });
  };

  const MenuItem = ({ icon, title, onPress, showArrow = false, expanded = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      {icon}
      <Text style={styles.menuText}>{title}</Text>
      {showArrow && (
        <Ionicons 
          name={expanded ? "chevron-down" : "chevron-forward"} 
          size={20} 
          color="#666"
          style={styles.menuArrow} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>KidFromManila</Text>
        <Text style={styles.subtitle}>Motorcycle Tire Shop</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {/* Home */}
        <MenuItem
          icon={<Ionicons name="home-outline" size={24} color="#666" />}
          title="Home"
          onPress={() => navigateToTab('HomeTab')}
        />

        {/* Orders */}
        <MenuItem
          icon={<MaterialIcons name="layers" size={24} color="#666" />}
          title="Orders"
          onPress={() => toggleMenu('orders')}
          showArrow={true}
          expanded={expandedMenus.orders}
        />
        {expandedMenus.orders && (
          <View style={styles.submenu}>
            <MenuItem
              icon={<Ionicons name="time-outline" size={24} color="#666" />}
              title="Order History"
              onPress={() => navigation.navigate('OrderHistory')}
            />
          </View>
        )}

        {/* Services */}
        <MenuItem
          icon={<MaterialIcons name="miscellaneous-services" size={24} color="#666" />}
          title="Services"
          onPress={() => toggleMenu('services')}
          showArrow={true}
          expanded={expandedMenus.services}
        />
        {expandedMenus.services && (
          <View style={styles.submenu}>
            <MenuItem
              icon={<MaterialIcons name="event-available" size={24} color="#666" />}
              title="Book a Service"
              onPress={() => navigateToTab('AppointmentTab')}
            />
            <MenuItem
              icon={<MaterialIcons name="build-circle" size={24} color="#666" />}
              title="Service Status"
              onPress={() => navigation.navigate('ServiceStatus')}
            />
            <MenuItem
              icon={<Ionicons name="time-outline" size={24} color="#666" />}
              title="Service History"
              onPress={() => navigation.navigate('ServiceHistory')}
            />
          </View>
        )}

        {/* Profile Settings */}
        <MenuItem
          icon={<Ionicons name="person-outline" size={24} color="#666" />}
          title="Profile Settings"
          onPress={() => navigateToTab('ProfileTab')}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Ionicons name="log-out-outline" size={24} color="#e30613" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e30613',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
    flex: 1,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  submenu: {
    backgroundColor: '#f8f8f8',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutText: {
    fontSize: 16,
    color: '#e30613',
    marginLeft: 15,
  },
});

export default DrawerContent; 