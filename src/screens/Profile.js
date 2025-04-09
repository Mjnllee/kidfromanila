import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const ProfileItem = ({ icon, text, iconType = 'Ionicons', onPress }) => {
  const renderIcon = () => {
    switch (iconType) {
      case 'Ionicons':
        return <Ionicons name={icon} size={24} color="#555" />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={icon} size={24} color="#555" />;
      case 'FontAwesome':
        return <FontAwesome name={icon} size={24} color="#555" />;
      case 'Feather':
        return <Feather name={icon} size={24} color="#555" />;
      default:
        return <Ionicons name={icon} size={24} color="#555" />;
    }
  };

  return (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        {renderIcon()}
        <Text style={styles.profileItemText}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

const Profile = () => {
  const navigation = useNavigation();
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header title="Profile" />

      <ScrollView>
        <View style={styles.profileHeader}>
          <Image
            source={user?.profileImageUrl ? { uri: user.profileImageUrl } : require('../../assets/avatar.png')}
            style={styles.profileImage}
          />
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'guest@example.com'}</Text>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => navigation.navigate('EditProfile', { profile: user })}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <ProfileItem 
            icon="person-outline" 
            text="Edit Profile" 
            onPress={() => navigation.navigate('EditProfile', { profile: user })} 
          />
          <ProfileItem 
            icon="location-outline" 
            text="My Addresses" 
            onPress={() => navigation.navigate('MyAddresses')} 
          />
          <ProfileItem 
            icon="card-outline" 
            text="Payment Methods" 
            onPress={() => navigation.navigate('PaymentMethods')} 
          />
          <ProfileItem 
            icon="time-outline" 
            text="Order History" 
            onPress={() => navigation.navigate('OrderHistory')} 
          />
          <ProfileItem 
            icon="calendar-outline" 
            text="Service History" 
            onPress={() => navigation.navigate('ServiceHistory')} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <ProfileItem 
            icon="notifications-outline" 
            text="Notifications" 
            onPress={() => navigation.navigate('Notifications')} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <ProfileItem 
            icon="help-circle-outline" 
            text="Help & Support" 
            onPress={() => navigation.navigate('HelpSupport')} 
          />
          <ProfileItem 
            icon="shield-outline" 
            text="Privacy Policy" 
            onPress={() => navigation.navigate('PrivacyPolicy')} 
          />
          <ProfileItem 
            icon="document-text-outline" 
            text="Terms of Service" 
            onPress={() => navigation.navigate('TermsOfService')} 
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF385C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  editButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingVertical: 10,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF385C',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  versionText: {
    color: '#999',
    fontSize: 12,
  },
});

export default Profile; 