import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../services/api.service';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await ApiService.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            await ApiService.logout();
            navigation.navigate('MainMenu');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1a4d2e", "#2d5a3d", "#1a4d2e"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>🌲 REDD-EcoRescue</Text>
          <Text style={styles.subtitle}>Dashboard</Text>
        </View>

        {userData && (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>Welcome, {userData.username}!</Text>
              <Text style={styles.email}>{userData.email}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userData.rescueStars}</Text>
                  <Text style={styles.statLabel}>⭐ Rescue Stars</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{userData.rank}</Text>
                  <Text style={styles.statLabel}>🏆 Rank</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🌳</Text>
            <Text style={styles.menuText}>Forest Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>Carbon Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🦌</Text>
            <Text style={styles.menuText}>Wildlife Rescue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuText}>Community</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    fontSize: 12,
  },
  userCard: {
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#3d2914',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  username: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 12,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 8,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    fontSize: 14,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 7,
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuItem: {
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#3d2914',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  menuText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 8,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    borderWidth: 2,
    borderColor: '#991b1b',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 10,
  },
});
