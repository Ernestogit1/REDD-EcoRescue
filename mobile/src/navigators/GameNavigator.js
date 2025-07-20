import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DifficultyScreen from '../screens/Levels/DifficultyScreen';
import EasyMapScreen from '../screens/Levels/Map/EasyMapScreen';
import MediumMapScreen from '../screens/Levels/Map/MediumMapScreen';
import HardMapScreen from '../screens/Levels/Map/HardMapScreen';
import LevelDetailsScreen from '../screens/Levels/Map/LevelDetailsScreen';
// Import level screens
import Level1Screen from '../screens/Levels/Map/Level1-5/Level1Screen';
import Level2Screen from '../screens/Levels/Map/Level1-5/Level2Screen';
import Level3Screen from '../screens/Levels/Map/Level1-5/Level3Screen';
import Level4Screen from '../screens/Levels/Map/Level1-5/Level4Screen';
import Level6Screen from '../screens/Levels/Map/Level6-10/Level6Screen';
import Level7Screen from '../screens/Levels/Map/Level6-10/Level7Screen';
import Level8Screen from '../screens/Levels/Map/Level6-10/Level8Screen';
import Level9Screen from '../screens/Levels/Map/Level6-10/Level9Screen';
import Level10Screen from '../screens/Levels/Map/Level6-10/Level10Screen';


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
      
      <Stack.Screen 
        name="LevelDetails" 
        component={LevelDetailsScreen}
        options={({ route }) => ({ 
          title: `Level ${route.params?.level || 1} - ${route.params?.difficulty || 'Easy'}` 
        })}
      />
      
      <Stack.Screen 
        name="Play" 
        options={({ route }) => ({ 
          title: `Level ${route.params?.level || 1} - ${route.params?.difficulty || 'Easy'}` 
        })}
      >
        {({ route }) => {
          // Determine which level screen to show based on level number
          const { level } = route.params || {};
          
          switch (parseInt(level)) {
            case 1:
              return <Level1Screen />;
            case 2:
              return <Level2Screen />;
            case 3:
              return <Level3Screen />;
            case 4:
              return <Level4Screen />;
            case 6:
              return <Level6Screen />;
            case 7:
              return <Level7Screen />;
            case 8:
              return <Level8Screen />;
            case 9:
              return <Level9Screen />;
            case 10:
              return <Level10Screen />;
              
            default:
              return <DifficultyScreen />;
          }
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
