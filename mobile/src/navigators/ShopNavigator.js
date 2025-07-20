import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import ShopScreen from '../screens/Shop/ShopScreen';

const Stack = createStackNavigator();

export default function ShopNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Shop" component={ShopScreen} />
    </Stack.Navigator>
  );
}