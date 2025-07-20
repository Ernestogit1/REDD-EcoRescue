import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MainMenuScreen from '../screens/Home/MainMenuScreen';
import LoginScreen from '../screens/Home/LoginScreen';
import RegisterScreen from '../screens/Home/RegisterScreen';
import OptionsScreen from '../screens/Home/OptionsScreen';
import AboutUsScreen from '../screens/Home/AboutUsScreen';
import DashboardScreen from '../screens/Dashboard/DashboardScreen'; // adjust path as needed
import UserDetailsScreen from '../screens/Home/UserDetailsScreen';

const Stack = createStackNavigator();

// Custom animation configuration for consistent slide effect
const slideAnimation = {
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      opacity: current.progress,
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
        {
          scale: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  }),
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: 300,
      },
    },
  },
};

export default function HomeNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainMenu"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        cardStyle: { backgroundColor: 'transparent' },
        ...slideAnimation,
      }}
    >
      <Stack.Screen 
        name="MainMenu" 
        component={MainMenuScreen}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
      />
      <Stack.Screen 
        name="Options" 
        component={OptionsScreen}
      />
      <Stack.Screen 
        name="AboutUs" 
        component={AboutUsScreen}
      />
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen}
      />
      <Stack.Screen 
        name="UserDetails" 
        component={UserDetailsScreen}
      />
    </Stack.Navigator>
  );
}