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
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';

// Get window dimensions
const { width, height } = Dimensions.get('window');
const pixelRatio = PixelRatio.get();
const scale = Math.min(width, height) / 620;

// Normalize sizes for different screen resolutions
const normalize = (size) => Math.round(size * scale * pixelRatio) / pixelRatio;

// Grid setup for 8-bit snake game
const GRID_SIZE = 13;
const CELL_SIZE = Math.floor(Math.min(width, height - 200) / GRID_SIZE);
const GRID_WIDTH = Math.floor(width / CELL_SIZE);
const GRID_HEIGHT = Math.floor((height - 200) / CELL_SIZE);

// Directions for turtle movement
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};
import ApiService from '../../../../services/api.service';

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
    x: Math.floor(Math.random() * GRID_WIDTH),
    y: Math.floor(Math.random() * GRID_HEIGHT),
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
            head.x >= GRID_WIDTH ||
            head.y < 0 ||
            head.y >= GRID_HEIGHT ||
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
      const token = await ApiService.getAuthToken();
      if (token) {
        await fetch('http://192.168.1.19:5000/api/levels/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ levelId: '13' }),
        });
      }
    } catch (err) {
      console.error('Failed to mark level 13 as completed:', err);
    }

    const funFacts = [
      "Sea turtles return to the same beach where they were born to lay eggs",
      "They can hold their breath for hours underwater",
      "Some species can live up to 100 years",
    ];
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

    let message = `Game Over!\nScore: ${finalScore}\nTurtle Length: ${finalTurtle.length}\nFun Fact: ${randomFact}`;

    if (finalScore >= 100) {
      message += '\n🌊 Victory! Sea turtle grew strong!\nProtect oceans: Reduce plastic pollution!';
    } else {
      message += '\n🐢 Oh no! Try again to reach 100 points!\nProtect oceans: Reduce plastic pollution!';
    }

    Alert.alert(
      'Level 13: Sea Turtle Trek',
      message,
      [
        {
          text: 'Play Again',
          onPress: () => {
            initializeGame();
            setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false }));
          },
        },
        {
          text: 'Main Menu',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  };

  const startGame = useCallback(() => {
    initializeGame();
    setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false }));
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
        <Text style={styles.levelTitle}>LEVEL 13: SEA TURTLE TREK</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Score: {gameState.score}</Text>
        <Text style={styles.statText}>Length: {gameState.turtle.length}</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
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
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
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
                left: gameState.food.x * CELL_SIZE,
                top: gameState.food.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
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
                left: hazard.x * CELL_SIZE,
                top: hazard.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              },
            ]}
          >
            <Text style={styles.emoji}>🛍️</Text>
          </View>
        ))}
        {/* Instructions */}
        {!gameState.gameStarted && !gameState.gameOver && (
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>Mission: Grow the Sea Turtle!</Text>
            <Text style={styles.instructionText}>
              👆 Swipe or use D-pad to move the turtle (🐢)
            </Text>
            <Text style={styles.instructionText}>
              🍤 Eat food to grow (10 pts each)
            </Text>
            <Text style={styles.instructionText}>
              🛍️ Avoid plastic hazards
            </Text>
            <Text style={styles.instructionText}>
              🎯 Goal: Reach 100 points!
            </Text>
            <Text style={styles.instructionText}>
              🌊 Habitat: Oceans Worldwide
            </Text>
            <Text style={styles.instructionText}>
              🚨 Status: Endangered
            </Text>
          </View>
        )}
      </View>

      {/* D-pad and Control Buttons */}
      <View style={styles.controlsContainer}>
        {gameState.gameStarted ? (
          <View style={styles.dPadContainer}>
            <View style={styles.dPadRow}>
              <View style={styles.dPadSpacer} />
              <TouchableOpacity
                style={styles.dPadButton}
                onPress={() => changeDirection(DIRECTIONS.UP)}
                activeOpacity={0.7}
              >
                <Text style={styles.dPadText}>↑</Text>
              </TouchableOpacity>
              <View style={styles.dPadSpacer} />
            </View>
            <View style={styles.dPadRow}>
              <TouchableOpacity
                style={styles.dPadButton}
                onPress={() => changeDirection(DIRECTIONS.LEFT)}
                activeOpacity={0.7}
              >
                <Text style={styles.dPadText}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dPadButton}
                onPress={initializeGame}
                activeOpacity={0.7}
              >
                <Text style={styles.dPadText}>RESET</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dPadButton}
                onPress={() => changeDirection(DIRECTIONS.RIGHT)}
                activeOpacity={0.7}
              >
                <Text style={styles.dPadText}>→</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dPadRow}>
              <View style={styles.dPadSpacer} />
              <TouchableOpacity
                style={styles.dPadButton}
                onPress={() => changeDirection(DIRECTIONS.DOWN)}
                activeOpacity={0.7}
              >
                <Text style={styles.dPadText}>↓</Text>
              </TouchableOpacity>
              <View style={styles.dPadSpacer} />
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>START SWIMMING</Text>
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
});

export default Level13Screen;