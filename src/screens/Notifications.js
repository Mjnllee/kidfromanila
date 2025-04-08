import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const Notifications = ({ navigation }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    serviceReminders: true,
    appUpdates: false,
    emailNotifications: true,
  });

  const toggleSetting = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    });
  };

  const getIcon = (type) => {
    switch(type) {
      case 'orderUpdates':
        return <MaterialIcons name="local-shipping" size={24} color="#1976d2" />;
      case 'promotions':
        return <MaterialIcons name="local-offer" size={24} color="#8e24aa" />;
      case 'newProducts':
        return <MaterialIcons name="new-releases" size={24} color="#f57c00" />;
      case 'serviceReminders':
        return <MaterialIcons name="build" size={24} color="#43a047" />;
      case 'appUpdates':
        return <MaterialIcons name="system-update" size={24} color="#546e7a" />;
      case 'emailNotifications':
        return <MaterialIcons name="email" size={24} color="#e53935" />;
      default:
        return <MaterialIcons name="notifications" size={24} color="#333" />;
    }
  };

  const getTitle = (type) => {
    switch(type) {
      case 'orderUpdates':
        return 'Order Updates';
      case 'promotions':
        return 'Promotions & Offers';
      case 'newProducts':
        return 'New Products';
      case 'serviceReminders':
        return 'Service Reminders';
      case 'appUpdates':
        return 'App Updates';
      case 'emailNotifications':
        return 'Email Notifications';
      default:
        return type;
    }
  };

  const getDescription = (type) => {
    switch(type) {
      case 'orderUpdates':
        return 'Receive updates about your orders and shipping status';
      case 'promotions':
        return 'Get notified about sales, discounts, and special offers';
      case 'newProducts':
        return 'Be the first to know when new products are available';
      case 'serviceReminders':
        return 'Receive reminders about scheduled service appointments';
      case 'appUpdates':
        return 'Get notified when app updates are available';
      case 'emailNotifications':
        return 'Receive notifications via email as well as in-app';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <Text style={styles.sectionDescription}>
            Control which notifications you receive from KidManila
          </Text>
        </View>

        {Object.keys(notificationSettings).map((setting) => (
          <View key={setting} style={styles.notificationItem}>
            <View style={styles.notificationIcon}>
              {getIcon(setting)}
            </View>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>{getTitle(setting)}</Text>
              <Text style={styles.notificationDescription}>
                {getDescription(setting)}
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#ddd", true: "#ffc2c6" }}
              thumbColor={notificationSettings[setting] ? "#e30613" : "#f4f3f4"}
              ios_backgroundColor="#ddd"
              onValueChange={() => toggleSetting(setting)}
              value={notificationSettings[setting]}
            />
          </View>
        ))}

        <View style={styles.footerText}>
          <Text style={styles.noteText}>
            Note: You may still receive important system notifications related to your account security and privacy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
  rightPlaceholder: {
    width: 40,
  },
  scrollContent: {
    padding: 15,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e1e1e',
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#666',
  },
  footerText: {
    marginTop: 15,
    marginBottom: 30,
  },
  noteText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default Notifications; 