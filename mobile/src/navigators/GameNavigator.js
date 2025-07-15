import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DifficultyScreen from '../screens/Levels/DifficultyScreen';
import EasyMapScreen from '../screens/Levels/Map/EasyMapScreen';
import MediumMapScreen from '../screens/Levels/Map/MediumMapScreen';
import HardMapScreen from '../screens/Levels/Map/HardMapScreen';

const Stack = createStackNavigator();

export default function GameNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Difficulty"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: true,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 0.5, 0.9, 1],
              outputRange: [0, 0.25, 0.7, 1],
            }),
          },
          overlayStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
              extrapolate: 'clamp',
            }),
          },
        }),
      }}
    >
      <Stack.Screen name="Difficulty" component={DifficultyScreen} />
      <Stack.Screen name="LevelMap" 
        options={({ route }) => ({ 
          title: `${route.params?.level?.name || ''} Map` 
        })}
      >
        {({ route }) => {
          // Determine which map screen to show based on difficulty level
          const { level } = route.params || {};
          
          switch (level?.name) {
            case 'EASY':
              return <EasyMapScreen />;
            case 'MEDIUM':
              return <MediumMapScreen />;
            case 'HARD':
              return <HardMapScreen />;
            default:
              return <DifficultyScreen />;
          }
        }}
      </Stack.Screen>
      
      {/* This screen will be implemented later for actual gameplay */}
      <Stack.Screen 
        name="Play" 
        component={DifficultyScreen} // Placeholder until actual game screen is created
        options={({ route }) => ({ 
          title: `Level ${route.params?.level || 1} - ${route.params?.difficulty || 'Easy'}` 
        })}
      />
    </Stack.Navigator>
  );
}
