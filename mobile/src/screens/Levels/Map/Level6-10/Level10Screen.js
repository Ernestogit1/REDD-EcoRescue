import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Modal, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ecoItemImg from '../../../../../assets/images/levels/level10/eco-item.png';
import rescueZoneImg from '../../../../../assets/images/levels/level10/rescue-zone.png';
import marioImg from '../../../../../assets/images/levels/level10/mario.png';
import turtleImg from '../../../../../assets/images/levels/level10/turtle.png';
import stoneImg from '../../../../../assets/images/levels/level10/stone.png';
import bombImg from '../../../../../assets/images/levels/level10/bomb.png';
import ApiService from '../../../../services/api.service';


const { width, height } = Dimensions.get('window');
const TURTLE_SIZE = 40;
const MARIO_SIZE = 40;
const OBSTACLE_SIZE = 30;
const ITEM_SIZE = 20;
const GROUND_Y = height - 150;
// Increase level length to ensure there's no limit
const LEVEL_END = width * 3; // Make the level three times as long

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Adjust obstacle and item Y positions to sit directly on the ground platform
const initialObstacles = [
  { x: 180, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'rock' },
  { x: 340, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'log' },
  { x: 520, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'pit' },
  { x: 700, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'rock' },
  { x: 880, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'log' },
  { x: 1060, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'pit' },
  { x: 1240, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'rock' },
  { x: 1420, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'log' },
  { x: 1600, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'pit' },
  { x: 1780, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'rock' },
  { x: 1960, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'log' },
  { x: 2140, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE + 10, type: 'pit' },
];

const initialItems = [
  { x: 300, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'lettuce' },
  { x: 500, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'shell' },
  { x: 800, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'lettuce' },
  { x: 1100, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'shell' },
  { x: 1400, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'lettuce' },
  { x: 1600, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'shell' },
  // Add extra eco-items in the 3/4 part of the map
  { x: 1800, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'lettuce' },
  { x: 1900, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 20, type: 'shell' }, // higher up
  { x: 2000, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'lettuce' },
  { x: 2100, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 20, type: 'shell' }, // higher up
  { x: 2200, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'lettuce' },
  { x: 2300, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 5, type: 'shell' },
  // Add a special bonus cluster near the end
  { x: 2400, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 30, type: 'lettuce' },
  { x: 2420, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 50, type: 'shell' },
  { x: 2440, y: GROUND_Y + TURTLE_SIZE - OBSTACLE_SIZE - 70, type: 'lettuce' },
];

// Set TURTLE_GROUND_Y so the turtle sits visually on the platform
const TURTLE_GROUND_Y = GROUND_Y + 10;

