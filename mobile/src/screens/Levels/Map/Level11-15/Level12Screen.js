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
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Get window dimensions and adjust for landscape
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
  });

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
              vy: normalize(-12 - Math.random() * 4),
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
              vy: normalize(-10 - Math.random() * 3),
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
              vy: normalize(-8 - Math.random() * 2),
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

  // Update score with combo multiplier
  useEffect(() => {
    const fruitsSlashed = gameState.fruits.filter((f) => f.slashed).length;
    const debrisSlashed = gameState.debris.filter((d) => d.slashed).length;
    const comboMultiplier = gameState.comboCount > 1 ? 1 + gameState.comboCount * 0.2 : 1;
    const newScore = Math.round(
      (fruitsSlashed * 10 + debrisSlashed * 15) * comboMultiplier
    );
    setGameState((prev) => ({ ...prev, score: newScore }));

    if (newScore >= 150 && gameState.gameStarted && !gameState.gameOver) {
      endGame();
    }
  }, [
    gameState.fruits,
    gameState.debris,
    gameState.comboCount,
    gameState.gameStarted,
    gameState.gameOver,
  ]);

  const handleSlash = useCallback(
    (gestureX, gestureY) => {
      if (!gameState.gameStarted || gameState.gameOver) return;

      let combo = 0;

      setGameState((prev) => {
        // Check fruit collisions
        const updatedFruits = prev.fruits.map((fruit) => {
          if (
            !fruit.slashed &&
            fruit.active &&
            checkSlashCollision(gestureX, gestureY, fruit.x, fruit.y, fruit.size)
          ) {
            combo++;
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
            const newHearts = prev.hearts - 1;
            if (newHearts <= 0 && !endGameRef.current) {
              endGame();
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

        return {
          ...prev,
          fruits: updatedFruits,
          debris: updatedDebris,
          palmOilHazards: updatedHazards,
          comboCount: newComboCount,
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

  const endGame = useCallback(() => {
    if (gameState.gameOver || endGameRef.current) return;
    endGameRef.current = true;

    setGameState((prev) => ({ ...prev, gameOver: true, gameStarted: false }));
    cleanupTimers();

    const fruitsSlashed = gameState.fruits.filter((fruit) => fruit.slashed).length;
    const debrisSlashed = gameState.debris.filter((item) => item.slashed).length;

    let message = `Game Over!\nScore: ${gameState.score}\nFruits Slashed: ${fruitsSlashed}\nDebris Cleared: ${debrisSlashed}\nHearts Left: ${gameState.hearts}`;

    if (gameState.score >= 150) {
      message += '\n🌟 Victory! Orangutan saved!\nHelp orangutans: Avoid unsustainable palm oil!';
    } else if (gameState.hearts <= 0) {
      message += '\n💔 No hearts left! Try again!';
    } else if (gameState.timeLeft <= 0) {
      message += '\n⏰ Time\'s up! Try again to reach 150 points!';
    } else {
      message += '\n💪 Keep trying! Slash more fruits and debris!';
    }

    Alert.alert(
      'Level 12 Complete',
      message,
      [
        {
          text: 'Play Again',
          onPress: () => {
            startGame();
          },
        },
        {
          text: 'Main Menu',
          onPress: () => {
            navigation.goBack();
          },
        },
      ],
      { cancelable: false } // Prevent dismissing by tapping outside
    );
  }, [gameState, cleanupTimers, navigation]);

  const startGame = useCallback(() => {
    initializeGame();
    setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false }));
  }, [initializeGame]);

  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.levelTitle}>LEVEL 12: FRUIT SLASH</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Score: {gameState.score}</Text>
        <Text style={styles.statText}>Time: {gameState.timeLeft}s</Text>
        <Text style={styles.statText}>
          Fruits: {gameState.fruits.filter((f) => f.slashed).length}
        </Text>
        <Text style={styles.statText}>
          Clean: {gameState.debris.filter((d) => d.slashed).length}
        </Text>
        {gameState.comboCount > 0 && (
          <Text style={styles.comboText}>COMBO x{gameState.comboCount}!</Text>
        )}
      </View>

      {/* Game Area */}
      <View style={[styles.gameArea]} {...panResponder.panHandlers}>
        <View style={styles.background} />
        {showDebug && gameState.gameStarted && (
          <Text style={styles.debugText}>
            Active Fruits: {gameState.fruits.filter((f) => f.active && !f.slashed).length}
          </Text>
        )}
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
        <View
          style={[
            styles.orangutan,
            {
              right: normalize(10),
              bottom: normalize(10),
              width: normalize(50),
              height: normalize(50),
            },
          ]}
        >
          <Text style={styles.goalEmoji}>🦧</Text>
        </View>
        {!gameState.gameStarted && !gameState.gameOver && (
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>Mission: Save the Orangutan!</Text>
            <Text style={styles.instructionText}>
              👆 Swipe to slash fruits (10 pts each)
            </Text>
            <Text style={styles.instructionText}>
              🗑️ Clear debris by slashing (15 pts each)
            </Text>
            <Text style={styles.instructionText}>
              🎯 Goal: Reach 150 points in 120 seconds!
            </Text>
            <Text style={styles.instructionText}>
              🦧 Help save orangutan habitats!
            </Text>
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {!gameState.gameStarted ? (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>START SLASHING</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
            <Text style={styles.buttonText}>RESET</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: normalize(15),
    paddingTop: normalize(40),
    paddingBottom: normalize(10),
    backgroundColor: '#8B4513',
  },
  backButton: {
    padding: normalize(8),
    borderWidth: normalize(2),
    borderColor: '#FFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: normalize(60),
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: normalize(10),
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  levelTitle: {
    color: '#FFF',
    fontSize: normalize(12),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: normalize(60),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(5),
    backgroundColor: '#228B22',
  },
  statText: {
    color: '#FFF',
    fontSize: normalize(8),
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  comboText: {
    color: '#FFD700',
    fontSize: normalize(10),
    fontFamily: 'monospace',
    fontWeight: 'bold',
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
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    margin: normalize(5),
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: normalize(2),
    borderColor: '#FFF',
    backgroundColor: '#87CEEB',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#228B22',
  },
  fruit: {
    position: 'absolute',
    backgroundColor: '#FFFF00',
    borderRadius: normalize(20),
    borderWidth: normalize(2),
    borderColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  debris: {
    position: 'absolute',
    backgroundColor: '#8B4513',
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#654321',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  palmOilHazard: {
    position: 'absolute',
    backgroundColor: '#FF4500',
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  orangutan: {
    position: 'absolute',
    backgroundColor: '#FFA500',
    borderRadius: normalize(25),
    borderWidth: normalize(2),
    borderColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slashTrail: {
    position: 'absolute',
    width: normalize(8),
    height: normalize(8),
    backgroundColor: '#FFF',
    borderRadius: normalize(4),
    zIndex: 2,
  },
  emoji: {
    fontSize: normalize(16),
    textAlign: 'center',
  },
  goalEmoji: {
    fontSize: normalize(20),
    textAlign: 'center',
  },
  instructions: {
    position: 'absolute',
    top: '20%',
    left: normalize(10),
    right: normalize(10),
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: normalize(10),
    borderWidth: normalize(2),
    borderColor: '#FFF',
    borderRadius: normalize(5),
  },
  instructionTitle: {
    fontSize: normalize(20),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: normalize(5),
    textAlign: 'center',
  },
  instructionText: {
    fontSize: normalize(15),
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: normalize(2),
    textAlign: 'center',
  },
  controlsContainer: {
    padding: normalize(10),
    backgroundColor: '#333',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#0F0',
    paddingHorizontal: normalize(25),
    paddingVertical: normalize(12),
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#FFF',
  },
  resetButton: {
    backgroundColor: '#F00',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(12),
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#FFF',
  },
  buttonText: {
    color: '#FFF',
    fontSize: normalize(11),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Level12Screen;