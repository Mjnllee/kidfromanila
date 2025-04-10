import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from '../screens/admin/Dashboard';
import HumanResources from '../screens/admin/HumanResources';
import UserForm from '../screens/admin/UserForm';
import Inventory from '../screens/admin/Inventory';
import ProductForm from '../screens/admin/ProductForm';
import AdminService from '../screens/admin/AdminService';
import ServiceForm from '../screens/admin/ServiceForm';

// Placeholder empty components for admin screens
const AdminTransactions = () => <></>;
const AdminNotifications = () => <></>;
const AdminReports = () => <></>;
const AdminQrCode = () => <></>;

const Stack = createNativeStackNavigator();

const AdminNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="AdminDashboard">
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboard} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminHumanResources" 
        component={HumanResources} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserForm" 
        component={UserForm} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminInventory" 
        component={Inventory} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductForm" 
        component={ProductForm} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminService" 
        component={AdminService} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ServiceForm" 
        component={ServiceForm} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AdminTransactions" 
        component={AdminTransactions} 
        options={{ title: 'Transactions' }}
      />
      <Stack.Screen 
        name="AdminNotifications" 
        component={AdminNotifications} 
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="AdminReports" 
        component={AdminReports} 
        options={{ title: 'Reports & Analytics' }}
      />
      <Stack.Screen 
        name="AdminQrCode" 
        component={AdminQrCode} 
        options={{ title: 'QR Code Scanning' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator; 