export default function Level10Screen() {
  const navigation = useNavigation();
  const [turtleX, setTurtleX] = useState(20);
  const [turtleY, setTurtleY] = useState(TURTLE_GROUND_Y);
  const [marioX, setMarioX] = useState(-60); // Start Mario further left
  const [jumpVelocity, setJumpVelocity] = useState(0);
  const [jumping, setJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bombCollision, setBombCollision] = useState(false); // New state for bomb-specific game over
  const [win, setWin] = useState(false);
  const [obstacles, setObstacles] = useState(initialObstacles);
  const [items, setItems] = useState(initialItems);
  const jumpRef = useRef(false);
  // Add animation value for modal
  const modalAnimation = useRef(new Animated.Value(0)).current;

  // Game loop
  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      // Mario chases turtle (faster)
      setMarioX(prev => Math.min(prev + 3, turtleX - 10));

      // Turtle jump physics (smoother)
      if (jumpRef.current) {
        setJumpVelocity(-18);
        jumpRef.current = false;
      }
      if (turtleY < TURTLE_GROUND_Y || jumpVelocity < 0) {
        setTurtleY(prev => {
          let nextY = prev + jumpVelocity;
          if (nextY >= TURTLE_GROUND_Y) {
            setJumpVelocity(0);
            return TURTLE_GROUND_Y;
          }
          setJumpVelocity(jumpVelocity + 2.5); // gravity
          return nextY;
        });
      }

      // Check collisions - only check for bombs causing game over
      obstacles.forEach(obs => {
        if (
          Math.abs(turtleX - obs.x) < OBSTACLE_SIZE &&
          Math.abs(turtleY - obs.y) < OBSTACLE_SIZE
        ) {
          // Only bombs cause game over, and only when on the ground
          if (obs.type === 'pit' && turtleY === TURTLE_GROUND_Y) {
            setBombCollision(true); // Set bomb collision instead of generic game over
          }
        }
      });
      
      // Check item collection - more precise collision detection
      // Use a for loop instead of forEach to safely handle removal during iteration
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Calculate actual hitboxes for turtle and item with tighter bounds
        const turtleHitbox = {
          left: turtleX + 8, // Tighter inset for more precise collision
          right: turtleX + TURTLE_SIZE - 8,
          top: turtleY + 8,
          bottom: turtleY + TURTLE_SIZE - 8
        };
        
        const itemHitbox = {
          left: item.x + 3,
          right: item.x + ITEM_SIZE - 3,
          top: item.y + 3,
          bottom: item.y + ITEM_SIZE - 3
        };
        
        // Check if hitboxes overlap (true collision)
        const collision = 
          turtleHitbox.left < itemHitbox.right &&
          turtleHitbox.right > itemHitbox.left &&
          turtleHitbox.top < itemHitbox.bottom &&
          turtleHitbox.bottom > itemHitbox.top;
        
        // Only collect this specific item if collision is true
        if (collision) {
          setScore(prev => prev + 10);
          // Remove only this specific item by its index
          setItems(prevItems => {
            const newItems = [...prevItems];
            newItems.splice(i, 1);
            return newItems;
          });
          // Only collect one item per frame to prevent multiple collections
          break;
        }
      }
      
      // Mario catches turtle
      if (marioX + MARIO_SIZE > turtleX) {
        setGameOver(true);
      }
      
      // Turtle reaches end
      if (turtleX > LEVEL_END) {
        setWin(true);
      }
    }, 30); // faster interval for smoother animation
    
    return () => clearInterval(interval);
  }, [turtleX, turtleY, marioX, obstacles, items, gameOver, win, jumpVelocity]);

  // Animate modal when game over, bomb collision, or win
  useEffect(() => {
    if (gameOver || bombCollision || win) {
      Animated.sequence([
        Animated.timing(modalAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      modalAnimation.setValue(0);
    }
  }, [gameOver, bombCollision, win]);

  // Controls - improved to handle jumping over obstacles
  const moveLeft = () => {
    if (gameOver || win) return;
    const nextX = Math.max(turtleX - 30, 0);
    
    // Only block if on ground AND colliding with stone
    // If jumping (not on ground), allow movement
    const stoneBlocking = obstacles.some(obs => 
      (obs.type === 'rock' || obs.type === 'log') &&
      Math.abs(nextX - obs.x) < OBSTACLE_SIZE * 0.8 && // Reduced collision box
      Math.abs(turtleY - obs.y) < OBSTACLE_SIZE * 0.8 && // Reduced collision box
      turtleY >= TURTLE_GROUND_Y - 5 // Only when on or very near ground
    );
    
    if (!stoneBlocking) {
      setTurtleX(nextX);
    }
  };

  const moveRight = () => {
    if (gameOver || win) return;
    // Remove width limit to allow movement throughout the entire map
    const nextX = turtleX + 30;
    
    // Only block if on ground AND colliding with stone
    // If jumping (not on ground), allow movement
    const stoneBlocking = obstacles.some(obs => 
      (obs.type === 'rock' || obs.type === 'log') &&
      Math.abs(nextX - obs.x) < OBSTACLE_SIZE * 0.7 && // Further reduced collision box
      Math.abs(turtleY - obs.y) < OBSTACLE_SIZE * 0.7 && // Further reduced collision box
      turtleY >= TURTLE_GROUND_Y - 10 // More forgiving ground detection
    );
    
    if (!stoneBlocking) {
      setTurtleX(nextX);
    }
  };

  const jump = () => {
    if (gameOver || win) return;
    // Allow jumping if on or very near ground
    if (!jumpRef.current && turtleY >= TURTLE_GROUND_Y - 5) {
      jumpRef.current = true;
      setJumping(true);
      setTimeout(() => setJumping(false), 350);
    }
  };

  const restart = () => {
    setTurtleX(20);
    setTurtleY(TURTLE_GROUND_Y);
    setMarioX(-60); // Reset Mario further left
    setJumping(false);
    setJumpVelocity(0);
    setScore(0);
    setGameOver(false);
    setBombCollision(false); // Reset bomb collision state
    setWin(false);
    setObstacles(initialObstacles);
    setItems(initialItems);
  };

  // Camera logic: center the turtle, don't limit camera movement
  const CAMERA_WIDTH = width - 220; // game area width
  let cameraOffset = Math.max(0, turtleX - CAMERA_WIDTH / 2);

  useEffect(() => {
    if (win) {
      (async () => {
        try {
          await ApiService.addPoints(score);
          await ApiService.markLevelComplete(10);
          // Removed collectCard call
        } catch (err) {
          console.error('Failed to update backend:', err);
        }
      })();
    }
  }, [win]);

  return (
    <View style={styles.landscapeContainer}>
      {/* Static background image */}
      <Image source={rescueZoneImg} style={styles.staticBackground} resizeMode="cover" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.exitButton}>
          <Text style={styles.exitButtonText}>EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🐢 Turtle Rescue: Escape from Mario!</Text>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <View style={styles.leftPanel}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.pixelBtn} onPress={jump}>
            <Text style={styles.pixelBtnText}>▲</Text>
          </TouchableOpacity>
          <View style={styles.horizontalControls}>
            <TouchableOpacity style={styles.pixelBtn} onPress={moveLeft}>
              <Text style={styles.pixelBtnText}>◀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pixelBtn} onPress={moveRight}>
              <Text style={styles.pixelBtnText}>▶</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Game Area */}
      <View style={styles.gameArea}>
        <View style={{
          width: LEVEL_END + 100,
          height: height - 70,
          position: 'absolute',
          left: -cameraOffset,
          top: 0,
        }}>
          {/* Ground */}
          <View style={[styles.ground, { 
            top: GROUND_Y + TURTLE_SIZE,
            width: LEVEL_END + 200 // Ensure ground extends beyond level end
          }]} />
          {/* Turtle */}
          <Image source={turtleImg} style={[styles.turtle, { left: turtleX, top: turtleY }]} />
          {/* Mario (enemy) */}
          <Image source={marioImg} style={[styles.mario, { left: marioX, top: GROUND_Y }]} />
          {/* Obstacles */}
          {obstacles.map((obs, idx) => {
            if (obs.type === 'rock' || obs.type === 'log') {
              return (
                <Image
                  key={idx}
                  source={stoneImg}
                  style={[styles.obstacle, { left: obs.x, top: obs.y, width: OBSTACLE_SIZE, height: OBSTACLE_SIZE, resizeMode: 'contain' }]}
                />
              );
            } else if (obs.type === 'pit') {
              return (
                <Image
                  key={idx}
                  source={bombImg}
                  style={[styles.obstacle, { left: obs.x, top: obs.y, width: OBSTACLE_SIZE, height: OBSTACLE_SIZE, resizeMode: 'contain' }]}
                />
              );
            } else {
              return null;
            }
          })}
          {/* Items (eco-items) */}
          {items.map((item, idx) => (
            <Image
              key={idx}
              source={ecoItemImg}
              style={[
                styles.item,
                {
                  left: item.x,
                  top: item.y,
                },
              ]}
            />
          ))}
          {/* End (pond) */}
          <View style={[styles.pond, { left: LEVEL_END, top: GROUND_Y }]} />
        </View>
      </View>
      
      {/* Game Over Modal (Mario caught turtle) */}
      <Modal
        visible={gameOver && !bombCollision} // Only show when game over but not bomb collision
        transparent={true}
        animationType="none"
        onRequestClose={() => setGameOver(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [
                  { scale: modalAnimation },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>GAME OVER</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Oh no! Mario caught the turtle!</Text>
              <Image source={marioImg} style={styles.modalImage} />
            </View>
            <TouchableOpacity style={styles.pixelBtn} onPress={restart}>
              <Text style={styles.pixelBtnText}>RESTART</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Bomb Collision Modal */}
      <Modal
        visible={bombCollision}
        transparent={true}
        animationType="none"
        onRequestClose={() => setBombCollision(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [
                  { scale: modalAnimation },
                ],
                borderColor: '#FF4500', // Orange-red border for bomb modal
              },
            ]}
          >
            <View style={[styles.modalHeader, { backgroundColor: '#FF4500' }]}>
              <Text style={styles.modalTitle}>BOOM!</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>Oops! You stepped on a bomb!</Text>
              <Image source={bombImg} style={styles.modalImage} />
              <Text style={[styles.modalText, { fontSize: 14, color: '#FFA07A' }]}>Be careful to jump over bombs next time!</Text>
            </View>
            <TouchableOpacity style={[styles.pixelBtn, { backgroundColor: '#FF4500', borderColor: '#333' }]} onPress={restart}>
              <Text style={styles.pixelBtnText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Win Modal */}
      <Modal
        visible={win}
        transparent={true}
        animationType="none"
        onRequestClose={() => setWin(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                transform: [
                  { scale: modalAnimation },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>YOU WIN!</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>You rescued the turtle! 🐢🏆</Text>
              <Text style={styles.modalScoreText}>Final Score: {score}</Text>
              <Image source={turtleImg} style={styles.modalImage} />
            </View>
            <TouchableOpacity style={styles.pixelBtn} onPress={restart}>
              <Text style={styles.pixelBtnText}>PLAY AGAIN</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  landscapeContainer: {
    flex: 1,
    flexDirection: 'row',
    // backgroundColor: '#e0f7fa', // Removed to show background image
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    backgroundColor: 'rgba(0,0,0,0.10)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 20,
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#333',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flex: 1,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 16,
    color: '#FFB703',
    backgroundColor: '#222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  leftPanel: {
    width: 220,
    height: height,
    backgroundColor: '#e0f7fa',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 70,
    paddingHorizontal: 10,
    borderRightWidth: 2,
    borderColor: '#0097a7',
  },
  controls: {
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  btn: {
    backgroundColor: '#80cbc4',
    padding: 12,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 100,
    left: 10,
    right: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 30,
    borderRadius: 20,
    zIndex: 10,
  },
  endText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    height: height,
    // backgroundColor: '#b2ebf2', // Removed to show background image
    borderWidth: 2,
    borderColor: '#0097a7',
    position: 'relative',
    overflow: 'hidden',
    marginLeft: 0,
    marginTop: 70,
  },
  ground: {
    position: 'absolute',
    width: LEVEL_END + 100,
    height: 30,
    backgroundColor: '#4caf50',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  turtle: {
    position: 'absolute',
    width: TURTLE_SIZE,
    height: TURTLE_SIZE,
    // backgroundColor: 'green', // removed for image
    borderRadius: TURTLE_SIZE / 2,
    resizeMode: 'contain',
  },
  mario: {
    position: 'absolute',
    width: MARIO_SIZE,
    height: MARIO_SIZE,
    // backgroundColor: 'red', // removed for image
    borderRadius: MARIO_SIZE / 2,
    resizeMode: 'contain',
  },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
    borderRadius: 8, // default, overridden for stone
    // borderWidth and borderColor overridden for stone
  },
  item: {
    position: 'absolute',
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    // backgroundColor: 'green', // removed for image
    borderRadius: ITEM_SIZE / 2,
    resizeMode: 'contain',
  },
  pond: {
    position: 'absolute',
    width: 50,
    height: 30,
    backgroundColor: '#2196f3',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  staticBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  pixelBtn: {
    backgroundColor: '#FFD700',
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 0, // Square for pixel look
    borderWidth: 4,
    borderColor: '#333',
    borderBottomWidth: 8, // Thicker bottom border for 3D effect
    borderRightWidth: 8, // Thicker right border for 3D effect
    minWidth: 50,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pixelBtnText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Add new modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#333',
    borderWidth: 4,
    borderColor: '#FFD700',
    borderRadius: 0, // Square corners for 8-bit look
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#FFD700',
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'monospace',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  modalScoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginVertical: 10,
    fontFamily: 'monospace',
  },
  modalImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginVertical: 10,
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
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
