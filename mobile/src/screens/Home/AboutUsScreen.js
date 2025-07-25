import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import audioService from '../../services/audio.service';
import { useBackground, backgrounds } from '../../context/BackgroundContext';
import { Video } from 'expo-av';

const { height: screenHeight } = Dimensions.get('window');

export default function AboutUsScreen() {
  const navigation = useNavigation();
  const { currentBackground } = useBackground();

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  // Render background based on currentBackground
  const renderBackground = (children) => {
    if (currentBackground === 0) {
      return (
        <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
          {children}
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
          {children}
        </View>
      );
    }
  };

  return renderBackground(
    <>
      <View style={styles.mainContent}>
        <Animated.View style={[
          styles.header,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}>
          <Text style={styles.title}>ABOUT US</Text>
        </Animated.View>

        <Animated.View style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}>
            <View style={styles.header}>
                <Text style={styles.researchTitle}>EcoRescue: An Interactive Game to Promote Wildlife Conservation and Critical Thinking in Young Learners</Text>
                </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌍 Our Mission</Text>
                <Text style={styles.settingValue}>
                    To create a sustainable future by rescuing and rehabilitating endangered species and their habitats.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>🌱 Our Vision</Text>
                <Text style={styles.settingValue}>
                    A world where nature thrives, and every species has a chance to survive and flourish.
                </Text>
            </View>

            {/* Developers Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍💻 Developers</Text>
                <Text style={styles.settingValue}>
                    Baldoza, Donn Anthony{'\n'}
                    Balignasay, Ernesto{'\n'}
                    Davis, Daniel{'\n'}
                    Diaz, Romel Jan{'\n'}
                </Text>
            </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>← BACK TO MENU</Text>
          </TouchableOpacity>
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
    </>
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
    marginBottom: 10,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 30,
    marginTop: 10,
  },
  card: {
    width: '95%',
    maxWidth: 600,
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#3d2914',
    borderTopColor: '#CD853F',
    borderLeftColor: '#CD853F',
    borderRadius: 6,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  section: {
    marginBottom: 20,
  },
  researchTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    lineHeight: 15,
    fontSize: 10,
    textShadowColor: '#22c55e',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    lineHeight: 15,
    fontSize: 10,
    textShadowColor: '#22c55e',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    textAlign: 'justify',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  settingLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 8,
    flex: 1,
  },
  settingValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fbbf24',
    fontSize: 8,
    lineHeight: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 2,
    borderRadius: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  toggleButtonOn: {
    backgroundColor: '#4ade80',
    borderColor: '#16a34a',
  },
  toggleButtonOff: {
    backgroundColor: '#6b7280',
    borderColor: '#374151',
  },
  toggleIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  toggleText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
  },
  toggleTextOn: {
    color: '#1a4d2e',
  },
  toggleTextOff: {
    color: '#fff',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  volumeIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  volumeSlider: {
    flex: 1,
    height: 20,
  },
  volumeValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 7,
    marginLeft: 10,
    minWidth: 30,
  },
  trackName: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#60a5fa',
    fontSize: 7,
    flex: 1,
    textAlign: 'right',
  },
  backButton: {
    backgroundColor: 'lightgrey',
    borderWidth: 2,
    borderColor: 'black',
    borderTopColor: '#fca5a5',
    borderLeftColor: '#fca5a5',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#1a4d2e',
    fontSize: 10,
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
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    opacity: 0.5, // Adjust as needed for overlay effect
  },
});