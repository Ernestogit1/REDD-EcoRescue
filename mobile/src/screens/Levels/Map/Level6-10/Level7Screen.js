import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, Modal, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../../../../services/api.service';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_SIZE = 10; // Reduced from 15 to 10 for better mobile view
const CELL_SIZE = Math.floor(Math.min(SCREEN_WIDTH, SCREEN_HEIGHT - 150) / GRID_SIZE);

// Game elements
const EMPTY = 0;
const WALL = 1;
const RESCUER = 2; // Changed from RACCOON to RESCUER (man)
const POISON = 3;  // Changed from HUNTER to POISON
const RACCOON = 4; // Changed from FINISH to RACCOON (the animal to be rescued)

// Simplified maze layout (10x10) for better mobile visibility
const initialMaze = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,2,0,0,0,0,0,0,0,1],
  [1,1,1,0,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,1],
  [1,1,1,1,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,1],
  [1,0,1,1,0,0,4,0,0,1],
  [1,1,1,1,1,1,1,1,1,1],
];

export default function Level7Screen() {
  const navigation = useNavigation();
  const [maze, setMaze] = useState(initialMaze);
  const [rescuerPos, setRescuerPos] = useState({ x: 1, y: 1 }); // Changed from raccoonPos to rescuerPos
  const [poisons, setPoisons] = useState([  // Changed from hunters to poisons
    { x: 3, y: 1, dx: 1, dy: 0 },
    { x: 8, y: 5, dx: 0, dy: 1 }
  ]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success' or 'failure'
  const [modalAnim] = useState(new Animated.Value(0));

  // Move the rescuer
  const moveRescuer = (dx, dy) => {  // Changed from moveRaccoon to moveRescuer
    if (!gameStarted || gameOver) return;

    const newX = rescuerPos.x + dx;
    const newY = rescuerPos.y + dy;

    // Check if the move is valid (not a wall)
    if (maze[newY][newX] !== WALL) {
      // Update previous position to empty
      const newMaze = maze.map(row => [...row]);
      newMaze[rescuerPos.y][rescuerPos.x] = EMPTY;
      
      // Check if reached raccoon
      if (maze[newY][newX] === RACCOON) {  // Changed from FINISH to RACCOON
        setGameOver(true);
        show8BitAlert('success', 'You successfully rescued the raccoon!');
        return;
      }

      // Update new position
      newMaze[newY][newX] = RESCUER;  // Changed from RACCOON to RESCUER
      setMaze(newMaze);
      setRescuerPos({ x: newX, y: newY });  // Changed from setRaccoonPos to setRescuerPos
      setScore(score + 10);
    }
  };

  // Move poisons
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveInterval = setInterval(() => {
      setPoisons(currentPoisons => {  // Changed from setHunters/currentHunters to setPoisons/currentPoisons
        return currentPoisons.map(poison => {  // Changed from hunter to poison
          let newX = poison.x + poison.dx;
          let newY = poison.y + poison.dy;

          // If poison hits a wall or another poison, change direction
          if (maze[newY][newX] === WALL) {
            poison.dx = -poison.dx;
            poison.dy = -poison.dy;
            newX = poison.x + poison.dx;
            newY = poison.y + poison.dy;
          }

          // Check if poison caught the rescuer
          if (newX === rescuerPos.x && newY === rescuerPos.y) {  // Changed from raccoonPos to rescuerPos
            setGameOver(true);
            show8BitAlert('failure', 'You were poisoned! Try again!');  // Updated message
          }

          return { ...poison, x: newX, y: newY };
        });
      });
    }, 500); // Move every 500ms

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver, rescuerPos]);  // Changed from raccoonPos to rescuerPos

  useEffect(() => {
    if (gameOver && modalType === 'success') {
      (async () => {
        try {
          await ApiService.addPoints(score);
          await ApiService.markLevelComplete(7);
          // Removed collectCard call
        } catch (err) {
          console.error('Failed to update backend:', err);
        }
      })();
    }
  }, [gameOver, modalType]);

  const resetGame = () => {
    setMaze(initialMaze);
    setRescuerPos({ x: 1, y: 1 });  // Changed from setRaccoonPos to setRescuerPos
    setPoisons([  // Changed from setHunters to setPoisons
      { x: 3, y: 1, dx: 1, dy: 0 },
      { x: 8, y: 5, dx: 0, dy: 1 }
    ]);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  // Custom alert function
  const show8BitAlert = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setShowModal(true);
    Animated.sequence([
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(modalAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(modalAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1A3C40', '#0D1B1E']} style={styles.background}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
            <Text style={styles.exitButtonText}>EXIT</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RESCUE THE RACCOON</Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>

        <View style={styles.gameLayout}>
          {/* Controls on the left */}
          <View style={styles.controls}>
            <View style={styles.controlsInner}>
              <TouchableOpacity
                style={[styles.button, styles.topButton]}
                onPress={() => moveRescuer(0, -1)}  // Changed from moveRaccoon to moveRescuer
              >
                <View style={styles.pixelArrow}>
                  <View style={styles.pixelArrowTop} />
                </View>
              </TouchableOpacity>
              <View style={styles.middleButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.leftButton]}
                  onPress={() => moveRescuer(-1, 0)}  // Changed from moveRaccoon to moveRescuer
                >
                  <View style={styles.pixelArrow}>
                    <View style={styles.pixelArrowLeft} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.rightButton]}
                  onPress={() => moveRescuer(1, 0)}  // Changed from moveRaccoon to moveRescuer
                >
                  <View style={styles.pixelArrow}>
                    <View style={styles.pixelArrowRight} />
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.button, styles.bottomButton]}
                onPress={() => moveRescuer(0, 1)}  // Changed from moveRaccoon to moveRescuer
              >
                <View style={styles.pixelArrow}>
                  <View style={styles.pixelArrowBottom} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Game Grid */}
          <View style={styles.mazeContainer}>
            <View style={styles.maze}>
              {maze.map((row, y) => (
                <View key={y} style={styles.row}>
                  {row.map((cell, x) => (
                    <View
                      key={`${x}-${y}`}
                      style={[
                        styles.cell,
                        cell === WALL && styles.wall,
                        cell === RACCOON && styles.raccoonCell,  // Changed from FINISH to RACCOON
                      ]}
                    >
                      {cell === RESCUER && (  // Changed from RACCOON to RESCUER
                        <Image 
                          source={require('../../../../../assets/images/pets/man.png')}  // Changed to man.png
                          style={styles.characterImage}
                          resizeMode="contain"
                        />
                      )}
                      {cell === RACCOON && (  // Added to display raccoon at the finish position
                        <Image 
                          source={require('../../../../../assets/images/pets/racoon.png')}
                          style={styles.characterImage}
                          resizeMode="contain"
                        />
                      )}
                      {poisons.some(p => p.x === x && p.y === y) && (  // Changed from hunters to poisons
                        <Image 
                          source={require('../../../../../assets/images/pets/poison.png')}  // Added poison.png
                          style={styles.characterImage}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Start Button */}
        {!gameStarted && (
          <TouchableOpacity style={styles.startButton} onPress={resetGame}>
            <Text style={styles.startButtonText}>START GAME</Text>
          </TouchableOpacity>
        )}

        {/* 8-Bit Style Alert Modal */}
        <Modal
          transparent={true}
          visible={showModal}
          animationType="none"
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [
                    { scale: modalAnim }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={modalType === 'success' ? ['#76C893', '#52B69A'] : ['#E63946', '#D00000']}
                style={styles.modalHeader}
              >
                <Text style={styles.modalHeaderText}>
                  {modalType === 'success' ? '★ VICTORY! ★' : '× GAME OVER ×'}
                </Text>
              </LinearGradient>
              <View style={styles.modalBody}>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowModal(false);
                    resetGame();
                  }}
                >
                  <LinearGradient
                    colors={['#FFB703', '#FB8500']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonText}>
                      {modalType === 'success' ? 'PLAY AGAIN' : 'TRY AGAIN'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
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
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
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
    fontSize: 16,
  },
  scoreText: {
    position: 'absolute',
    right: 15,
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFB703',
    fontSize: 12,
  },
  gameLayout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 50, // Added left padding to the game layout
  },
  controls: {
    width: SCREEN_WIDTH * 0.28, // Increased width slightly
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 50, // Increased left padding to move controls more to the right
  },
  controlsInner: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mazeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 25,
  },
  maze: {
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 8,
    backgroundColor: '#000',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 1,
    borderRadius: 3,
    backgroundColor: '#1A3C40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wall: {
    backgroundColor: '#1A759F',
  },
  characterImage: {
    width: '90%',
    height: '90%',
  },
  raccoonCell: {
    backgroundColor: '#1A3C40', // Same as empty cell, will show raccoon image
  },
  middleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 8,
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: '#FFB703',
    borderWidth: 2,
    borderColor: '#FB8500',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    elevation: 3,
  },
  topButton: {
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
  },
  bottomButton: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderRightWidth: 4,
  },
  leftButton: {
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderBottomWidth: 4,
  },
  rightButton: {
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderBottomWidth: 4,
  },
  pixelArrow: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixelArrowTop: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFF',
  },
  pixelArrowBottom: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
  pixelArrowLeft: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderRightWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFF',
  },
  pixelArrowRight: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFF',
  },
  startButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#76C893',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
  },
  startButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#2A2B2A',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  modalHeaderText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1A3C40',
  },
  modalMessage: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    width: '80%',
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  modalButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
});