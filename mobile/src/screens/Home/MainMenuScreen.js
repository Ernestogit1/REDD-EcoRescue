import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { height: screenHeight } = Dimensions.get('window');

export default function MainMenuScreen() {
  const navigation = useNavigation();

  // Animation values using built-in Animated API
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Floating animation for background elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Card entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered button animations
    const buttonAnimations = buttonAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      })
    );

    Animated.stagger(200, buttonAnimations).start();
  }, []);

  const handleMenuAction = (action) => {
    switch (action) {
      case 'play':
        // Navigate to game or show coming soon alert
        console.log('Play button pressed');
        break;
      case 'about':
        navigation.navigate('AboutUs');
        break;
      case 'options':
        navigation.navigate('Options');
        break;
      case 'login':
        navigation.navigate('Login');
        break;
      default:
        break;
    }
  };

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const menuButtons = [
    { id: 'play', title: 'PLAY', icon: '🎮', color: '#4ade80' },
    { id: 'about', title: 'ABOUT US', icon: '📖', color: '#60a5fa' },
    { id: 'options', title: 'OPTIONS', icon: '⚙️', color: '#fbbf24' },
    { id: 'login', title: 'LOGIN', icon: '👤', color: '#f87171' },
  ];

  return (
    <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
      <View style={styles.mainContent}>
        <Animated.View style={[
          styles.header,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}>
          <Text style={styles.gameTitle}>REDD-EcoRescue</Text>
        </Animated.View>

        <Animated.View style={[
          styles.menuContainer,
          {
            opacity: fadeAnim,
          }
        ]}>
          {menuButtons.map((button, index) => (
            <Animated.View
              key={button.id}
              style={[
                styles.buttonWrapper,
                {
                  opacity: buttonAnims[index],
                  transform: [
                    {
                      translateY: buttonAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  { borderColor: button.color, borderTopColor: button.color + '80', borderLeftColor: button.color + '80' }
                ]}
                onPress={() => handleMenuAction(button.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonIcon}>{button.icon}</Text>
                <Text style={[styles.buttonText, { color: button.color }]}>{button.title}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View style={[
          styles.footer,
          {
            opacity: fadeAnim,
          }
        ]}>
          <Text style={styles.footerText}>v1.0.0</Text>
        </Animated.View>
      </View>

      {/* Animated background elements */}
      <Animated.View style={[
        styles.backgroundElement,
        styles.tree1,
        { transform: [{ translateY: floatingTransform }] }
      ]} pointerEvents="none">
        <Text style={styles.backgroundEmoji}>🌲</Text>
      </Animated.View>
      <Animated.View style={[
        styles.backgroundElement,
        styles.tree2,
        { transform: [{ translateY: floatingTransform }] }
      ]} pointerEvents="none">
        <Text style={styles.backgroundEmoji}>🌳</Text>
      </Animated.View>
      <Animated.View style={[
        styles.backgroundElement,
        styles.animal1,
        { transform: [{ translateY: floatingTransform }] }
      ]} pointerEvents="none">
        <Text style={styles.backgroundEmoji}>🦁</Text>
      </Animated.View>
      <Animated.View style={[
        styles.backgroundElement,
        styles.animal2,
        { transform: [{ translateY: floatingTransform }] }
      ]} pointerEvents="none">
        <Text style={styles.backgroundEmoji}>🐘</Text>
      </Animated.View>
      <Animated.View style={[
        styles.backgroundElement,
        styles.bird1,
        { transform: [{ translateY: floatingTransform }] }
      ]} pointerEvents="none">
        <Text style={styles.backgroundEmoji}>🦅</Text>
      </Animated.View>
      <Animated.View style={[
        styles.backgroundElement,
        styles.plant1,
        { transform: [{ translateY: floatingTransform }] }
      ]} pointerEvents="none">
        <Text style={styles.backgroundEmoji}>🌿</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    textAlign: 'center',
  },
  gameLogo: {
    fontSize: 40,
    marginVertical: 10,
  },
  gameSubtitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    fontSize: 10,
    marginTop: 10,
    textShadowColor: '#22c55e',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    textAlign: 'center',
  },
  menuContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 15,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    borderWidth: 3,
    borderColor: '#3d2914',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
    minHeight: 60,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  buttonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 12,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 8,
    opacity: 0.6,
  },
  // Animated background elements
  backgroundElement: {
    position: 'absolute',
    zIndex: 1,
  },
  backgroundEmoji: {
    fontSize: 24,
    opacity: 0.15,
  },
  tree1: {
    top: '8%',
    left: '5%',
  },
  tree2: {
    top: '12%',
    right: '8%',
  },
  animal1: {
    bottom: '15%',
    left: '4%',
  },
  animal2: {
    bottom: '25%',
    right: '6%',
  },
  bird1: {
    top: '25%',
    left: '12%',
  },
  plant1: {
    bottom: '35%',
    right: '15%',
  },
});