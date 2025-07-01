import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/api.service';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const navigation = useNavigation();
  const [credentials, setCredentials] = useState({ emailOrUsername: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Animation values using built-in Animated API
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

  const handleChange = (name, value) => {
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!credentials.emailOrUsername || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await ApiService.login({
        emailOrUsername: credentials.emailOrUsername,
        password: credentials.password
      });

      if (response.success) {
        Alert.alert(
          'Login Successful!',
          `Welcome back, ${response.data.user.username}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to dashboard
                navigation.navigate('Dashboard');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <Animated.View style={[
          styles.card,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}>
          <View style={styles.header}>
            <Text style={styles.title}>REDD-EcoRescue</Text>
            <Text style={styles.avatar}>🌲</Text>
            <Text style={styles.subtitle}>Login</Text>
          </View>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username or Email</Text>
            <TextInput
              style={styles.input}
              value={credentials.emailOrUsername}
              onChangeText={v => handleChange('emailOrUsername', v)}
              placeholder="Enter username or email"
              placeholderTextColor="#888"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={credentials.password}
              onChangeText={v => handleChange('password', v)}
              placeholder="Enter password"
              placeholderTextColor="#888"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={styles.linkContainer} onPress={() => {}}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'LOGGING IN...' : 'LOGIN'}</Text>
          </TouchableOpacity>
          
          <View style={styles.orDivider}>
            <Text style={styles.orText}>OR</Text>
          </View>
          
          <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={() => {}}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.buttonText}>LOGIN WITH GOOGLE</Text>
          </TouchableOpacity>
          
          <View style={styles.registerLinkContainer}>
            <Text style={styles.label}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.link}>Register</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

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
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  card: {
    width: '95%',
    maxWidth: 340,
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#3d2914',
    borderTopColor: '#CD853F',
    borderLeftColor: '#CD853F',
    borderRadius: 6,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 12,
    marginBottom: 4,
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    fontSize: 10,
    marginTop: 4,
    textShadowColor: '#22c55e',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  avatar: {
    fontSize: 20,
    marginVertical: 3,
  },
  error: {
    color: '#ff4d4f',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    marginBottom: 6,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 8,
  },
  label: {
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    marginBottom: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  input: {
    width: '100%',
    padding: 8,
    borderWidth: 2,
    borderColor: '#3d2914',
    borderTopColor: '#000',
    borderLeftColor: '#000',
    borderBottomColor: '#CD853F',
    borderRightColor: '#CD853F',
    backgroundColor: '#F5F5DC',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 9,
    color: '#000',
    height: 32,
  },
  linkContainer: {
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  link: {
    color: '#4ade80',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    textDecorationLine: 'underline',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    padding: 6,
    borderWidth: 2,
    borderRadius: 4,
    marginTop: 3,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
    height: 36,
  },
  primaryButton: {
    backgroundColor: '#4ade80',
    borderColor: '#16a34a',
    borderTopColor: '#86efac',
    borderLeftColor: '#86efac',
  },
  disabledButton: {
    backgroundColor: '#696969',
    borderColor: '#2F2F2F',
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#1a4d2e',
    textAlign: 'center',
    marginLeft: 2,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  googleIcon: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#333',
    fontSize: 10,
    marginRight: 4,
  },
  orDivider: {
    alignItems: 'center',
    marginVertical: 3,
  },
  orText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 7,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  // Animated background elements
  backgroundElement: {
    position: 'absolute',
    zIndex: 1,
  },
  backgroundEmoji: {
    fontSize: 18,
    opacity: 0.2,
  },
  tree1: {
    top: '10%',
    left: '8%',
  },
  tree2: {
    top: '15%',
    right: '12%',
  },
  animal1: {
    bottom: '20%',
    left: '6%',
  },
  animal2: {
    bottom: '25%',
    right: '10%',
  },
}); 