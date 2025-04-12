import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Text, View, StyleSheet } from 'react-native';
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome5 
} from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import Home from '../screens/Home';
import Categories from '../screens/Categories';
import Cart from '../screens/Cart';
import Appointment from '../screens/Appointment';
import Profile from '../screens/Profile';
import OrderHistory from '../screens/OrderHistory';
import ServiceStatus from '../screens/ServiceStatus';
import ServiceHistory from '../screens/ServiceHistory';
import TermsOfService from '../screens/TermsOfService';
import PrivacyPolicy from '../screens/PrivacyPolicy';
import MyAddresses from '../screens/MyAddresses';
import PaymentMethods from '../screens/PaymentMethods';
import Notifications from '../screens/Notifications';
import HelpSupport from '../screens/HelpSupport';
import EditProfile from '../screens/EditProfile';
import ProductDetail from '../screens/ProductDetail';
import Checkout from '../screens/Checkout';
import ChatSupport from '../screens/ChatSupport';
// Import admin navigator
import AdminNavigator from './AdminNavigator';

// Import custom drawer content
import DrawerContent from '../components/DrawerContent';
import EmployeeNavigator from './EmployeeNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Custom tab bar icon component
const TabIcon = ({ name, focused }) => {
  const renderIcon = () => {
    switch(name) {
      case 'Home':
        return <Ionicons 
                name="home-sharp" 
                size={22} 
                color={focused ? '#1e1e1e' : '#999'} 
              />;
      case 'Categories':
        return <Ionicons 
                name="grid-outline" 
                size={22} 
                color={focused ? '#1e1e1e' : '#999'} 
              />;
      case 'Cart':
        return <Ionicons 
                name="cart" 
                size={22} 
                color={focused ? '#1e1e1e' : '#999'} 
              />;
      case 'Appointment':
        return <MaterialIcons 
                name="event-available" 
                size={22} 
                color={focused ? '#1e1e1e' : '#999'} 
              />;
      case 'Profile':
        return <FontAwesome5 
                name="user-alt" 
                size={20} 
                color={focused ? '#1e1e1e' : '#999'} 
              />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.tabIconContainer}>
      {renderIcon()}
      <Text style={[
        styles.tabLabel,
        focused ? styles.tabLabelActive : styles.tabLabelInactive
      ]}>
        {name}
      </Text>
    </View>
  );
};

// Bottom tabs navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={Home} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="CategoriesTab" 
        component={Categories} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Categories" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="CartTab" 
        component={Cart} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Cart" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="AppointmentTab" 
        component={Appointment} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Appointment" focused={focused} />,
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={Profile} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Drawer navigator wrapping the tabs
const MainDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
      <Drawer.Screen name="OrderHistory" component={OrderHistory} />
      <Drawer.Screen name="ServiceStatus" component={ServiceStatus} />
      <Drawer.Screen name="ServiceHistory" component={ServiceHistory} />
    </Drawer.Navigator>
  );
};

// Main navigator
const AppNavigator = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Signup" 
            component={Signup} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MainDrawer" 
            component={MainDrawer} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EmployeeDashboard" 
            component={EmployeeNavigator} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetail} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="TermsOfService" 
            component={TermsOfService} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicy} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MyAddresses" 
            component={MyAddresses} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PaymentMethods" 
            component={PaymentMethods} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={Notifications} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="HelpSupport" 
            component={HelpSupport} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfile} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Checkout"
            component={Checkout}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Tawk" 
            component={ChatSupport} 
            options={{ headerShown: false, presentation: 'modal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 55,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
    width: 65,
  },
  tabLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },
  tabLabelActive: {
    color: '#1e1e1e',
    fontWeight: 'bold',
  },
  tabLabelInactive: {
    color: '#999',
  },
});

export default AppNavigator; 