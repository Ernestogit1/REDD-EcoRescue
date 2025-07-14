import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { ActivityIndicator, View } from 'react-native';
import MainMenuScreen from './src/screens/Home/MainMenuScreen';
import AboutUsScreen from './src/screens/Home/AboutUsScreen';
import OptionsScreen from './src/screens/Home/OptionsScreen';
import LoginScreen from './src/screens/Home/LoginScreen';
import RegisterScreen from './src/screens/Home/RegisterScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import audioService from './src/services/audio.service';
import 'expo-dev-client';

const Stack = createNativeStackNavigator();

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
        initialRouteName="MainMenu"
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="AboutUs" component={AboutUsScreen} />
        <Stack.Screen name="Options" component={OptionsScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}