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
const scale = Math.min(width, height) / 720; // Adjusted reference size for better scaling

// Normalize sizes for different screen resolutions
const normalize = (size) => Math.round(size * scale * pixelRatio) / pixelRatio;

// Grid setup for 8-bit Sudoku
const GRID_SIZE = 9;
const GAME_AREA_MARGIN = normalize(10);
const HEADER_HEIGHT = normalize(60);
const STATS_HEIGHT = normalize(30);
const CONTROLS_HEIGHT = normalize(140); // Reduced to fit number pad and D-pad
const MAX_CELL_SIZE = normalize(50);
const CELL_SIZE = Math.min(
  Math.floor((Math.min(width, height - HEADER_HEIGHT - STATS_HEIGHT - CONTROLS_HEIGHT - 2 * GAME_AREA_MARGIN) / GRID_SIZE)),
  MAX_CELL_SIZE
);
const GRID_WIDTH = CELL_SIZE * GRID_SIZE;

// Sample Sudoku puzzle (30 clues, medium difficulty, unique solution)
const initialPuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

// Solution for validation
const solution = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// Directions for swipe navigation
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const Level14Screen = () => {
  const navigation = useNavigation();
  const [gameState, setGameState] = useState({
    grid: initialPuzzle.map(row => [...row]), // Player's grid
    selectedCell: { x: -1, y: -1 }, // Selected cell for input
    score: 0,
    gameStarted: false,
    gameOver: false,
  });

  // Refs for timers and game state
  const endGameRef = useRef(false);
  const lastSwipeTimeRef = useRef(0);
  const showDebug = process.env.NODE_ENV === 'development';

  // Initialize game
  const initializeGame = useCallback(() => {
    endGameRef.current = false;
    setGameState({
      grid: initialPuzzle.map(row => [...row]),
      selectedCell: { x: -1, y: -1 },
      score: 0,
      gameStarted: false,
      gameOver: false,
    });
    if (showDebug) console.log('Game initialized, score reset to 0');
  }, []);

  // Check if a number can be placed in the grid
  const isValidPlacement = (grid, row, col, num) => {
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] === num) return false;
    }
    // Check column
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[x][col] === num) return false;
    }
    // Check 3x3 subgrid
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  };

  // Check if the puzzle is complete
  const isPuzzleComplete = (grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0 || grid[i][j] !== solution[i][j]) return false;
      }
    }
    return true;
  };

  // Place a number in the grid
  const placeNumber = useCallback((num) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.selectedCell.x === -1) return;
    const { x, y } = gameState.selectedCell;
    if (initialPuzzle[y][x] !== 0) return; // Can't change initial clues

    setGameState((prev) => {
      const newGrid = prev.grid.map(row => [...row]);
      newGrid[y][x] = num;
      let newScore = prev.score;
      const isCorrect = num === solution[y][x];
      if (isCorrect) {
        newScore += 10; // 10 points for correct placement
        if (showDebug) console.log(`Correct placement at (${x}, ${y}): ${num}, new score: ${newScore}`);
      } else {
        newScore = Math.max(0, newScore - 5); // Deduct 5 points for incorrect, min 0
        if (showDebug) console.log(`Incorrect placement at (${x}, ${y}): ${num}, new score: ${newScore}`);
      }

      const isComplete = isPuzzleComplete(newGrid);
      if (isComplete) {
        newScore += 100; // 100-point bonus for completion
        if (showDebug) console.log(`Puzzle completed, added 100-point bonus, final score: ${newScore}`);
        endGame(newScore);
        return { ...prev, grid: newGrid, score: newScore, gameOver: true };
      }

      return { ...prev, grid: newGrid, score: newScore };
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.selectedCell]);

  // Select a cell
  const selectCell = useCallback((x, y) => {
    if (!gameState.gameStarted || gameState.gameOver) return;
    setGameState((prev) => ({ ...prev, selectedCell: { x, y } }));
    if (showDebug) console.log(`Selected cell: (${x}, ${y})`);
  }, [gameState.gameStarted, gameState.gameOver]);

  // Move selection with D-pad or swipe
  const moveSelection = useCallback((direction) => {
    if (!gameState.gameStarted || gameState.gameOver || gameState.selectedCell.x === -1) return;
    setGameState((prev) => {
      const newX = Math.max(0, Math.min(GRID_SIZE - 1, prev.selectedCell.x + direction.x));
      const newY = Math.max(0, Math.min(GRID_SIZE - 1, prev.selectedCell.y + direction.y));
      return { ...prev, selectedCell: { x: newX, y: newY } };
    });
  }, [gameState.gameStarted, gameState.gameOver, gameState.selectedCell]);

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
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 50) moveSelection(DIRECTIONS.RIGHT);
            else if (dx < -50) moveSelection(DIRECTIONS.LEFT);
          } else {
            if (dy > 50) moveSelection(DIRECTIONS.DOWN);
            else if (dy < -50) moveSelection(DIRECTIONS.UP);
          }
        },
      }),
    [gameState.gameStarted, gameState.gameOver, moveSelection]
  );

  // End game function
  const endGame = useCallback((finalScore) => {
    if (gameState.gameOver || endGameRef.current) return;
    endGameRef.current = true;

    setGameState((prev) => {
      if (showDebug) console.log(`Game ended, final score: ${finalScore}`);
      return { ...prev, gameOver: true, gameStarted: false };
    });

    // Add points to backend
    ApiService.addPoints(finalScore).catch((err) => {
      console.error('Failed to add points:', err);
    });

    // Mark level as completed on backend
    try {
      ApiService.markLevelComplete(14);
    } catch (err) {
      console.error('Failed to mark level 14 as completed:', err);
    }

    const funFacts = [
      "Coral reefs support 25% of marine life but are threatened by pollution",
      "Oceans absorb 30% of global CO2 emissions",
      "Over 8 million tons of plastic enter the oceans annually",
    ];
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

    let message = `Game Over!\nScore: ${finalScore}`;
    if (finalScore >= 100) {
      message += '\n🌟 Victory! You won!';
    } else {
      message += '\n💪 Try again to reach 100 points!';
    }

    Alert.alert('Level 14 Complete', message, [
      { text: 'Play Again', onPress: initializeGame },
      { text: 'Main Menu', onPress: () => navigation.goBack() },
    ]);
  }, [initializeGame, navigation]);

  // Start game
  const startGame = useCallback(() => {
    initializeGame();
    setGameState((prev) => ({ ...prev, gameStarted: true, gameOver: false, selectedCell: { x: 0, y: 0 } }));
  }, [initializeGame]);

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
    return () => subscription?.remove();
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
        <Text style={styles.levelTitle}>LEVEL 14: OCEAN SUDOKU</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Game Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Score: {gameState.score}</Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea} {...panResponder.panHandlers}>
        <View style={styles.background} />
        <View style={styles.gridContainer}>
          {gameState.grid.map((row, y) => (
            row.map((num, x) => (
              <TouchableOpacity
                key={`${x}-${y}`}
                style={[
                  styles.cell,
                  {
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRightWidth: (x + 1) % 3 === 0 ? normalize(3) : normalize(1),
                    borderBottomWidth: (y + 1) % 3 === 0 ? normalize(3) : normalize(1),
                    backgroundColor:
                      gameState.selectedCell.x === x && gameState.selectedCell.y === y
                        ? '#FFD700'
                        : initialPuzzle[y][x] !== 0
                        ? '#87CEEB'
                        : num === solution[y][x]
                        ? '#90EE90'
                        : num !== 0
                        ? '#FF4500'
                        : '#FFF',
                  },
                ]}
                onPress={() => selectCell(x, y)}
              >
                <Text style={styles.cellText}>{num !== 0 ? num : ''}</Text>
              </TouchableOpacity>
            ))
          ))}
        </View>
        {showDebug && gameState.gameStarted && (
          <Text style={styles.debugText}>
            Selected: ({gameState.selectedCell.x}, {gameState.selectedCell.y}) | Score: {gameState.score}
          </Text>
        )}
        {/* Instructions */}
        {!gameState.gameStarted && !gameState.gameOver && (
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>Mission: Solve the Ocean Puzzle!</Text>
            <Text style={styles.instructionText}>👆 Tap a cell, then a number to place it</Text>
            <Text style={styles.instructionText}>🔢 Correct: +10 pts, Incorrect: -5 pts</Text>
            <Text style={styles.instructionText}>🎯 Complete puzzle: +100 pts</Text>
            <Text style={styles.instructionText}>🐠 No repeats in row, column, or 3x3</Text>
            <Text style={styles.instructionText}>🌍 Protect oceans: Reduce plastic!</Text>
          </View>
        )}
      </View>

      {/* Number Pad and Controls */}
      <View style={styles.controlsContainer}>
        {gameState.gameStarted ? (
          <>
            <View style={styles.numberPad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.numberButton}
                  onPress={() => placeNumber(num)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.numberText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* <View style={styles.dPadContainer}>
              <View style={styles.dPadRow}>
                <View style={styles.dPadSpacer} />
                <TouchableOpacity
                  style={styles.dPadButton}
                  onPress={() => moveSelection(DIRECTIONS.UP)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dPadText}>↑</Text>
                </TouchableOpacity>
                <View style={styles.dPadSpacer} />
              </View>
              <View style={styles.dPadRow}>
                <TouchableOpacity
                  style={styles.dPadButton}
                  onPress={() => moveSelection(DIRECTIONS.LEFT)}
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
                  onPress={() => moveSelection(DIRECTIONS.RIGHT)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dPadText}>→</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dPadRow}>
                <View style={styles.dPadSpacer} />
                <TouchableOpacity
                  style={styles.dPadButton}
                  onPress={() => moveSelection(DIRECTIONS.DOWN)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dPadText}>↓</Text>
                </TouchableOpacity>
                <View style={styles.dPadSpacer} />
              </View>
            </View> */}
          </>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.buttonText}>START PUZZLE</Text>
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
    paddingTop: normalize(20), // Reduced for better space
    paddingBottom: normalize(10),
    backgroundColor: '#1E90FF',
    height: HEADER_HEIGHT,
  },
  backButton: {
    padding: normalize(1),
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
    width: GRID_WIDTH,
    height: GRID_WIDTH,
    position: 'relative',
  },
  cell: {
    position: 'absolute',
    borderWidth: normalize(1),
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: normalize(18), // Adjusted for better fit
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#000',
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
    fontSize: normalize(25),
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
    height: CONTROLS_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: normalize(220), // Fits 5 buttons per row
  },
  numberButton: {
    backgroundColor: '#555',
    padding: normalize(5),
    margin: normalize(3),
    borderWidth: normalize(2),
    borderColor: '#FFF',
    width: normalize(36),
    height: normalize(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#FFF',
    fontSize: normalize(16),
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  dPadContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: normalize(5),
  },
  dPadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dPadButton: {
    backgroundColor: '#555',
    padding: normalize(5),
    margin: normalize(3),
    borderWidth: normalize(2),
    borderColor: '#FFF',
    width: normalize(40),
    height: normalize(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dPadText: {
    color: '#FFF',
    fontSize: normalize(16),
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  dPadSpacer: {
    width: normalize(40),
    height: normalize(40),
    margin: normalize(3),
  },
  startButton: {
    backgroundColor: '#0F0',
    paddingHorizontal: normalize(25),
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

export default Level14Screen;