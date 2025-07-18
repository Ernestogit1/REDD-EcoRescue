import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Level3Screen() {
  const navigation = useNavigation();
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameComplete, setGameComplete] = useState(false);
  const [activeHoles, setActiveHoles] = useState(new Array(8).fill(false));
  const timerRef = useRef(null);
  const gameInterval = useRef(null);
  const fadeAnims = useRef(activeHoles.map(() => new Animated.Value(0))).current;

  const spawnInsect = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * 8);
    
    // Update state first
    setActiveHoles(prev => {
      const newHoles = [...prev];
      newHoles[randomIndex] = true;
      return newHoles;
    });

    // Handle animation separately
    const animation = Animated.sequence([
      Animated.timing(fadeAnims[randomIndex], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(fadeAnims[randomIndex], {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]);

    animation.start(() => {
      setActiveHoles(prev => {
        const updatedHoles = [...prev];
        updatedHoles[randomIndex] = false;
        return updatedHoles;
      });
    });

    return () => animation.stop();
  }, [fadeAnims]);

  const handleTap = useCallback((index) => {
    if (activeHoles[index] && !gameComplete) {
      setScore(prev => prev + 10);
      fadeAnims[index].setValue(0);
      
      setActiveHoles(prev => {
        const newHoles = [...prev];
        newHoles[index] = false;
        return newHoles;
      });
    }
  }, [activeHoles, gameComplete]);

  const startGame = useCallback(() => {
    setScore(0);
    setTimer(30);
    setGameComplete(false);
    setActiveHoles(new Array(8).fill(false));
    
    // Reset animations
    fadeAnims.forEach(anim => anim.setValue(0));

    // Clear existing intervals
    if (timerRef.current) clearInterval(timerRef.current);
    if (gameInterval.current) clearInterval(gameInterval.current);

    // Start new intervals
    timerRef.current = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    gameInterval.current = setInterval(spawnInsect, 1000);
  }, [spawnInsect]);

  useEffect(() => {
    startGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gameInterval.current) clearInterval(gameInterval.current);
    };
  }, []);

  useEffect(() => {
    if (timer === 0) {
      handleGameOver();
    }
  }, [timer]);

  const handleGameOver = () => {
    clearInterval(timerRef.current);
    clearInterval(gameInterval.current);
    setGameComplete(true);

    if (score >= 100) {
      Alert.alert(
        "Level Complete!",
        `Great job! You scored ${score} points!`,
        [{ text: "Continue", onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert(
        "Time's Up!",
        `You scored ${score} points. Try again to reach 100!`,
        [
          { text: "Retry", onPress: () => startGame() },
          { text: "Exit", onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A3C40', '#0D1B1E']} style={styles.background}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← EXIT</Text>
          </TouchableOpacity>
          
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>BUG ZAPPER</Text>
            <Text style={styles.levelText}>LEVEL 3</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TIME</Text>
              <Text style={styles.statValue}>{timer}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SCORE</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
          </View>
        </View>

        <View style={styles.gameBoard}>
          {activeHoles.map((isActive, index) => (
            <TouchableOpacity
              key={index}
              style={styles.hole}
              onPress={() => handleTap(index)}
              activeOpacity={0.8}
            >
              {isActive && (
                <Animated.View
                  style={[
                    styles.insect,
                    { opacity: fadeAnims[index] }
                  ]}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.controlButton} onPress={startGame}>
          <LinearGradient colors={['#52B69A', '#1A759F']} style={styles.controlButtonGradient}>
            <Text style={styles.controlButtonText}>RESTART</Text>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  gameInfo: {
    alignItems: 'center',
  },
  gameTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 5,
  },
  levelText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 8,
  },
  statValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 14,
  },
  gameBoard: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hole: {
    width: screenWidth * 0.20,
    height: screenWidth * 0.10,
    margin: 10,
    backgroundColor: '#2A2B2A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#52B69A',
  },
  insect: {
    width: '60%',
    height: '60%',
    backgroundColor: '#FF6B6B',
    borderRadius: 20,
  },
  controlButton: {
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  controlButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
});
