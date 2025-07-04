import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/api.service';

const { height: screenHeight } = Dimensions.get('window');

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [credentials, setCredentials] = useState({ username: '', email: '', password: '', confirmPassword: '' });
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
          duration: 3500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3500,
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
    if (!credentials.username || !credentials.email || !credentials.password || !credentials.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (credentials.password !== credentials.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await ApiService.register({
        username: credentials.username,
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword
      });

      if (response.success) {
        Alert.alert(
          'Registration Successful!',
          `Welcome to REDD-EcoRescue, ${response.data.user.username}!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to home/dashboard or back to login
                navigation.navigate('Login');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Test function to check API connectivity
  const testConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await ApiService.healthCheck();
      console.log('Health check response:', response);
      Alert.alert('Success!', 'Connected to server successfully!');
    } catch (error) {
      console.error('Connection test failed:', error);
      Alert.alert('Connection Failed', `Error: ${error.message}`);
    }
  };

  const floatingTransform = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
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
            <Text style={styles.avatar}>🌳</Text>
            <Text style={styles.subtitle}>Register</Text>
          </View>
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={credentials.username}
                onChangeText={v => handleChange('username', v)}
                placeholder="Enter username"
                placeholderTextColor="#888"
                autoCapitalize="none"
              />
            </View>
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={credentials.email}
                onChangeText={v => handleChange('email', v)}
                placeholder="Enter email"
                placeholderTextColor="#888"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={[styles.formGroup, styles.halfWidth]}>
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
            
            <View style={[styles.formGroup, styles.halfWidth]}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={credentials.confirmPassword}
                onChangeText={v => handleChange('confirmPassword', v)}
                placeholder="Confirm password"
                placeholderTextColor="#888"
                secureTextEntry
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>{isLoading ? 'REGISTERING...' : 'REGISTER'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={testConnection}
          >
            <Text style={styles.buttonText}>TEST CONNECTION</Text>
          </TouchableOpacity>
          
          <View style={styles.orDivider}>
            <Text style={styles.orText}>OR</Text>
          </View>
          
          <TouchableOpacity style={[styles.button, styles.googleButton]} onPress={() => {}}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.buttonText}>REGISTER WITH GOOGLE</Text>
          </TouchableOpacity>
          
          <View style={styles.registerLinkContainer}>
            <Text style={styles.label}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Login</Text>
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
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 12,
    marginBottom: 3,
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    fontSize: 10,
    marginTop: 3,
    textShadowColor: '#22c55e',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  avatar: {
    fontSize: 18,
    marginVertical: 2,
  },
  error: {
    color: '#ff4d4f',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
    marginBottom: 5,
    textAlign: 'center',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  formGroup: {
    marginBottom: 5,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    color: '#fff',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    marginBottom: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  input: {
    width: '100%',
    padding: 6,
    borderWidth: 2,
    borderColor: '#3d2914',
    borderTopColor: '#000',
    borderLeftColor: '#000',
    borderBottomColor: '#CD853F',
    borderRightColor: '#CD853F',
    backgroundColor: '#F5F5DC',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 8,
    color: '#000',
    height: 28,
  },
  link: {
    color: '#4ade80',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 6,
    textDecorationLine: 'underline',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 10,
    padding: 5,
    borderWidth: 2,
    borderRadius: 4,
    marginTop: 2,
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
    height: 32,
  },
  primaryButton: {
    backgroundColor: '#4ade80',
    borderColor: '#16a34a',
    borderTopColor: '#86efac',
    borderLeftColor: '#86efac',
  },
  testButton: {
    backgroundColor: '#f59e0b',
    borderColor: '#d97706',
    borderTopColor: '#fbbf24',
    borderLeftColor: '#fbbf24',
  },
  disabledButton: {
    backgroundColor: '#696969',
    borderColor: '#2F2F2F',
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 7,
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
    fontSize: 9,
    marginRight: 3,
  },
  orDivider: {
    alignItems: 'center',
    marginVertical: 2,
  },
  orText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 6,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 3,
    flexWrap: 'wrap',
  },
  // Animated background elements
  backgroundElement: {
    position: 'absolute',
    zIndex: 1,
  },
  backgroundEmoji: {
    fontSize: 16,
    opacity: 0.2,
  },
  tree1: {
    top: '8%',
    left: '6%',
  },
  tree2: {
    top: '12%',
    right: '10%',
  },
  animal1: {
    bottom: '18%',
    left: '4%',
  },
  animal2: {
    bottom: '22%',
    right: '8%',
  },
});