import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  PanResponder,
  BackHandler,
  Vibration,
  Modal,
  ScrollView,
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { LinearGradient } from 'expo-linear-gradient';

import ApiService from '../../../../services/api.service';

const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const scale = Math.min(width, height) / 400;

// Helper function to normalize sizes
const normalize = (size) => Math.round(size * scale * pixelRatio) / pixelRatio;

// Improved collision detection for slashing
const checkSlashCollision = (gestureX, gestureY, objX, objY, objSize) => {
  const distance = Math.sqrt(
    Math.pow(gestureX - (objX + objSize / 2), 2) +
    Math.pow(gestureY - (objY + objSize / 2), 2)
  );
  return distance < objSize / 2 + normalize(40); // Adjusted hitbox for better feel
};

const Level12Screen = () => {
  const navigation = useNavigation();
  
  // Force landscape orientation
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    };
  }, []);
  
  const [gameState, setGameState] = useState({
    score: 0,
    timeLeft: 120,
    gameStarted: false,
    gameOver: false,
    fruits: [],
    debris: [],
    palmOilHazards: [],
    slashTrail: [],
    comboCount: 0,
    fruitsSlashedCount: 0,  // Add counter for fruits slashed
    debrisSlashedCount: 0,  // Add counter for debris slashed
    hearts: 3,              // Start with 3 lives
  });
  
  // Add state for mission modal
  const [showMissionModal, setShowMissionModal] = useState(false);

  // Add state for completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [completionType, setCompletionType] = useState(''); // 'success' or 'failure'
  const modalAnimation = useRef(new Animated.Value(0)).current;

  // Refs for timers
  const timerRef = useRef(null);
  const physicsRef = useRef(null);
  const comboTimeoutRef = useRef(null);
  const trailTimeoutRef = useRef(null);
  const endGameRef = useRef(false); // Prevent multiple endGame calls

  // Toggle debug info
  const showDebug = process.env.NODE_ENV === 'development';

  // Centralized cleanup function
  const cleanupTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (physicsRef.current) clearInterval(physicsRef.current);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    if (trailTimeoutRef.current) clearTimeout(trailTimeoutRef.current);
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Initialize game
  const initializeGame = useCallback(() => {
    cleanupTimers();
    endGameRef.current = false;
    setGameState({
      score: 0,
      timeLeft: 120,
      hearts: 3,
      gameStarted: false,
      gameOver: false,
      fruits: [],
      debris: [],
      palmOilHazards: [],
      slashTrail: [],
      comboCount: 0,
      fruitsSlashedCount: 0,  // Reset fruit counter
      debrisSlashedCount: 0,  // Reset debris counter
    });
  }, [cleanupTimers]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    const subscription = Dimensions.addEventListener('change', initializeGame);
    return () => {
      subscription?.remove();
      cleanupTimers();
    };
  }, [initializeGame, cleanupTimers]);

  // Game timer
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && gameState.timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setGameState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (gameState.timeLeft <= 0 && gameState.gameStarted) {
      endGame();
    }
    return () => clearTimeout(timerRef.current);
  }, [gameState.gameStarted, gameState.timeLeft, gameState.gameOver]);

  // Physics and spawning
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      physicsRef.current = setInterval(() => {
        setGameState((prev) => {
          // Update fruits
          const updatedFruits = prev.fruits
            .map((fruit) => {
              if (!fruit.active || fruit.slashed) return fruit;
              const newY = fruit.y + fruit.vy;
              const newVy = fruit.vy + normalize(0.5);
              const newX = fruit.x + fruit.vx;
              if (newY > height + normalize(100)) return null;
              return { ...fruit, x: newX, y: newY, vy: newVy, active: true };
            })
            .filter(Boolean);

          // Spawn new fruits
          if (
            Math.random() < 0.06 &&
            updatedFruits.filter((f) => f.active && !f.slashed).length < 5
          ) {
            updatedFruits.push({
              id: Date.now() + Math.random(),
              x: normalize(25) + Math.random() * (width - normalize(100)),
              y: height + normalize(20),
              vx: normalize((Math.random() - 0.5) * 3),
              vy: normalize(-18 - Math.random() * 6), // Increased upward velocity for higher flying
              size: normalize(40),
              active: true,
              slashed: false,
            });
          }

          // Update debris
          const updatedDebris = prev.debris
            .map((item) => {
              if (!item.active || item.slashed) return item;
              const newY = item.y + item.vy;
              const newVy = item.vy + normalize(0.5);
              const newX = item.x + item.vx;
              if (newY > height + normalize(100)) return null;
              return { ...item, x: newX, y: newY, vy: newVy, active: true };
            })
            .filter(Boolean);

          // Spawn new debris
          if (
            Math.random() < 0.04 &&
            updatedDebris.filter((d) => d.active && !d.slashed).length < 3
          ) {
            updatedDebris.push({
              id: Date.now() + Math.random(),
              x: normalize(25) + Math.random() * (width - normalize(100)),
              y: height + normalize(20),
              vx: normalize((Math.random() - 0.5) * 3),
              vy: normalize(-16 - Math.random() * 5), // Increased upward velocity for higher flying
              size: normalize(40),
              active: true,
              slashed: false,
              type: Math.random() > 0.5 ? 'plastic' : 'logging_tool',
            });
          }

          // Update palm oil hazards
          const updatedHazards = prev.palmOilHazards
            .map((hazard) => {
              if (!hazard.active || hazard.slashed) return hazard;
              const newY = hazard.y + hazard.vy;
              const newVy = hazard.vy + normalize(0.5);
              const newX = hazard.x + hazard.vx;
              if (newY > height + normalize(100)) return null;
              return { ...hazard, x: newX, y: newY, vy: newVy, active: true };
            })
            .filter(Boolean);

          // Spawn new hazards
          if (
            Math.random() < 0.02 &&
            updatedHazards.filter((h) => h.active && !h.slashed).length < 2
          ) {
            updatedHazards.push({
              id: Date.now() + Math.random(),
              x: normalize(25) + Math.random() * (width - normalize(100)),
              y: height + normalize(20),
              vx: normalize((Math.random() - 0.5) * 2),
              vy: normalize(-14 - Math.random() * 4), // Increased upward velocity for higher flying
              size: normalize(40),
              active: true,
              slashed: false,
            });
          }

          return {
            ...prev,
            fruits: updatedFruits,
            debris: updatedDebris,
            palmOilHazards: updatedHazards,
          };
        });
      }, 50);
    }
    return () => clearInterval(physicsRef.current);
  }, [gameState.gameStarted, gameState.gameOver]);

  // Update score with combo multiplier and check win condition
  useEffect(() => {
    const fruitsSlashed = gameState.fruits.filter((f) => f.slashed).length;
    const debrisSlashed = gameState.debris.filter((d) => d.slashed).length;
    const comboMultiplier = gameState.comboCount > 1 ? 1 + gameState.comboCount * 0.2 : 1;
    const newScore = Math.round(
      (fruitsSlashed * 10 + debrisSlashed * 15) * comboMultiplier
    );
    
    // Only update score if it's different to prevent update loops
    if (newScore !== gameState.score) {
      setGameState((prev) => ({ ...prev, score: newScore }));
    }

    // Check win condition: 8 fruits AND 8 debris slashed
    if (gameState.fruitsSlashedCount >= 8 && 
        gameState.debrisSlashedCount >= 8 && 
        gameState.gameStarted && 
        !gameState.gameOver && 
        !endGameRef.current) {
      endGame(true); // true indicates victory
    }
  }, [
    gameState.fruits,
    gameState.debris,
    gameState.comboCount,
    gameState.gameStarted, 
    gameState.gameOver,
    gameState.fruitsSlashedCount,
    gameState.debrisSlashedCount,
    endGame
  ]);

  const handleSlash = useCallback(
    (gestureX, gestureY) => {
      if (!gameState.gameStarted || gameState.gameOver) return;

      let combo = 0;
      let newFruitsSlashed = 0;
      let newDebrisSlashed = 0;

      setGameState((prev) => {
        // Check fruit collisions
        const updatedFruits = prev.fruits.map((fruit) => {
          if (
            !fruit.slashed &&
            fruit.active &&
            checkSlashCollision(gestureX, gestureY, fruit.x, fruit.y, fruit.size)
          ) {
            combo++;
            newFruitsSlashed++;
            return { ...fruit, slashed: true };
          }
          return fruit;
        });

        // Check debris collisions
        const updatedDebris = prev.debris.map((item) => {
          if (
            !item.slashed &&
            item.active &&
            checkSlashCollision(gestureX, gestureY, item.x, item.y, item.size)
          ) {
            combo++;
            newDebrisSlashed++;
            return { ...item, slashed: true };
          }
          return item;
        });

        // Check palm oil hazard collisions
        const updatedHazards = prev.palmOilHazards.map((hazard) => {
          if (
            !hazard.slashed &&
            hazard.active &&
            checkSlashCollision(gestureX, gestureY, hazard.x, hazard.y, hazard.size)
          ) {
            // Reduce hearts when slashing palm oil
            const newHearts = prev.hearts - 1;
            
            // Game over if no hearts left
            if (newHearts <= 0 && !endGameRef.current) {
              // We'll handle game over in the return statement
            }
            
            return { ...hazard, slashed: true };
          }
          return hazard;
        });

        // Update combo
        const newComboCount = combo > 0 ? prev.comboCount + combo : prev.comboCount;
        if (combo > 0) {
          Vibration.vibrate(50); // Vibrate for 50ms
          if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
          comboTimeoutRef.current = setTimeout(() => {
            setGameState((p) => ({ ...p, comboCount: 0 }));
          }, 1000);
        }

        // Check if any palm oil was slashed by counting
        const palmOilSlashed = updatedHazards.filter(h => h.slashed).length - 
                              prev.palmOilHazards.filter(h => h.slashed).length;
        
        // Calculate new hearts
        const newHearts = palmOilSlashed > 0 ? Math.max(0, prev.hearts - 1) : prev.hearts;
        
        // If hearts reach 0, trigger game over
        if (newHearts === 0 && !endGameRef.current) {
          setTimeout(() => endGame(false), 100); // false indicates defeat, delay slightly to allow state update
        }

        return {
          ...prev,
          fruits: updatedFruits,
          debris: updatedDebris,
          palmOilHazards: updatedHazards,
          comboCount: newComboCount,
          fruitsSlashedCount: prev.fruitsSlashedCount + newFruitsSlashed,
          debrisSlashedCount: prev.debrisSlashedCount + newDebrisSlashed,
          hearts: newHearts,
        };
      });
    },
    [gameState.gameStarted, gameState.gameOver]
  );

  // Swipe detection
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onMoveShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onPanResponderGrant: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          handleSlash(locationX, locationY);
        },
        onPanResponderMove: (evt) => {
          const { locationX, locationY } = evt.nativeEvent;
          setGameState((prev) => ({
            ...prev,
            slashTrail: [
              ...prev.slashTrail,
              {
                id: Date.now() + Math.random(),
                x: locationX,
                y: locationY,
                timestamp: Date.now(),
              },
            ].slice(-10),
          }));
          handleSlash(locationX, locationY);
        },
        onPanResponderRelease: () => {
          if (trailTimeoutRef.current) clearTimeout(trailTimeoutRef.current);
          trailTimeoutRef.current = setTimeout(() => {
            setGameState((prev) => ({ ...prev, slashTrail: [] }));
          }, 300);
        },
      }),
    [gameState.gameStarted, gameState.gameOver, handleSlash]
  );

  const endGame = useCallback(async (isVictory = false) => {
    if (gameState.gameOver || endGameRef.current) return;
    endGameRef.current = true;

    setGameState((prev) => ({ ...prev, gameOver: true, gameStarted: false }));
    cleanupTimers();

    // Add points to backend
    try {
      await ApiService.addPoints(gameState.score);
    } catch (err) {
      console.error('Failed to add points:', err);
    }

    // Mark level as completed on backend only if victorious
    if (isVictory) {
      try {
        await ApiService.markLevelComplete(12);
      } catch (err) {
        console.error('Failed to mark level 12 as completed:', err);
      }
    }

    // Set completion type and message - we'll keep the message simple since we'll format it in the modal
    if (isVictory) {
      setCompletionType('success');
      setCompletionMessage('🌟 Victory! Orangutan saved!\n\nHelp orangutans: Avoid unsustainable palm oil!');
    } else if (gameState.hearts <= 0) {
      setCompletionType('failure');
      setCompletionMessage('💔 No hearts left! Try again!');
    } else if (gameState.timeLeft <= 0) {
      setCompletionType('failure');
      setCompletionMessage('⏰ Time\'s up! Try again to reach your targets!');
    } else {
      setCompletionType('failure');
      setCompletionMessage('💪 Keep trying! Slash more fruits and debris!');
    }

    // Show modal with animation
    setShowCompletionModal(true);
    Animated.sequence([
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(modalAnimation, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(modalAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
  }, [gameState, cleanupTimers, navigation, modalAnimation]);

  // Modified startGame function to show mission modal first
  const startGame = useCallback(() => {
    setShowMissionModal(true);
  }, []);
  
  // Function to actually start the game after modal is closed
  const startGameAfterModal = useCallback(() => {
    setShowMissionModal(false);
    initializeGame();
    setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false }));
  }, [initializeGame]);

  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <LinearGradient colors={["#2b5876", "#4e4376"]} style={styles.container}>
      {/* Header - Styled like Level9-10 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.exitButtonText}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍌 LEVEL 12: FRUIT SLASH</Text>
        <Text style={styles.scoreText}>Score: {gameState.score}</Text>
      </View>

      {/* Game Layout */}
      <View style={styles.gameLayout}>
        {/* Left Panel - Stats and Controls */}
        <View style={styles.leftPanel}>
          <View style={styles.statsBox}>
            <Text style={styles.statText}>Time: {gameState.timeLeft}s</Text>
            <Text style={styles.statText}>Fruits: {gameState.fruitsSlashedCount}/8</Text>
            <Text style={styles.statText}>Debris: {gameState.debrisSlashedCount}/8</Text>
            <View style={styles.heartsContainer}>
              <Text style={styles.heartsText}>Hearts: </Text>
              <Text style={styles.heartsSymbols}>
                {Array(gameState.hearts).fill('❤️').join(' ')}
                {Array(3 - gameState.hearts).fill('🖤').join(' ')}
              </Text>
            </View>
            {gameState.comboCount > 0 && (
              <Text style={styles.comboText}>COMBO x{gameState.comboCount}!</Text>
            )}
          </View>
          
          {/* Reset button remains in left panel */}
          <View style={styles.controlsContainer}>
            {gameState.gameStarted && (
              <TouchableOpacity style={[styles.pixelBtn, styles.resetBtn]} onPress={resetGame}>
                <Text style={styles.pixelBtnText}>RESET</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Game Area */}
        <View style={styles.gameArea} {...panResponder.panHandlers}>
          {/* Game Background */}
          <View style={styles.gameBackground} />
          
          {/* Start button in center of game area */}
          {!gameState.gameStarted && !gameState.gameOver && (
            <View style={styles.centerStartButtonContainer}>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Text style={styles.startButtonText}>START SLASHING</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {showDebug && gameState.gameStarted && (
            <Text style={styles.debugText}>
              Active Fruits: {gameState.fruits.filter((f) => f.active && !f.slashed).length}
            </Text>
          )}
          
          {/* Fruits */}
          {gameState.fruits.map((fruit) => (
            <Animated.View
              key={fruit.id}
              style={[
                styles.fruit,
                {
                  left: fruit.x,
                  top: fruit.y,
                  width: fruit.size,
                  height: fruit.size,
                  opacity: fruit.slashed ? 0.3 : 1,
                  transform: fruit.slashed ? [{ scale: 1.3 }] : [{ scale: 1 }],
                },
              ]}
            >
              <Text style={styles.emoji}>🍌</Text>
            </Animated.View>
          ))}
          
          {/* Debris */}
          {gameState.debris.map((item) => (
            <Animated.View
              key={item.id}
              style={[
                styles.debris,
                {
                  left: item.x,
                  top: item.y,
                  width: item.size,
                  height: item.size,
                  opacity: item.slashed ? 0.3 : 1,
                  transform: item.slashed ? [{ scale: 1.3 }] : [{ scale: 1 }],
                },
              ]}
            >
              <Text style={styles.emoji}>
                {item.type === 'plastic' ? '🗑️' : '🪓'}
              </Text>
            </Animated.View>
          ))}
          
          {/* Palm Oil Hazards */}
          {gameState.palmOilHazards.map((hazard) => (
            <Animated.View
              key={hazard.id}
              style={[
                styles.palmOilHazard,
                {
                  left: hazard.x,
                  top: hazard.y,
                  width: hazard.size,
                  height: hazard.size,
                  opacity: hazard.slashed ? 0.3 : 1,
                },
              ]}
            >
              <Text style={styles.emoji}>🛢️</Text>
            </Animated.View>
          ))}
          
          {/* Slash Trail */}
          {gameState.slashTrail.map((point) => (
            <View
              key={point.id}
              style={[
                styles.slashTrail,
                {
                  left: point.x - normalize(5),
                  top: point.y - normalize(5),
                  opacity: Math.max(0.1, 1 - (Date.now() - point.timestamp) / 500),
                },
              ]}
            />
          ))}
          
          {/* Orangutan */}
          <View
            style={[
              styles.orangutan,
              {
                right: normalize(10),
                bottom: normalize(10),
                width: normalize(80), // Increased from 50 to 80
                height: normalize(80), // Increased from 50 to 80
              },
            ]}
          >
            <Text style={styles.goalEmoji}>🦧</Text>
          </View>
        </View>
      </View>
      
      {/* Mission Instructions Modal */}
      <Modal
        visible={showMissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.missionModal}>
            <Text style={styles.missionTitle}>MISSION: SAVE THE ORANGUTAN!</Text>
            
            <View style={styles.missionContent}>
              <Text style={styles.missionText}>👆 SWIPE TO SLASH FRUITS (8 NEEDED)</Text>
              <Text style={styles.missionText}>🗑️ CLEAR DEBRIS (8 NEEDED)</Text>
              <Text style={styles.missionText}>❤️ YOU HAVE 3 HEARTS</Text>
              <Text style={styles.missionText}>⏰ COMPLETE BEFORE TIME RUNS OUT!</Text>
              <Text style={styles.missionText}>🦧 SAVE ORANGUTAN HABITATS!</Text>
              <Text style={styles.missionWarning}>AVOID PALM OIL HAZARDS! 🛢️</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.readyButton} 
              onPress={startGameAfterModal}
            >
              <Text style={styles.readyButtonText}>I'M READY!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* 8-Bit Style Completion Modal */}
      <Modal
        transparent={true}
        visible={showCompletionModal}
        animationType="none"
        onRequestClose={() => setShowCompletionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  { scale: modalAnimation }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={completionType === 'success' ? ['#76C893', '#52B69A'] : ['#E63946', '#D00000']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderText}>
                {completionType === 'success' ? '★ VICTORY! ★' : '× GAME OVER ×'}
              </Text>
            </LinearGradient>
            
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.modalBody}>
                {/* Game Stats Display */}
                <View style={styles.statsDisplay}>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Final Score:</Text>
                    <Text style={styles.statValue}>{gameState.score}</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Fruits Slashed:</Text>
                    <Text style={[
                      styles.statValue, 
                      gameState.fruitsSlashedCount >= 8 ? styles.statComplete : styles.statIncomplete
                    ]}>
                      {gameState.fruitsSlashedCount}/8 🍌
                    </Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Debris Cleared:</Text>
                    <Text style={[
                      styles.statValue,
                      gameState.debrisSlashedCount >= 8 ? styles.statComplete : styles.statIncomplete
                    ]}>
                      {gameState.debrisSlashedCount}/8 🗑️
                    </Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Time Left:</Text>
                    <Text style={styles.statValue}>{gameState.timeLeft}s ⏰</Text>
                  </View>
                  
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Hearts:</Text>
                    <Text style={styles.statValue}>
                      {Array(gameState.hearts).fill('❤️').join(' ')}
                      {Array(3 - gameState.hearts).fill('🖤').join(' ')}
                    </Text>
                  </View>
                </View>

                {/* Result Message */}
                <Text style={styles.modalMessage}>{completionMessage}</Text>
                
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setShowCompletionModal(false);
                      startGameAfterModal();
                    }}
                  >
                    <LinearGradient
                      colors={['#FFB703', '#FB8500']}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={styles.modalButtonText}>PLAY AGAIN</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modalButton}
                    onPress={() => {
                      setShowCompletionModal(false);
                      navigation.goBack();
                    }}
                  >
                    <LinearGradient
                      colors={['#3A86FF', '#0466C8']}
                      style={styles.modalButtonGradient}
                    >
                      <Text style={styles.modalButtonText}>MAIN MENU</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.15)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontFamily: 'monospace',
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  exitButton: {
    position: 'absolute',
    left: 15,
    paddingVertical: 6,
    paddingHorizontal: 18,
    backgroundColor: '#E63946',
    borderRadius: 0, // 8-bit style
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  exitButtonText: {
    color: '#FFF',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scoreText: {
    position: 'absolute',
    right: 15,
    fontFamily: 'monospace',
    color: '#FFB703',
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0, // 8-bit style
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  gameLayout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  leftPanel: {
    width: 220,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRightWidth: 4,
    borderRightColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsBox: {
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 10,
    width: '100%',
    marginBottom: 10,
  },
  statText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 5,
  },
  comboText: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    padding: 5,
    backgroundColor: '#8B0000',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  instructions: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 10,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: 5,
    textAlign: 'left',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  pixelBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 4,
    borderColor: '#333',
    borderBottomWidth: 8,
    borderRightWidth: 8,
    width: '100%',
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: '#E63946',
  },
  pixelBtnText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    borderLeftWidth: 0,
    overflow: 'hidden',
    backgroundColor: '#87CEEB',
  },
  centerStartButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  startButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 4,
    borderColor: '#333',
    borderBottomWidth: 8,
    borderRightWidth: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 24,
    fontFamily: 'monospace',
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gameBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#228B22',
    borderWidth: 4,
    borderColor: '#8B4513',
  },
  fruit: {
    position: 'absolute',
    backgroundColor: 'transparent', // Changed from '#FFFF00' to transparent
    borderRadius: 0, // 8-bit style
    borderWidth: 0, // Removed border
    borderColor: 'transparent', // Made border invisible
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  debris: {
    position: 'absolute',
    backgroundColor: 'transparent', // Changed from '#8B4513' to transparent
    borderRadius: 0, // 8-bit style
    borderWidth: 0, // Removed border
    borderColor: 'transparent', // Made border invisible
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  palmOilHazard: {
    position: 'absolute',
    backgroundColor: 'transparent', // Changed from '#FF4500' to transparent
    borderRadius: 0, // 8-bit style
    borderWidth: 0, // Removed border
    borderColor: 'transparent', // Made border invisible
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  orangutan: {
    position: 'absolute',
    backgroundColor: 'transparent', // Changed from '#FFA500' to transparent
    borderRadius: 0, // 8-bit style
    borderWidth: 0, // Removed border
    borderColor: 'transparent', // Made border invisible
    justifyContent: 'center',
    alignItems: 'center',
  },
  slashTrail: {
    position: 'absolute',
    width: normalize(8),
    height: normalize(8),
    backgroundColor: '#FFF',
    borderRadius: 0, // 8-bit style
    zIndex: 2,
  },
  emoji: {
    fontSize: normalize(24), // Increased from 16 to 24
    textAlign: 'center',
  },
  goalEmoji: {
    fontSize: normalize(50), // Increased from 20 to 50
    textAlign: 'center',
  },
  debugText: {
    position: 'absolute',
    top: normalize(10),
    left: normalize(10),
    color: '#FFF',
    fontSize: normalize(12),
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: normalize(5),
    zIndex: 10,
  },
  // New modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missionModal: {
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#FFD700',
    padding: 20,
    width: '80%',
    maxWidth: 500,
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  missionContent: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderWidth: 2,
    borderColor: '#444',
    marginBottom: 20,
  },
  missionText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'left',
  },
  missionWarning: {
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FF4500',
    marginTop: 10,
    textAlign: 'center',
  },
  readyButton: {
    backgroundColor: '#2E8B57',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderWidth: 4,
    borderColor: '#333',
    borderBottomWidth: 8,
    borderRightWidth: 8,
  },
  readyButtonText: {
    fontSize: 20,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
  },
  // New modal styles
  modalContent: {
    width: '80%',
    maxWidth: 400,
    maxHeight: '80%', // Limit modal height to prevent it from taking the full screen
    backgroundColor: '#2A2B2A',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 0, // 8-bit style square corners
    overflow: 'hidden',
  },
  modalScrollView: {
    flexGrow: 0, // Don't let the ScrollView take more space than needed
  },
  modalScrollContent: {
    flexGrow: 1, // Allow content to expand within the ScrollView
  },
  modalHeader: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  modalHeaderText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    fontSize: 22,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0, // Sharp shadow for 8-bit look
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1A3C40',
  },
  modalMessage: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.5)',
    width: '100%',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    width: '45%',
    height: 50,
    borderRadius: 0, // 8-bit style
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFD700',
    marginHorizontal: 5,
  },
  modalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  modalButtonText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0, // Sharp shadow for 8-bit look
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  heartsText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  heartsSymbols: {
    fontSize: 14,
    marginLeft: 5,
  },
  // Enhanced modal styles
  statsDisplay: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 2,
    borderColor: '#FFD700',
    padding: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statLabel: {
    fontFamily: 'monospace',
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statValue: {
    fontFamily: 'monospace',
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statComplete: {
    color: '#76C893',
    textShadowColor: '#52B69A',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  statIncomplete: {
    color: '#FFB703',
  },
});

export default Level12Screen;