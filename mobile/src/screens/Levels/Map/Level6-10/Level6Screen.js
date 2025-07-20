import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 0 = wall, 1 = path
const MAZE = [
  [1,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,0,1,1,1,1,0],
  [0,0,0,1,0,1,0,0,1,0],
  [0,1,0,1,1,1,0,1,1,0],
  [0,1,0,0,0,0,0,1,0,0],
  [0,1,1,1,1,1,1,1,0,0],
  [0,0,0,0,0,0,1,0,0,0],
  [0,1,1,1,1,0,1,1,1,1],
  [0,1,0,0,1,0,0,0,0,1],
  [0,1,1,0,1,1,1,1,0,1],
  [0,0,1,0,0,0,0,1,0,1],
  [0,0,1,1,1,1,0,1,1,1],
  [0,0,0,0,0,1,0,0,0,1],
  [0,0,0,0,0,1,1,1,1,1],
];

const MAZE_ROWS = MAZE.length;
const MAZE_COLS = MAZE[0].length;
const CELL_SIZE = Math.floor(Math.min(screenWidth, screenHeight * 0.7) / Math.max(MAZE_ROWS, MAZE_COLS));

const PLAYER_START = { row: 0, col: 0 };
const FOX_POS = { row: MAZE_ROWS - 1, col: MAZE_COLS - 1 };

