import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, ActivityIndicator } from 'react-native';
import ApiService from '../../services/api.service';

const { width: screenWidth } = Dimensions.get('window');

const TABS = [
  { key: 'details', label: 'User Details' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'cards', label: 'Animal Cards Owned' },
];

export default function UserDetailsScreen() {
  const [activeTab, setActiveTab] = useState('details');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ApiService.getProfile();
        // The user is at data.data.user
        setUser(data?.data?.user || data.user || data);
      } catch (err) {
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Placeholder content for each tab
  const renderTabContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 40 }} />;
    }
    if (error) {
      return <Text style={{ color: 'red', marginTop: 40 }}>{error}</Text>;
    }
    if (!user) {
      return <Text style={{ color: '#fff', marginTop: 40 }}>No user data found.</Text>;
    }
    switch (activeTab) {
      case 'details':
        return (
          <View style={styles.tabContentInner}>
            <Image source={{ uri: user.avatar || 'https://placehold.co/100x100' }} style={styles.avatar} />
            <Text style={styles.label}><Text style={styles.labelHighlight}>Username:</Text> {user.username}</Text>
            <Text style={styles.label}><Text style={styles.labelHighlight}>Email:</Text> {user.email}</Text>
            <Text style={styles.label}><Text style={styles.labelHighlight}>Rank:</Text> {user.rank}</Text>
            <Text style={styles.label}><Text style={styles.labelHighlight}>Rescue Stars:</Text> {user.rescueStars}</Text>
            <Text style={styles.label}><Text style={styles.labelHighlight}>Points:</Text> {user.points}</Text>
          </View>
        );
      case 'achievements':
        return (
          <View style={styles.tabContentInner}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievement}>🏆 First Rescue</Text>
            <Text style={styles.achievement}>🌳 Forest Guardian</Text>
            <Text style={styles.achievement}>🦁 Animal Friend</Text>
            <Text style={styles.achievement}>✨ More coming soon...</Text>
          </View>
        );
      case 'cards':
        return (
          <View style={styles.tabContentInner}>
            <Text style={styles.sectionTitle}>Animal Cards Owned</Text>
            <Text style={styles.card}>🦁 Lion</Text>
            <Text style={styles.card}>🐘 Elephant</Text>
            <Text style={styles.card}>🦅 Eagle</Text>
            <Text style={styles.card}>🦊 Fox</Text>
            <Text style={styles.card}>✨ More coming soon...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.activeTabButtonText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Tab Content */}
      <ScrollView contentContainerStyle={styles.tabContent}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3d2914',
    paddingTop: 40,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#2d1e10',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    paddingVertical: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#FFD700',
  },
  tabButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 10,
  },
  activeTabButtonText: {
    color: '#3d2914',
  },
  tabContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
  },
  tabContentInner: {
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginBottom: 18,
  },
  label: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  labelHighlight: {
    color: '#FFD700',
  },
  sectionTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  achievement: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#4ade80',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#60a5fa',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
});
