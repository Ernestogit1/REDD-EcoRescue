import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export default function MainMenuScreen() {
  const navigation = useNavigation();
  const [currentBackground, setCurrentBackground] = useState(0); // 0: LinearGradient, 1-4: GIFs
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

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
  const selectorAnim = useRef(new Animated.Value(0)).current;

  // Background options
  const backgrounds = [
    { id: 0, name: 'Default', type: 'gradient' },
    { id: 1, name: 'Forest', type: 'gif', source: require('../../../assets/images/main-menu/main-menu1.mp4') },
    { id: 2, name: 'Night Camp', type: 'gif', source: require('../../../assets/images/main-menu/main-menu2.mp4') },
    { id: 3, name: 'Waterfall', type: 'gif', source: require('../../../assets/images/main-menu/main-menu3.mp4') },
    { id: 4, name: 'Autumn', type: 'gif', source: require('../../../assets/images/main-menu/main-menu4.mp4') },
  ];

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

  useEffect(() => {
    // Animation for background selector
    if (showBackgroundSelector) {
      Animated.spring(selectorAnim, {
        toValue: 1,
        tension: 70,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(selectorAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showBackgroundSelector]);

  const handleMenuAction = (action) => {
    switch (action) {
      case 'play':
        navigation.navigate('GameRoot');
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

  const toggleBackgroundSelector = () => {
    setShowBackgroundSelector(!showBackgroundSelector);
  };

  const selectBackground = (backgroundId) => {
    setCurrentBackground(backgroundId);
    setShowBackgroundSelector(false);
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

  // Render the appropriate background
  const renderBackground = () => {
    if (currentBackground === 0) {
      return (
        <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
          {renderContent()}
        </LinearGradient>
      );
    } else {
      const selectedBg = backgrounds.find(bg => bg.id === currentBackground);
      return (
        <View style={styles.container}>
          <Video 
            source={selectedBg.source}
            style={styles.backgroundImage}
            resizeMode="cover"
            shouldPlay
            isLooping
            isMuted
          />
          {renderContent()}
        </View>
      );
    }
  };

  // Render the content (separate from background for cleaner code)
  const renderContent = () => {
    return (
      <>
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

        {/* Background selector button */}
        <TouchableOpacity 
          style={styles.bgSelectorButton}
          onPress={toggleBackgroundSelector}
        >
          <Text style={styles.bgSelectorButtonText}>🖼️</Text>
        </TouchableOpacity>

        {/* Background selector container (not modal) */}
        {showBackgroundSelector && (
          <Animated.View 
            style={[
              styles.bgSelectorContainer,
              {
                opacity: selectorAnim,
                transform: [
                  { scale: selectorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  })}
                ]
              }
            ]}
          >
            <View style={styles.bgSelectorHeader}>
              <Text style={styles.bgSelectorTitle}>Select Background</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowBackgroundSelector(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✖</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.bgOptionsContainer}>
              {backgrounds.map((bg) => (
                <TouchableOpacity
                  key={bg.id}
                  style={[
                    styles.bgOption,
                    currentBackground === bg.id && styles.selectedBgOption
                  ]}
                  onPress={() => selectBackground(bg.id)}
                  activeOpacity={0.7}
                >
                  {bg.type === 'gradient' ? (
                    <LinearGradient 
                      colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} 
                      style={styles.bgPreview}
                    />
                  ) : (
                    <Video 
                      source={bg.source}
                      style={styles.bgPreview}
                      resizeMode="cover"
                      shouldPlay
                      isLooping
                      isMuted
                    />
                  )}
                  <Text style={styles.bgOptionText}>{bg.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Animated background elements - only show on gradient background */}
        {currentBackground === 0 && (
          <>
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
          </>
        )}
      </>
    );
  };

  return renderBackground();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
    textShadowColor: '#000',
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
  // Background selector button
  bgSelectorButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  bgSelectorButtonText: {
    fontSize: 18,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgSelectorContainer: {
    position: 'absolute',
    top: 50,
    left: 230,
    backgroundColor: '#3d2914',
    borderRadius: 8,
    padding: 15,
    width: screenWidth * 0.8,
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#FFD700',
    zIndex: 100,
  },
  bgSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    paddingBottom: 10,
  },
  bgSelectorTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 12,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#FFD700',
    fontSize: 16,
  },
  bgOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  bgOption: {
    width: '25%',
    marginBottom: 5,
    alignItems: 'center',
    padding: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedBgOption: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  bgPreview: {
    width: '100%',
    height: 60,
    borderRadius: 4,
    marginBottom: 5,
  },
  bgOptionText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 8,
    marginTop: 5,
    textAlign: 'center',
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