export default function Level6Screen() {
  const navigation = useNavigation();
  const [player, setPlayer] = useState(PLAYER_START);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const [bestTime, setBestTime] = useState(null);
  const [showWinModal, setShowWinModal] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const TIME_LIMIT = 120; // 120 seconds time limit
  const timerRef = useRef(null);

  // Start timer on game start
  useEffect(() => {
    if (!gameStarted) {
      setIsTiming(false);
      setTimer(TIME_LIMIT);
      return;
    }
    if (!gameWon && !gameOver && !isTiming) {
      setTimer(TIME_LIMIT);
      setIsTiming(true);
    }
    if (isTiming) {
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          // Check if time is up
          if (t <= 1) {
            clearInterval(timerRef.current);
            setIsTiming(false);
            setGameOver(true);
            setTimeout(() => {
              Alert.alert(
                "Time's Up!",
                "You ran out of time. Try again?",
                [
                  { text: "Try Again", onPress: resetGame },
                  { text: "Exit", onPress: () => navigation.goBack() }
                ]
              );
            }, 300);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTiming, gameStarted, gameWon, gameOver]);

  // Stop timer on win
  useEffect(() => {
    if (gameWon) {
      setIsTiming(false);
      clearInterval(timerRef.current);
      
      // Calculate score based on time remaining
      const timeBonus = timer * 10; // 10 points per second remaining
      const newScore = 1000 + timeBonus; // Base score + time bonus
      setScore(newScore);
      
      // Update high score if needed
      if (newScore > highScore) {
        setHighScore(newScore);
      }
      
      // Update best time if needed
      const completionTime = TIME_LIMIT - timer;
      if (bestTime === null || completionTime < bestTime) {
        setBestTime(completionTime);
      }
    }
  }, [gameWon]);

  const movePlayer = (dRow, dCol) => {
    if (!gameStarted || gameWon || gameOver) return;
    const newRow = player.row + dRow;
    const newCol = player.col + dCol;
    if (
      newRow >= 0 && newRow < MAZE_ROWS &&
      newCol >= 0 && newCol < MAZE_COLS &&
      MAZE[newRow][newCol] === 1
    ) {
      setPlayer({ row: newRow, col: newCol });
      if (newRow === FOX_POS.row && newCol === FOX_POS.col) {
        setGameWon(true);
        setTimeout(() => {
          setShowWinModal(true);
        }, 300);
      }
    }
  };

  const resetGame = () => {
    setPlayer(PLAYER_START);
    setGameWon(false);
    setGameOver(false);
    setTimer(TIME_LIMIT);
    setIsTiming(false);
    setScore(0);
    setGameStarted(true);
    setTimeout(() => setIsTiming(true), 100); // restart timer after reset
  };

  const handlePlayAgain = () => {
    setShowWinModal(false);
    resetGame();
  };

  const handleExit = () => {
    setShowWinModal(false);
    navigation.goBack();
  };

  // 8-bit style colors
  const COLORS = {
    wall: '#22223b',
    path: '#f2e9e4',
    player: '#3a86ff',
    fox: '#e63946',
    foxEar: '#ffb703',
    foxTail: '#fff',
  };

  // Render maze grid
  const renderMaze = () => {
    return MAZE.map((rowArr, rowIdx) => (
      <View key={rowIdx} style={{ flexDirection: 'row' }}>
        {rowArr.map((cell, colIdx) => {
          let cellStyle = [styles.cell, { backgroundColor: cell === 1 ? COLORS.path : COLORS.wall }];
          let content = null;
          // Player
          if (player.row === rowIdx && player.col === colIdx) {
            content = (
              <View style={styles.playerSprite}>
                <View style={styles.playerFace} />
                <View style={styles.playerEye} />
              </View>
            );
          }
          // Fox
          if (FOX_POS.row === rowIdx && FOX_POS.col === colIdx) {
            content = (
              <View style={styles.foxSprite}>
                <View style={styles.foxEarLeft} />
                <View style={styles.foxEarRight} />
                <View style={styles.foxFace} />
                <View style={styles.foxTail} />
              </View>
            );
          }
          return (
            <View key={colIdx} style={cellStyle}>
              {content}
            </View>
          );
        })}
      </View>
    ));
  };

  // Keyboard arrow key support (for web/desktop/emulator)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e) => {
      if (gameWon || gameOver) return;
      if (e.key === 'ArrowUp') movePlayer(-1, 0);
      if (e.key === 'ArrowDown') movePlayer(1, 0);
      if (e.key === 'ArrowLeft') movePlayer(0, -1);
      if (e.key === 'ArrowRight') movePlayer(0, 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [player, gameWon, gameOver]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A3C40', '#0D1B1E']} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>EXIT</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🦊 Rescue the Red Fox</Text>
          <Text style={styles.scoreText}>Time: {timer}s</Text>
        </View>
        {/* Main Content: Controls (left) + Maze (right) */}
        <View style={styles.mainContent}>
          {/* Controls on the left */}
          <View style={styles.controlsLeft}>
            {/* D-pad container */}
            <View style={styles.dpadContainer}>
              {/* Up button */}
              <View style={styles.dpadRow}>
                <TouchableOpacity 
                  style={styles.dpadBtn}
                  onPress={() => movePlayer(-1, 0)} 
                  disabled={!gameStarted || gameWon || gameOver}
                >
                  <View style={styles.dpadBtnInner}>
                    <Text style={styles.arrowText}>↑</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Middle row (Left, Center, Right) */}
              <View style={styles.dpadRow}>
                <TouchableOpacity 
                  style={styles.dpadBtn}
                  onPress={() => movePlayer(0, -1)} 
                  disabled={!gameStarted || gameWon || gameOver}
                >
                  <View style={styles.dpadBtnInner}>
                    <Text style={styles.arrowText}>←</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.dpadCenter}></View>
                
                <TouchableOpacity 
                  style={styles.dpadBtn}
                  onPress={() => movePlayer(0, 1)} 
                  disabled={!gameStarted || gameWon || gameOver}
                >
                  <View style={styles.dpadBtnInner}>
                    <Text style={styles.arrowText}>→</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Down button */}
              <View style={styles.dpadRow}>
                <TouchableOpacity 
                  style={styles.dpadBtn}
                  onPress={() => movePlayer(1, 0)} 
                  disabled={!gameStarted || gameWon || gameOver}
                >
                  <View style={styles.dpadBtnInner}>
                    <Text style={styles.arrowText}>↓</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* Maze Board on the right */}
          <View style={styles.mazeBoardWrapper}>
            <View style={styles.mazeBoard}>
              {renderMaze()}
            </View>
          </View>
        </View>
        {/* Start Game Button */}
        {!gameStarted && (
          <TouchableOpacity style={styles.startButton} onPress={() => setGameStarted(true)}>
            <Text style={styles.startButtonText}>START GAME</Text>
          </TouchableOpacity>
        )}
        {/* 8-bit Win Modal */}
        <Modal
          visible={showWinModal}
          transparent
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>YOU RESCUED THE RED FOX!</Text>
              <Text style={styles.modalText}>Congratulations!</Text>
              <Text style={styles.modalText}>Time Remaining: <Text style={styles.modalScore}>{timer}s</Text></Text>
              <Text style={styles.modalText}>Your Score: <Text style={styles.modalScore}>{score}</Text></Text>
              <Text style={styles.modalText}>High Score: <Text style={styles.modalScore}>{highScore}</Text></Text>
              {bestTime !== null && (
                <Text style={styles.modalText}>Best Time: <Text style={styles.modalScore}>{bestTime}s</Text></Text>
              )}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalBtn} onPress={handlePlayAgain}>
                  <Text style={styles.modalBtnText}>PLAY AGAIN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalBtn} onPress={handleExit}>
                  <Text style={styles.modalBtnText}>EXIT</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  startButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#76C893',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
    minWidth: 120,
  },
  startButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
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
  exitButton: {
    position: 'absolute',
    left: 15,
    paddingVertical: 6,
    paddingHorizontal: 18,
    backgroundColor: '#E63946',
    borderRadius: 8,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  exitButtonText: {
    color: '#FFF',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    letterSpacing: 1,
  },
  headerTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 18,
    letterSpacing: 1,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    textAlign: 'center',
  },
  scoreText: {
    position: 'absolute',
    right: 15,
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFB703',
    fontSize: 14,
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  controlsLeft: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 80,
    marginLeft: -20,
    minWidth: 120,
  },
  dpadContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444',
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#222',
    padding: 5,
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  dpadBtnInner: {
    width: 36,
    height: 36,
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    // 8-bit style shadow
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 4,
  },
  dpadCenter: {
    width: 30,
    height: 30,
    backgroundColor: '#555',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
    margin: 2,
  },
  arrowText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#1A3C40',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  mazeBoardWrapper: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mazeBoard: {
    alignSelf: 'center',
    marginVertical: 10,
    backgroundColor: '#22223b',
    padding: 6,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerSprite: {
    width: CELL_SIZE * 0.7,
    height: CELL_SIZE * 0.7,
    backgroundColor: '#3a86ff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#22223b',
  },
  playerFace: {
    width: '60%',
    height: '60%',
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 2,
  },
  playerEye: {
    width: 6,
    height: 6,
    backgroundColor: '#222',
    borderRadius: 3,
    position: 'absolute',
    top: '55%',
    left: '60%',
  },
  foxSprite: {
    width: CELL_SIZE * 0.7,
    height: CELL_SIZE * 0.7,
    backgroundColor: '#e63946',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    position: 'relative',
  },
  foxEarLeft: {
    width: 10,
    height: 10,
    backgroundColor: '#ffb703',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 2,
    transform: [{ rotate: '-20deg' }],
  },
  foxEarRight: {
    width: 10,
    height: 10,
    backgroundColor: '#ffb703',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    right: 2,
    transform: [{ rotate: '20deg' }],
  },
  foxFace: {
    width: '60%',
    height: '60%',
    backgroundColor: '#e63946',
    borderRadius: 5,
    marginBottom: 2,
  },
  foxTail: {
    width: 12,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    position: 'absolute',
    bottom: 2,
    right: -6,
    transform: [{ rotate: '30deg' }],
  },
  // 8-bit modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20,20,20,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 320,
    backgroundColor: '#22223b',
    borderWidth: 6,
    borderColor: '#FFD700',
    borderRadius: 0,
    alignItems: 'center',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  modalText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalScore: {
    color: '#00FF99',
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 13,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 18,
    justifyContent: 'center',
  },
  modalBtn: {
    backgroundColor: '#FFD700',
    borderWidth: 3,
    borderColor: '#3a86ff',
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 8,
    minWidth: 90,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 3,
  },
  modalBtnText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#1A3C40',
    fontSize: 12,
    letterSpacing: 1,
  },
});
