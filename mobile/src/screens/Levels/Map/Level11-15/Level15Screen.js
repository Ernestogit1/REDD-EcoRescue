import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  PanResponder,
  BackHandler,
  Modal,
  Animated,
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';
import { LinearGradient } from 'expo-linear-gradient';

// Get window dimensions
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const scale = Math.min(width, height) / 720;

// Normalize sizes for different screen resolutions
const normalize = (size) => Math.round(size * scale * pixelRatio) / pixelRatio;

// Grid setup for 8-bit frog game
const GRID_WIDTH = 10;
const GRID_HEIGHT = 6;
const GAME_AREA_MARGIN = normalize(10);
const HEADER_HEIGHT = normalize(60);
const STATS_HEIGHT = normalize(30);
const CONTROLS_HEIGHT = normalize(120);
const MAX_CELL_SIZE = normalize(60);
const CELL_SIZE = Math.min(
  Math.floor((Math.min(width - 2 * GAME_AREA_MARGIN, height - HEADER_HEIGHT - STATS_HEIGHT - CONTROLS_HEIGHT - 2 * GAME_AREA_MARGIN) / GRID_WIDTH)),
  MAX_CELL_SIZE
);
const GRID_PIXEL_WIDTH = CELL_SIZE * GRID_WIDTH;
const GRID_PIXEL_HEIGHT = CELL_SIZE * GRID_HEIGHT;
// Directions for swipe and D-pad navigation
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const Level15Screen = () => {
  const navigation = useNavigation();
  // Generate initial lily pads
  const generateLilyPads = useCallback(() => {
    return Array.from({ length: GRID_HEIGHT }, (_, y) =>
      Array.from({ length: GRID_WIDTH }, (_, x) => ({
        x,
        y,
        isSafeZone: y === 0,
        sinking: false,
        id: `${x}-${y}`,
      }))
    ).flat();
  }, []);

  const [gameState, setGameState] = useState({
    frog: { x: 5, y: GRID_HEIGHT - 1 },
    lilyPads: generateLilyPads(),
    hazards: [],
    score: 0,
    gameStarted: false,
    gameOver: false,
    showInstructions: true,
  });

  // Refs for timers and game state
  const gameLoopRef = useRef(null);
  const endGameRef = useRef(false);
  const lastSwipeTimeRef = useRef(0);
  const sinkTimersRef = useRef(new Map());
  const showDebug = process.env.NODE_ENV === 'development';
  const [showEndModal, setShowEndModal] = useState(false);
  const [endModalType, setEndModalType] = useState('success');
  const [endModalMessage, setEndModalMessage] = useState('');
  const [endModalAnim] = useState(new Animated.Value(0));

  // Generate random position for hazards
  const getRandomPosition = useCallback(() => ({
    x: Math.floor(Math.random() * GRID_WIDTH),
    y: 0,
    id: Date.now() + Math.random(),
  }), []);

  // Check if position is occupied by frog or hazards
  const isPositionOccupied = useCallback(
    (pos, hazards, frogPos) =>
      (pos.x === frogPos.x && pos.y === frogPos.y) ||
      hazards.some((hazard) => hazard.x === pos.x && hazard.y === pos.y),
    []
  );

  // Clear all sink timers
  const clearAllSinkTimers = useCallback(() => {
    sinkTimersRef.current.forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    sinkTimersRef.current.clear();
  }, []);

  // End game function (moved before useEffect)
  const endGame = useCallback(async (finalScore) => {
    if (gameState.gameOver || endGameRef.current) return;
    endGameRef.current = true;

    setGameState((prev) => {
      if (showDebug) console.log(`Game ended, final score: ${finalScore}`);
      return { ...prev, gameOver: true, gameStarted: false, showInstructions: false };
    });

    // Add points to backend
    ApiService.addPoints(finalScore).catch((err) => {
      console.error('Failed to add points:', err);
    });

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    clearAllSinkTimers();

    // Mark level as completed on backend
    try {
      await ApiService.markLevelComplete(15);
    } catch (err) {
      console.error('Failed to mark level 15 as completed:', err);
    }

    const funFacts = [
      "Frogs absorb water through their skin, making them sensitive to pollution",
      "Plastic pollution threatens amphibian habitats worldwide",
      "Some frog species can jump up to 20 times their body length",
    ];
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

    let message = `Score: ${finalScore}\nFun Fact: ${randomFact}`;
    if (gameState.frog.y === 0) {
      setEndModalType('success');
      setEndModalMessage('★ VICTORY! ★\nFrog reached the safe zone!\n' + message + '\nProtect ponds: Reduce plastic pollution!');
    } else {
      setEndModalType('failure');
      setEndModalMessage('× TRY AGAIN ×\n' + message + '\nTry again to reach the safe zone!\nProtect ponds: Reduce plastic pollution!');
    }
    setShowEndModal(true);
    Animated.sequence([
      Animated.timing(endModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(endModalAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(endModalAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  }, [gameState.frog, gameState.gameOver, clearAllSinkTimers, navigation]);

  // Initialize game
  const initializeGame = useCallback(() => {
    endGameRef.current = false;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    clearAllSinkTimers();

    setGameState({
      frog: { x: 5, y: GRID_HEIGHT - 1 },
      lilyPads: generateLilyPads(),
      hazards: [],
      score: 0,
      gameStarted: false,
      gameOver: false,
      showInstructions: true,
    });
    if (showDebug) console.log('Game initialized, score reset to 0');
  }, [generateLilyPads, clearAllSinkTimers]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    const subscription = Dimensions.addEventListener('change', initializeGame);
    return () => {
      subscription?.remove();
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      clearAllSinkTimers();
    };
  }, [initializeGame, clearAllSinkTimers]);

  // Game loop for hazard movement
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      gameLoopRef.current = setInterval(() => {
        setGameState((prev) => {
          // Move hazards down
          const newHazards = prev.hazards
            .map((hazard) => ({ ...hazard, y: hazard.y + 1 }))
            .filter((hazard) => hazard.y < GRID_HEIGHT);

          // Spawn new hazard
          if (Math.random() < 0.15 && newHazards.length < 3) {
            let newHazard = getRandomPosition();
            let attempts = 0;
            while (isPositionOccupied(newHazard, newHazards, prev.frog) && attempts < 10) {
              newHazard = getRandomPosition();
              attempts++;
            }
            if (attempts < 10) {
              newHazards.push(newHazard);
            }
          }

          // Check hazard collision
          const currentPad = prev.lilyPads.find(
            (pad) => pad.x === prev.frog.x && pad.y === prev.frog.y
          );
          const isVulnerable = currentPad && (currentPad.sinking || !currentPad.isSafeZone);
          if (
            isVulnerable &&
            newHazards.some((hazard) => hazard.x === prev.frog.x && hazard.y === prev.frog.y)
          ) {
            endGame(prev.score);
            return prev;
          }

          // Check win condition
          if (prev.frog.y === 0) {
            const finalScore = prev.score + 100;
            endGame(finalScore);
            return { ...prev, score: finalScore };
          }

          return { ...prev, hazards: newHazards };
        });
      }, 300); // Faster hazards for difficulty
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState.gameStarted, gameState.gameOver, getRandomPosition, isPositionOccupied, endGame]);

  // Move frog to a lily pad
  const moveFrog = useCallback(
    (x, y) => {
      if (!gameState.gameStarted || gameState.gameOver) return;
      const manhattanDistance = Math.abs(x - gameState.frog.x) + Math.abs(y - gameState.frog.y);
      if (manhattanDistance > 2 || x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;

      setGameState((prev) => {
        const newScore = prev.score + 10;
        const padId = `${x}-${y}`;

        const newLilyPads = prev.lilyPads.map((pad) => {
          if (pad.x === x && pad.y === y && !pad.isSafeZone) {
            // Clear existing timer for this pad
            if (sinkTimersRef.current.has(padId)) {
              clearTimeout(sinkTimersRef.current.get(padId));
            }

            // Start sinking timer
            const sinkTimer = setTimeout(() => {
              setGameState((p) => ({
                ...p,
                lilyPads: p.lilyPads.map((p) => (p.id === padId ? { ...p, sinking: false } : p)),
              }));
              sinkTimersRef.current.delete(padId);
            }, 2000);

            sinkTimersRef.current.set(padId, sinkTimer);
            return { ...pad, sinking: true };
          }
          return pad;
        });

        if (showDebug) console.log(`Frog jumped to (${x}, ${y}), new score: ${newScore}`);
        return { ...prev, frog: { x, y }, score: newScore, lilyPads: newLilyPads };
      });
    },
    [gameState.gameStarted, gameState.gameOver]
  );

  // Move frog with D-pad
  const moveFrogDpad = useCallback(
    (direction) => {
      if (!gameState.gameStarted || gameState.gameOver) return;
      setGameState((prev) => {
        const newX = Math.max(0, Math.min(GRID_WIDTH - 1, prev.frog.x + direction.x));
        const newY = Math.max(0, Math.min(GRID_HEIGHT - 1, prev.frog.y + direction.y));
        if (newX === prev.frog.x && newY === prev.frog.y) return prev;

        const newScore = prev.score + 10;
        const padId = `${newX}-${newY}`;

        const newLilyPads = prev.lilyPads.map((pad) => {
          if (pad.x === newX && pad.y === newY && !pad.isSafeZone) {
            if (sinkTimersRef.current.has(padId)) {
              clearTimeout(sinkTimersRef.current.get(padId));
            }

            const sinkTimer = setTimeout(() => {
              setGameState((p) => ({
                ...p,
                lilyPads: p.lilyPads.map((p) => (p.id === padId ? { ...p, sinking: false } : p)),
              }));
              sinkTimersRef.current.delete(padId);
            }, 2000);

            sinkTimersRef.current.set(padId, sinkTimer);
            return { ...pad, sinking: true };
          }
          return pad;
        });

        if (showDebug) console.log(`Frog moved to (${newX}, ${newY}) via D-pad, new score: ${newScore}`);
        return { ...prev, frog: { x: newX, y: newY }, score: newScore, lilyPads: newLilyPads };
      });
    },
    [gameState.gameStarted, gameState.gameOver]
  );

  // Swipe controls
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onMoveShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onPanResponderMove: (evt, gestureState) => {
          const now = Date.now();
          if (now - lastSwipeTimeRef.current < 300) return;
          lastSwipeTimeRef.current = now;

          const { dx, dy } = gestureState;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) moveFrogDpad(DIRECTIONS.RIGHT);
            else if (dx < -50) moveFrogDpad(DIRECTIONS.LEFT);
          } else {
            if (dy > 50) moveFrogDpad(DIRECTIONS.DOWN);
            else if (dy < -50) moveFrogDpad(DIRECTIONS.UP);
          }
        },
      }),
    [gameState.gameStarted, gameState.gameOver, moveFrogDpad]
  );

  // Start game
  const startGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false, showInstructions: false }));
  }, []);

  return (
    <View style={styles.container}>
      {/* 8-bit Header */}
      <View style={styles.header8bit}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton8bit}>
          <Text style={styles.exitButtonText8bit}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle8bit}>LEVEL 15: FROG LEAP</Text>
        <Text style={styles.scoreText8bit}>Score: {gameState.score}</Text>
      </View>
      {/* Instructions or Game Area */}
      {gameState.showInstructions ? (
        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>LEVEL 15: FROG LEAP</Text>
            <Text style={styles.instructionsText}>Guide 🐸 to the top (🏞️) and avoid 🛍️ plastics!</Text>
            <Text style={styles.instructionsText}>Tap a 🟢 lily pad (max 2 cells) to jump</Text>
            <Text style={styles.instructionsText}>Use D-pad or swipe to move 1 cell</Text>
            <Text style={styles.instructionsText}>Pads sink for 2s after landing</Text>
            <Text style={styles.instructionsText}>🎯 Safe zone: +100 pts | Jump: +10 pts</Text>
            <Text style={styles.instructionsText}>🌍 EcoRescue: Keep ponds clean!</Text>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <LinearGradient colors={['#FFD700', '#FB8500']} style={styles.startButtonGradient}>
                <Text style={styles.startButtonText}>START JUMPING</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.mainRow8bit}>
          {/* Game Area - bigger */}
          <View style={styles.gameArea8bit} {...panResponder.panHandlers}>
            <View style={styles.background} />
            <View style={styles.gridContainer8bit}>
              {/* Lily Pads and Safe Zone */}
              {gameState.lilyPads.map((pad) => (
                <TouchableOpacity
                  key={pad.id}
                  style={[
                    styles.lilyPad8bit,
                    {
                      left: pad.x * CELL_SIZE * 1.2,
                      top: pad.y * CELL_SIZE * 1.2,
                      width: CELL_SIZE * 1.2,
                      height: CELL_SIZE * 1.2,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    },
                  ]}
                  onPress={() => moveFrog(pad.x, pad.y)}
                >
                  <Text style={styles.padText8bit}>{pad.isSafeZone ? '🏞️' : '🟢'}</Text>
                </TouchableOpacity>
              ))}
              {/* Frog */}
              <View
                style={[
                  styles.frog8bit,
                  {
                    left: gameState.frog.x * CELL_SIZE * 1.2,
                    top: gameState.frog.y * CELL_SIZE * 1.2,
                    width: CELL_SIZE * 1.2,
                    height: CELL_SIZE * 1.2,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                  },
                ]}
              >
                <Text style={styles.frogText8bit}>🐸</Text>
              </View>
              {/* Hazards */}
              {gameState.hazards.map((hazard) => (
                <View
                  key={hazard.id}
                  style={[
                    styles.hazard8bit,
                    {
                      left: hazard.x * CELL_SIZE * 1.2,
                      top: hazard.y * CELL_SIZE * 1.2,
                      width: CELL_SIZE * 1.2,
                      height: CELL_SIZE * 1.2,
                      backgroundColor: 'transparent',
                      borderWidth: 0,
                    },
                  ]}
                >
                  <Text style={styles.hazardText8bit}>🛍️</Text>
                </View>
              ))}
            </View>
            {showDebug && gameState.gameStarted && (
              <Text style={styles.debugText}>
                Frog: ({gameState.frog.x}, {gameState.frog.y}) | Score: {gameState.score}
              </Text>
            )}
          </View>
          {/* D-pad beside the game */}
          {gameState.gameStarted && (
            <View style={styles.dPadColumn8bit}>
              <View style={styles.dPadRow8bit}>
                <TouchableOpacity style={styles.dPadButton8bit} onPress={() => moveFrogDpad(DIRECTIONS.UP)}>
                  <Text style={styles.dPadText8bit}>▲</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dPadRow8bit}>
                <TouchableOpacity style={styles.dPadButton8bit} onPress={() => moveFrogDpad(DIRECTIONS.LEFT)}>
                  <Text style={styles.dPadText8bit}>◀</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dPadButton8bit} onPress={initializeGame}>
                  <Text style={styles.dPadText8bit}>⟳</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dPadButton8bit} onPress={() => moveFrogDpad(DIRECTIONS.RIGHT)}>
                  <Text style={styles.dPadText8bit}>▶</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dPadRow8bit}>
                <TouchableOpacity style={styles.dPadButton8bit} onPress={() => moveFrogDpad(DIRECTIONS.DOWN)}>
                  <Text style={styles.dPadText8bit}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
      {/* 8-bit Endgame Modal */}
      <Modal
        transparent={true}
        visible={showEndModal}
        animationType="none"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [
                  { scale: endModalAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={endModalType === 'success' ? ['#FFD700', '#FB8500'] : ['#E63946', '#D00000']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalHeaderText}>
                {endModalType === 'success' ? '★ VICTORY! ★' : '× TRY AGAIN ×'}
              </Text>
            </LinearGradient>
            <View style={styles.modalBody}>
              <Text style={styles.modalMessage}>{endModalMessage}</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowEndModal(false);
                  initializeGame();
                  setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false, showInstructions: false }));
                }}
              >
                <LinearGradient
                  colors={['#FFB703', '#FB8500']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>
                    PLAY AGAIN
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { marginTop: 10 }]}
                onPress={() => {
                  setShowEndModal(false);
                  navigation.goBack();
                }}
              >
                <LinearGradient
                  colors={['#FFD700', '#FB8500']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonText}>
                    MAIN MENU
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    paddingTop: normalize(20),
    paddingBottom: normalize(10),
    backgroundColor: '#1E90FF',
    height: HEADER_HEIGHT,
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
    backgroundColor: '#4682B4',
    height: STATS_HEIGHT,
  },
  statText: {
    color: '#FFF',
    fontSize: normalize(8),
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
    margin: GAME_AREA_MARGIN,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: normalize(2),
    borderColor: '#FFF',
    backgroundColor: '#87CEEB',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#4682B4',
  },
  gridContainer: {
    width: GRID_PIXEL_WIDTH,
    height: GRID_PIXEL_HEIGHT,
    position: 'relative',
  },
  lilyPad: {
    position: 'absolute',
    borderWidth: normalize(2),
    borderColor: '#006400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  padText: {
    fontSize: normalize(20),
    textAlign: 'center',
  },
  frog: {
    position: 'absolute',
    backgroundColor: '#008000',
    borderWidth: normalize(2),
    borderColor: '#006400',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  frogText: {
    fontSize: normalize(20),
    textAlign: 'center',
  },
  hazard: {
    position: 'absolute',
    backgroundColor: '#FF4500',
    borderWidth: normalize(2),
    borderColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  hazardText: {
    fontSize: normalize(20),
    textAlign: 'center',
  },
  instructionsContainer: {
    flex: 1,
    margin: GAME_AREA_MARGIN,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: normalize(15),
    borderWidth: normalize(2),
    borderColor: '#FFF',
    borderRadius: normalize(5),
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: normalize(10),
    textAlign: 'center',
  },
  instructionText: {
    fontSize: normalize(15),
    fontFamily: 'monospace',
    color: '#FFF',
    marginBottom: normalize(5),
    textAlign: 'center',
  },
  controlsContainer: {
    padding: normalize(5),
    backgroundColor: '#333',
    height: CONTROLS_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  dPadContainer: {
    width: normalize(120),
    height: normalize(120),
    backgroundColor: '#444',
    borderWidth: normalize(2),
    borderColor: '#FFF',
    borderRadius: normalize(5),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: normalize(10),
  },
  dPadButton: {
    backgroundColor: '#555',
    borderWidth: normalize(2),
    borderColor: '#FFF',
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  dPadText: {
    color: '#FFF',
    fontSize: normalize(12),
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 18,
    width: 220,
    borderRadius: 0,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  startButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    color: '#222',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  instructionsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  instructionsBox: {
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 0,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 340,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  instructionsTitle: {
    color: '#FFD700',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  instructionsText: {
    color: '#FFF',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  header8bit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
    backgroundColor: '#222',
    minHeight: 60,
    position: 'relative',
    zIndex: 10,
  },
  exitButton8bit: {
    position: 'absolute',
    left: 15,
    paddingVertical: 6,
    paddingHorizontal: 18,
    backgroundColor: '#FFD700',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  exitButtonText8bit: {
    color: '#222',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: 'bold',
  },
  headerTitle8bit: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  scoreText8bit: {
    position: 'absolute',
    right: 15,
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFB703',
    fontSize: 13,
    zIndex: 2,
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFD700',
    fontWeight: 'bold',
  },
  mainRow8bit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    marginTop: 10,
  },
  gameArea8bit: {
    margin: GAME_AREA_MARGIN,
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFD700',
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    width: GRID_PIXEL_WIDTH * 1.2,
    height: GRID_PIXEL_HEIGHT * 1.2,
    minWidth: 400,
    minHeight: 300,
    maxWidth: 600,
    maxHeight: 500,
  },
  gridContainer8bit: {
    width: GRID_PIXEL_WIDTH * 1.2,
    height: GRID_PIXEL_HEIGHT * 1.2,
    position: 'relative',
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  lilyPad8bit: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  padText8bit: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 22,
    color: '#FFD700',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  frog8bit: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 0,
    backgroundColor: '#222',
  },
  frogText8bit: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 28,
    color: '#39FF14',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  hazard8bit: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 0,
    backgroundColor: '#222',
  },
  hazardText8bit: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 22,
    color: '#E63946',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  dPadColumn8bit: {
    marginLeft: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  dPadRow8bit: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  dPadButton8bit: {
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#FFF',
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  dPadText8bit: {
    color: '#222',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#222',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 0,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  modalHeader: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderText: {
    color: '#222',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  modalBody: {
    width: '100%',
    marginTop: 15,
    alignItems: 'center',
  },
  modalMessage: {
    color: '#FFF',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  modalButton: {
    width: 200,
    borderRadius: 0,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  modalButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#222',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default Level15Screen;