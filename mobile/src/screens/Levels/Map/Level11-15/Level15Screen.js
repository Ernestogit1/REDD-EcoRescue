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
} from 'react-native';
import { PixelRatio } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../../../../services/api.service';

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

    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    clearAllSinkTimers();

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
          body: JSON.stringify({ levelId: '15' }),
        });
      }
    } catch (err) {
      console.error('Failed to mark level 15 as completed:', err);
    }

    const funFacts = [
      "Frogs absorb water through their skin, making them sensitive to pollution",
      "Plastic pollution threatens amphibian habitats worldwide",
      "Some frog species can jump up to 20 times their body length",
    ];
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

    let message = `Game Over!\nScore: ${finalScore}\nFun Fact: ${randomFact}`;
    if (gameState.frog.y === 0) {
      message += '\n🌊 Victory! Frog reached the safe zone!\nProtect ponds: Reduce plastic pollution!';
    } else {
      message += '\n🐸 Oh no! Try again to reach the safe zone!\nProtect ponds: Reduce plastic pollution!';
    }

    Alert.alert(
      'Level 15: Frog Leap',
      message,
      [
        {
          text: 'Play Again',
          onPress: () => {
            initializeGame();
            setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false, showInstructions: false }));
          },
        },
        {
          text: 'Main Menu',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.levelTitle}>LEVEL 15: FROG LEAP</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Score: {gameState.score}</Text>
      </View>

      {/* Instructions or Game Area */}
      {gameState.showInstructions ? (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionTitle}>Level 15: Frog Leap Mechanics</Text>
          <Text style={styles.instructionText}>
            Welcome to Frog Leap! Guide your frog to the safe zone while avoiding plastic hazards and sinking lily pads.
          </Text>
          <Text style={styles.instructionText}>
            🐸 Your frog starts at the bottom of a 10x6 grid. The goal is to reach the top row (safe zone, 🏞️).
          </Text>
          <Text style={styles.instructionText}>
            👆 Tap a lily pad (🟢) within 2 cells to jump. Each jump earns 10 points.
          </Text>
          <Text style={styles.instructionText}>
            🌊 Use the D-pad (right side) or swipe to move one cell at a time (up, down, left, right).
          </Text>
          <Text style={styles.instructionText}>
            🛍️ Avoid plastic hazards falling from the top. A collision ends the game.
          </Text>
          <Text style={styles.instructionText}>
            🌱 Lily pads sink for 2 seconds after you land, making you vulnerable to hazards.
          </Text>
          <Text style={styles.instructionText}>
            🎯 Reach the safe zone for a 100-point bonus and win!
          </Text>
          <Text style={styles.instructionText}>
            🌍 EcoRescue Mission: Plastic pollution harms amphibians. Help keep ponds clean!
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>START JUMPING</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea} {...panResponder.panHandlers}>
          <View style={styles.background} />
          <View style={styles.gridContainer}>
            {/* Lily Pads and Safe Zone */}
            {gameState.lilyPads.map((pad) => (
              <TouchableOpacity
                key={pad.id}
                style={[
                  styles.lilyPad,
                  {
                    left: pad.x * CELL_SIZE,
                    top: pad.y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: pad.isSafeZone ? '#228B22' : pad.sinking ? '#006400' : '#32CD32',
                  },
                ]}
                onPress={() => moveFrog(pad.x, pad.y)}
              >
                <Text style={styles.padText}>{pad.isSafeZone ? '🏞️' : '🟢'}</Text>
              </TouchableOpacity>
            ))}
            {/* Frog */}
            <View
              style={[
                styles.frog,
                {
                  left: gameState.frog.x * CELL_SIZE,
                  top: gameState.frog.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                },
              ]}
            >
              <Text style={styles.frogText}>🐸</Text>
            </View>
            {/* Hazards */}
            {gameState.hazards.map((hazard) => (
              <View
                key={hazard.id}
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
                <Text style={styles.hazardText}>🛍️</Text>
              </View>
            ))}
          </View>
          {showDebug && gameState.gameStarted && (
            <Text style={styles.debugText}>
              Frog: ({gameState.frog.x}, {gameState.frog.y}) | Score: {gameState.score}
            </Text>
          )}
          {/* In-Game Instructions */}
          {!gameState.gameStarted && !gameState.gameOver && !gameState.showInstructions && (
            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>Mission: Guide the Frog!</Text>
              <Text style={styles.instructionText}>👆 Tap lily pad to jump (max 2 cells)</Text>
              <Text style={styles.instructionText}>🌊 Swipe/D-pad to move</Text>
              <Text style={styles.instructionText}>🛍️ Avoid plastics</Text>
              <Text style={styles.instructionText}>🌱 Pads sink for 2s</Text>
              <Text style={styles.instructionText}>🎯 Safe zone: +100 pts</Text>
              <Text style={styles.instructionText}>🔢 Jump: +10 pts</Text>
              <Text style={styles.instructionText}>🌍 Protect ponds!</Text>
            </View>
          )}
        </View>
      )}

      {/* Controls */}
      {gameState.gameStarted && (
        <View style={styles.controlsContainer}>
          <View style={styles.dPadContainer}>
            <TouchableOpacity
              style={[styles.dPadButton, { top: normalize(0), left: normalize(40) }]}
              onPress={() => moveFrogDpad(DIRECTIONS.UP)}
              activeOpacity={0.7}
            >
              <Text style={styles.dPadText}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dPadButton, { top: normalize(40), left: normalize(0) }]}
              onPress={() => moveFrogDpad(DIRECTIONS.LEFT)}
              activeOpacity={0.7}
            >
              <Text style={styles.dPadText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dPadButton, { top: normalize(40), left: normalize(40) }]}
              onPress={initializeGame}
              activeOpacity={0.7}
            >
              <Text style={styles.dPadText}>RESET</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dPadButton, { top: normalize(40), right: normalize(0) }]}
              onPress={() => moveFrogDpad(DIRECTIONS.RIGHT)}
              activeOpacity={0.7}
            >
              <Text style={styles.dPadText}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dPadButton, { bottom: normalize(0), left: normalize(40) }]}
              onPress={() => moveFrogDpad(DIRECTIONS.DOWN)}
              activeOpacity={0.7}
            >
              <Text style={styles.dPadText}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    backgroundColor: '#0F0',
    paddingHorizontal: normalize(25),
    paddingVertical: normalize(12),
    borderRadius: 0,
    borderWidth: normalize(2),
    borderColor: '#FFF',
    marginTop: normalize(10),
  },
  buttonText: {
    color: '#FFF',
    fontSize: normalize(11),
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Level15Screen;