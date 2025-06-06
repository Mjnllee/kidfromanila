import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = ({ navigation }) => {
  const menuItems = [
    { id: 1, title: 'Human Resources', icon: 'people', type: 'ion', route: 'AdminHumanResources' },
    { id: 2, title: 'Inventory Management', icon: 'inventory', type: 'material', route: 'AdminInventory' },
    { id: 3, title: 'Service Management', icon: 'build', type: 'material', route: 'AdminService' },
    { id: 4, title: 'Transactions', icon: 'attach-money', type: 'material', route: 'AdminTransactions' },
    { id: 5, title: 'Notifications', icon: 'notifications', type: 'ion', route: 'AdminNotifications' },
    { id: 6, title: 'Reports & Analytics', icon: 'bar-chart', type: 'ion', route: 'AdminReports' },
    { id: 7, title: 'QR Code Scanning', icon: 'qrcode', type: 'font-awesome', route: 'AdminQrCode' },
  ];

  const renderIcon = (item) => {
    const size = 24;
    const color = '#1e1e1e';
    
    switch(item.type) {
      case 'ion':
        return <Ionicons name={item.icon} size={size} color={color} />;
      case 'material':
        return <MaterialIcons name={item.icon} size={size} color={color} />;
      case 'font-awesome':
        return <FontAwesome name={item.icon} size={size} color={color} />;
      default:
        return null;
    }
  };
    const { logout } = useAuth();
  

  const handleLogout = async () => {
    
    await logout();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#E50000" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={styles.menuIcon}>
                {renderIcon(item)}
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 4,
    color: '#E50000',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 120,
  },
  menuIcon: {
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e1e1e',
    textAlign: 'center',
  },
});

export default AdminDashboard; 