import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboard from '../screens/admin/Dashboard';
import HumanResources from '../screens/admin/HumanResources';
import UserForm from '../screens/admin/UserForm';
import Inventory from '../screens/admin/Inventory';
import ProductForm from '../screens/admin/ProductForm';
import AdminService from '../screens/admin/AdminService';
import ServiceForm from '../screens/admin/ServiceForm';
import AdminTransactions from '../screens/admin/AdminTransactions';
import EmployeeDashBoard from '../screens/employee/Dashboard';

// Placeholder empty components for admin screens
// const AdminTransactions = () => <></>;
const EmployeeAnalytics = () => <></>;
const EmployeeOrders = () => <></>;
const EmployeeTransactions = () => <></>;
const EmployeeNotifications = () => <></>;
const EmployeeAccountSettings = () => <></>;
const EmployeeQRCodeScanning = () => <></>;

const Stack = createNativeStackNavigator();

const EmployeeNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="EmployeeDashboard">
      <Stack.Screen 
        name="EmployeeDashboard" 
        component={EmployeeDashBoard} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EmployeeAnalytics" 
        component={EmployeeAnalytics} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EmployeeOrders" 
        component={EmployeeOrders} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EmployeeTransactions" 
        component={EmployeeTransactions} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EmployeeNotifications" 
        component={EmployeeNotifications} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EmployeeAccountSettings" 
        component={EmployeeAccountSettings} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="EmployeeQRCodeScanning" 
        component={EmployeeQRCodeScanning} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default EmployeeNavigator; 