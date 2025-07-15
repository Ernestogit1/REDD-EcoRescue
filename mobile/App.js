import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { ActivityIndicator, View } from 'react-native';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import HomeNavigator from './src/navigators/HomeNavigator';
import GameNavigator from './src/navigators/GameNavigator';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import audioService from './src/services/audio.service';
import 'expo-dev-client';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  gestureEnabled: false,
  animation: 'fade',
  animationDuration: 500,
  presentation: 'card',
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
};

export default function App() {
  let [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  useEffect(() => {
    const initializeApp = async () => {
      // Lock screen orientation
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      
      // Initialize audio service
      await audioService.initializeAudio();
      await audioService.loadBackgroundMusic();
      
      // Start background music after a short delay
      setTimeout(() => {
        audioService.playBackgroundMusic();
      }, 1000);
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      audioService.cleanup();
    };
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={screenOptions}
      >
        <Stack.Screen name="Home" component={HomeNavigator} />
        <Stack.Screen name="GameRoot" component={GameNavigator} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}