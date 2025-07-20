import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Vibration,
  PanResponder,
  BackHandler,
  Modal,
  Animated,
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';

// Get window dimensions
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const scale = Math.min(width, height) / 620;

// Normalize sizes for different screen resolutions
const normalize = (size) => Math.round(size * scale * pixelRatio) / pixelRatio;

// Grid setup for 8-bit snake game
const GRID_SIZE = 13;
const GAME_AREA_MARGIN = normalize(10);
const HEADER_HEIGHT = normalize(60);
const STATS_HEIGHT = normalize(30);
const CONTROLS_HEIGHT = normalize(120);
const MAX_CELL_SIZE = normalize(60);
const CELL_SIZE = Math.min(
  Math.floor((Math.min(width - 2 * GAME_AREA_MARGIN, height - HEADER_HEIGHT - STATS_HEIGHT - CONTROLS_HEIGHT - 2 * GAME_AREA_MARGIN) / GRID_SIZE)),
  MAX_CELL_SIZE
);
const GRID_PIXEL_WIDTH = CELL_SIZE * GRID_SIZE;
const GRID_PIXEL_HEIGHT = CELL_SIZE * GRID_SIZE;

// Directions for turtle movement
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const Level13Screen = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState({
    turtle: [{ x: 5, y: 5 }],
    direction: DIRECTIONS.RIGHT,
    food: null,
    hazards: [],
    score: 0,
    gameStarted: false,
    gameOver: false,
  });

  // Refs for timers and game state
  const gameLoopRef = useRef(null);
  const endGameRef = useRef(false);
  const lastSwipeTimeRef = useRef(0);

  // Toggle debug info
  const showDebug = process.env.NODE_ENV === 'development';

  // Generate random grid position
  const getRandomPosition = useCallback(() => ({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }), []);

  // Check if position is occupied by turtle
  const isPositionOccupied = (pos, turtle) =>
    turtle.some((segment) => segment.x === pos.x && segment.y === pos.y);

  // Initialize game
  const initializeGame = useCallback(() => {
    endGameRef.current = false;
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    const initialFood = getRandomPosition();
    setGameState({
      turtle: [{ x: 5, y: 5 }],
      direction: DIRECTIONS.RIGHT,
      food: initialFood,
      hazards: [],
      score: 0,
      gameStarted: false,
      gameOver: false,
    });
    if (showDebug) console.log('Game initialized, score reset to 0');
  }, [getRandomPosition]);

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
    };
  }, [initializeGame]);

  // Game loop
  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      gameLoopRef.current = setInterval(() => {
        setGameState((prev) => {
          const newTurtle = [...prev.turtle];
          const head = { ...newTurtle[0] };
          head.x += prev.direction.x;
          head.y += prev.direction.y;

          // Check boundaries and self-collision
          if (
            head.x < 0 ||
            head.x >= GRID_SIZE ||
            head.y < 0 ||
            head.y >= GRID_SIZE ||
            newTurtle.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)
          ) {
            endGame(prev.score, newTurtle);
            return prev;
          }

          newTurtle.unshift(head);

          // Check food collision
          let newScore = prev.score;
          let newFood = prev.food;
          let foodEaten = false;
          if (head.x === prev.food.x && head.y === prev.food.y) {
            Vibration.vibrate(50);
            newScore += 10;
            foodEaten = true;
            newFood = getRandomPosition();
            while (isPositionOccupied(newFood, newTurtle)) {
              newFood = getRandomPosition();
            }
            if (showDebug) console.log(`Food eaten, new score: ${newScore}`);
          } else {
            newTurtle.pop();
          }

          // Check hazard collision
          const newHazards = prev.hazards.filter(
            (hazard) => !(hazard.x === head.x && hazard.y === head.y)
          );
          if (prev.hazards.length !== newHazards.length) {
            endGame(newScore, newTurtle);
            return prev;
          }

          // Spawn hazards
          if (Math.random() < 0.03 && newHazards.length < 3) {
            let newHazard = getRandomPosition();
            while (isPositionOccupied(newHazard, newTurtle) || (newHazard.x === newFood.x && newHazard.y === newFood.y)) {
              newHazard = getRandomPosition();
            }
            newHazards.push(newHazard);
          }

          // Check win condition
          if (newScore >= 100) {
            endGame(newScore, newTurtle);
            return prev;
          }

          return {
            ...prev,
            turtle: newTurtle,
            food: newFood,
            hazards: newHazards,
            score: newScore,
          };
        });
      }, 150);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameState.gameStarted, gameState.gameOver, getRandomPosition]);

  // D-pad direction handler
  const changeDirection = useCallback((newDirection) => {
    setGameState((prev) => {
      if (
        (newDirection === DIRECTIONS.UP && prev.direction === DIRECTIONS.DOWN) ||
        (newDirection === DIRECTIONS.DOWN && prev.direction === DIRECTIONS.UP) ||
        (newDirection === DIRECTIONS.LEFT && prev.direction === DIRECTIONS.RIGHT) ||
        (newDirection === DIRECTIONS.RIGHT && prev.direction === DIRECTIONS.LEFT)
      ) {
        return prev;
      }
      return { ...prev, direction: newDirection };
    });
  }, []);

  // Swipe controls
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onMoveShouldSetPanResponder: () => gameState.gameStarted && !gameState.gameOver,
        onPanResponderMove: (evt, gestureState) => {
          const now = Date.now();
          if (now - lastSwipeTimeRef.current < 100) return;
          lastSwipeTimeRef.current = now;

          const { dx, dy } = gestureState;
          setGameState((prev) => {
            let newDirection = prev.direction;
            if (Math.abs(dx) > Math.abs(dy)) {
              if (dx > 50 && prev.direction !== DIRECTIONS.LEFT) {
                newDirection = DIRECTIONS.RIGHT;
              } else if (dx < -50 && prev.direction !== DIRECTIONS.RIGHT) {
                newDirection = DIRECTIONS.LEFT;
              }
            } else {
              if (dy > 50 && prev.direction !== DIRECTIONS.UP) {
                newDirection = DIRECTIONS.DOWN;
              } else if (dy < -50 && prev.direction !== DIRECTIONS.DOWN) {
                newDirection = DIRECTIONS.UP;
              }
            }
            return { ...prev, direction: newDirection };
          });
        },
      }),
    [gameState.gameStarted, gameState.gameOver]
  );

  // End game function with parameters for score and turtle
  const endGame = async (finalScore, finalTurtle) => {
    if (gameState.gameOver || endGameRef.current) return;
    endGameRef.current = true;

    setGameState((prev) => {
      if (showDebug) console.log(`Game ended, final score: ${finalScore}, turtle length: ${finalTurtle.length}`);
      return { ...prev, gameOver: true, gameStarted: false };
    });
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);

    // Add points to backend
    ApiService.addPoints(finalScore).catch((err) => {
      console.error('Failed to add points:', err);
    });

    // Mark level as completed on backend
    try {
      await ApiService.markLevelComplete(13);
    } catch (err) {
      console.error('Failed to mark level 13 as completed:', err);
    }

    const funFacts = [
      "Sea turtles return to the same beach where they were born to lay eggs",
      "They can hold their breath for hours underwater",
      "Some species can live up to 100 years",
    ];
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

    let message = `Score: ${finalScore}\nTurtle Length: ${finalTurtle.length}\nFun Fact: ${randomFact}`;

    if (finalScore >= 100) {
      setEndModalType('success');
      setEndModalMessage('★ VICTORY! ★\nSea turtle grew strong!\n' + message + '\nProtect oceans: Reduce plastic pollution!');
    } else {
      setEndModalType('failure');
      setEndModalMessage('× TRY AGAIN ×\n' + message + '\nTry again to reach 100 points!\nProtect oceans: Reduce plastic pollution!');
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
  };

  const startGame = useCallback(() => {
    initializeGame();
    setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false }));
  }, [initializeGame]);

  const [endModalAnim] = useState(new Animated.Value(0));
  const [showInstructions, setShowInstructions] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endModalType, setEndModalType] = useState('success');
  const [endModalMessage, setEndModalMessage] = useState('');

  const [fontsLoaded] = useFonts({
    PressStart2P_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 8-bit Header */}
      <View style={styles.header8bit}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton8bit}>
          <Text style={styles.exitButtonText8bit}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle8bit}>LEVEL 13: SEA TURTLE TREK</Text>
        <View style={styles.statsBox8bit}>
          <Text style={styles.statsText8bit}>Score: {gameState.score}</Text>
          <Text style={styles.statsText8bit}>Length: {gameState.turtle.length}</Text>
        </View>
      </View>
      {/* 8-bit Instructions Modal */}
      {showInstructions && !gameState.gameStarted && !gameState.gameOver && (
        <View style={styles.instructionsOverlay}>
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>LEVEL 13: SEA TURTLE TREK</Text>
            <Text style={styles.instructionsText}>Grow the 🐢 by eating 🍤 and avoid 🛍️ plastics!</Text>
            <Text style={styles.instructionsText}>Swipe or use D-pad to move</Text>
            <Text style={styles.instructionsText}>Eat food: +10 pts, Grow longer</Text>
            <Text style={styles.instructionsText}>🎯 Goal: Reach 100 points!</Text>
            <Text style={styles.instructionsText}>🌊 Protect oceans: Reduce plastic!</Text>
            <TouchableOpacity style={styles.startButton} onPress={() => { setShowInstructions(false); setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false })); }}>
              <LinearGradient colors={['#FFD700', '#FB8500']} style={styles.startButtonGradient}>
                <Text style={styles.startButtonText}>START SWIMMING</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Game Area - bigger */}
      <View style={styles.mainRow8bit}>
        <View style={styles.gameArea8bit} {...panResponder.panHandlers}>
          <View style={styles.background} />
          {showDebug && gameState.gameStarted && (
            <Text style={styles.debugText}>
              Turtle Head: ({gameState.turtle[0].x}, {gameState.turtle[0].y}) | Score: {gameState.score}
            </Text>
          )}
          {/* Turtle */}
          {gameState.turtle.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.turtle,
                {
                  left: segment.x * CELL_SIZE * 1.2,
                  top: segment.y * CELL_SIZE * 1.2,
                  width: CELL_SIZE * 1.2,
                  height: CELL_SIZE * 1.2,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                },
              ]}
            >
              <Text style={styles.turtleEmoji}>{index === 0 ? '🐢' : '🟢'}</Text>
            </View>
          ))}
          {/* Food */}
          {gameState.food && (
            <View
              style={[
                styles.food,
                {
                  left: gameState.food.x * CELL_SIZE * 1.2,
                  top: gameState.food.y * CELL_SIZE * 1.2,
                  width: CELL_SIZE * 1.2,
                  height: CELL_SIZE * 1.2,
                  backgroundColor: 'transparent',
                  borderWidth: 0,
                },
              ]}
            >
              <Text style={styles.foodEmoji}>🍤</Text>
            </View>
          )}
          {/* Hazards */}
          {gameState.hazards.map((hazard, index) => (
            <View
              key={index}
              style={[
                styles.hazard,
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
              <Text style={styles.emoji}>🛍️</Text>
            </View>
          ))}
        </View>
        {/* D-pad beside the game, bigger and 8-bit styled */}
        {gameState.gameStarted && (
          <View style={styles.dPadColumn8bit}>
            <View style={styles.dPadRow8bit}>
              <TouchableOpacity style={styles.dPadButton8bit} onPress={() => changeDirection(DIRECTIONS.UP)}>
                <Text style={styles.dPadText8bit}>▲</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dPadRow8bit}>
              <TouchableOpacity style={styles.dPadButton8bit} onPress={() => changeDirection(DIRECTIONS.LEFT)}>
                <Text style={styles.dPadText8bit}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dPadButton8bit} onPress={initializeGame}>
                <Text style={styles.dPadText8bit}>⟳</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dPadButton8bit} onPress={() => changeDirection(DIRECTIONS.RIGHT)}>
                <Text style={styles.dPadText8bit}>▶</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dPadRow8bit}>
              <TouchableOpacity style={styles.dPadButton8bit} onPress={() => changeDirection(DIRECTIONS.DOWN)}>
                <Text style={styles.dPadText8bit}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
                  setShowInstructions(true);
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
    paddingTop: normalize(40),
    paddingBottom: normalize(10),
    backgroundColor: '#1E90FF',
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
    backgroundColor: '#4682B4',
  },
  turtle: {
    position: 'absolute',
    backgroundColor: '#008000',
    borderWidth: normalize(2),
    borderColor: '#006400',
    justifyContent: 'center',
    alignItems: 'center',
  },
  turtleEmoji: {
    fontSize: normalize(20),
    textAlign: 'center',
  },
  food: {
    position: 'absolute',
    backgroundColor: '#FFFF00',
    borderWidth: normalize(2),
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodEmoji: {
    fontSize: normalize(24),
    textAlign: 'center',
    lineHeight: normalize(24),
  },
  hazard: {
    position: 'absolute',
    backgroundColor: '#FF4500',
    borderWidth: normalize(2),
    borderColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
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
  dPadContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  dPadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dPadButton: {
    backgroundColor: '#555',
    padding: normalize(10),
    margin: normalize(5),
    borderWidth: normalize(2),
    borderColor: '#FFF',
    width: normalize(50),
    height: normalize(50),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadText: {
    color: '#FFF',
    fontSize: normalize(20),
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  dPadSpacer: {
    width: normalize(50),
    height: normalize(50),
    margin: normalize(5),
  },
  buttonText: {
    color: '#FFF',
    fontSize: normalize(11),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
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
  statsBox8bit: {
    position: 'absolute',
    right: 15,
    flexDirection: 'column',
    alignItems: 'flex-end',
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFD700',
    fontWeight: 'bold',
  },
  statsText8bit: {
    color: '#FFB703',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'right',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
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
    marginVertical: 8,
  },
  dPadButton8bit: {
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#FFF',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 0,
  },
  dPadText8bit: {
    color: '#222',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: '#FFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});

export default Level13Screen;