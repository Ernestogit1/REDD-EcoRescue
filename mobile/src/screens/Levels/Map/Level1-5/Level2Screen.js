import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import audioService from '../../../../services/audio.service';
import ApiService from '../../../../services/api.service';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Game assets
const SQUIRREL_SIZE = 50; // Slightly smaller size for better visibility
const NUT_SIZE = 60;
const OBSTACLE_SIZE = 60;
const POWERUP_SIZE = 65;
const GAME_SPEED = 3; // Base speed of falling objects

// Define obstacle types
const OBSTACLE_TYPES = [
  { 
    id: 'cola', 
    image: require('../../../../../assets/images/levels/Level2/cola-obstacle.png'),
    damage: 1 // how many lives this takes away
  },
  { 
    id: 'trash', 
    image: require('../../../../../assets/images/levels/Level2/donut-obstacle.png'),
    damage: 1
  },
  { 
    id: 'branch', 
    image: require('../../../../../assets/images/levels/Level2/poison-obstacle.png'),
    damage: 2 // more dangerous obstacle
  }
];

// Define power-up types
const POWERUP_TYPES = [
  {
    id: 'shield',
    image: require('../../../../../assets/images/levels/Level2/shield-powerup.png'),
    duration: 5000, // 5 seconds
    effect: 'Makes the squirrel invulnerable to obstacles'
  },
  {
    id: 'magnet',
    image: require('../../../../../assets/images/levels/Level2/magnet-powerup.png'),
    duration: 7000, // 7 seconds
    effect: 'Attracts nuts to the squirrel'
  },
  {
    id: 'extraLife',
    image: require('../../../../../assets/images/levels/Level2/life-powerup.png'),
    duration: 0, // instant effect
    effect: 'Gives an extra life'
  }
];

export default function Level2Screen() {
  const navigation = useNavigation();
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [difficulty, setDifficulty] = useState(1); // Difficulty level
  const [powerups, setPowerups] = useState([]);
  const [activePowerups, setActivePowerups] = useState({});
  const powerupSpawnTimeRef = useRef(0);
  
  // Game elements
  const [squirrelPosition, setSquirrelPosition] = useState({ 
    x: screenWidth / 2 - SQUIRREL_SIZE / 2, 
    y: screenHeight - 200  // Position squirrel higher up on the screen for visibility
  });
  const [nuts, setNuts] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  
  // Animation refs
  const gameLoopRef = useRef(null);
  const lastUpdateTimeRef = useRef(Date.now());
  const nutSpawnTimeRef = useRef(0);
  const obstacleSpawnTimeRef = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Track if user is currently dragging
  const [isDragging, setIsDragging] = useState(false);
  
  // Reference to the game area for touch positioning
  const gameAreaRef = useRef(null);
  
  // Initialize game
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);
  
  // Game loop
  useEffect(() => {
    if (gameStarted && !gameOver && !paused) {
      const gameLoop = () => {
        const now = Date.now();
        const dt = (now - lastUpdateTimeRef.current) / 16.67; // normalize to ~60fps
        lastUpdateTimeRef.current = now;
        
        // Update game state
        updateGameState(dt);
        
        // Schedule next frame
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      };
      
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, paused]);
  
  // Handle game over
  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      handleGameOver(false);
    }
  }, [lives]);

  // Check for difficulty increase based on score
  useEffect(() => {
    // Increase difficulty as score increases
    if (score >= 200 && difficulty < 2) {
      setDifficulty(2);
    } else if (score >= 500 && difficulty < 3) {
      setDifficulty(3);
    } else if (score >= 1000 && difficulty < 4) {
      setDifficulty(4);
    }
    
    // Check for win condition
    if (score >= 200 && !gameOver) {
      handleGameOver(true);
    }
  }, [score]);
  
  // Handle active powerups
  useEffect(() => {
    const powerupTimers = {};
    
    // Clear any existing timers when component unmounts or game ends
    return () => {
      Object.values(powerupTimers).forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameOver(false);
    setNuts([]);
    setObstacles([]);
    setPowerups([]);
    setActivePowerups({});
    setDifficulty(1);
    setSquirrelPosition({ 
      x: screenWidth / 2 - SQUIRREL_SIZE / 2, 
      y: screenHeight - 200  // Position squirrel higher up on the screen for visibility
    });
    lastUpdateTimeRef.current = Date.now();
    nutSpawnTimeRef.current = 0;
    obstacleSpawnTimeRef.current = 0;
    powerupSpawnTimeRef.current = 0;
    setGameStarted(true);
  };
  
  // Update game state with continuous collision detection
  const updateGameState = (dt) => {
    // Calculate spawn rates and speeds based on difficulty
    const nutSpawnRate = 60 - (difficulty * 5); // Spawn nuts faster as difficulty increases
    const obstacleSpawnRate = 120 - (difficulty * 10); // Spawn obstacles faster as difficulty increases
    const gameSpeed = GAME_SPEED + (difficulty * 0.5); // Increase game speed with difficulty
    
    // Spawn nuts
    nutSpawnTimeRef.current += dt;
    if (nutSpawnTimeRef.current > nutSpawnRate) { // spawn rate based on difficulty
      const newNut = {
        id: Date.now(),
        x: Math.random() * (screenWidth - NUT_SIZE),
        y: -NUT_SIZE,
      };
      setNuts(prev => [...prev, newNut]);
      nutSpawnTimeRef.current = 0;
    }
    
    // Spawn obstacles
    obstacleSpawnTimeRef.current += dt;
    if (obstacleSpawnTimeRef.current > obstacleSpawnRate) { // spawn rate based on difficulty
      // Higher chance of dangerous obstacles at higher difficulties
      let obstaclePool = [...OBSTACLE_TYPES];
      if (difficulty >= 3) {
        // Add extra dangerous obstacles to the pool at higher difficulties
        obstaclePool = [...obstaclePool, ...obstaclePool.filter(o => o.damage > 1)];
      }
      
      // Randomly select an obstacle type
      const obstacleType = obstaclePool[Math.floor(Math.random() * obstaclePool.length)];
      
      const newObstacle = {
        id: Date.now() + 1000,
        x: Math.random() * (screenWidth - OBSTACLE_SIZE),
        y: -OBSTACLE_SIZE,
        type: obstacleType.id,
        damage: obstacleType.damage
      };
      setObstacles(prev => [...prev, newObstacle]);
      obstacleSpawnTimeRef.current = 0;
    }
    
    // Update positions and check collisions separately
    // First, update nut positions
    setNuts(prev => {
      if (prev.length === 0) return prev;
      
      return prev.map(nut => ({
        ...nut,
        y: nut.y + gameSpeed * dt
      }));
    });
    
    // Update obstacle positions
    setObstacles(prev => {
      if (prev.length === 0) return prev;
      
      return prev.map(obstacle => ({
        ...obstacle,
        y: obstacle.y + (gameSpeed * 0.8) * dt // obstacles fall slightly slower
      }));
    });
    
    // Update powerup positions
    setPowerups(prev => {
      if (prev.length === 0) return prev;
      
      return prev.map(powerup => ({
        ...powerup,
        y: powerup.y + gameSpeed * dt
      }));
    });
    
    // Now check for collisions after positions are updated
    // Instead of using setTimeout, we'll use requestAnimationFrame to ensure we're not in a render cycle
    requestAnimationFrame(() => {
      checkCollisionsAfterUpdate();
    });
    
    // Update nuts with magnet powerup effect
    if (activePowerups.magnet) {
      setNuts(prev => prev.map(nut => {
        // Move nuts toward the squirrel if magnet is active
        const dx = squirrelPosition.x + SQUIRREL_SIZE/2 - (nut.x + NUT_SIZE/2);
        const dy = squirrelPosition.y + SQUIRREL_SIZE/2 - (nut.y + NUT_SIZE/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only attract nuts within a certain range
        if (distance < 200) {
          const speed = 2 * gameSpeed * dt;
          const moveX = (dx / distance) * speed;
          const moveY = (dy / distance) * speed;
          
          return {
            ...nut,
            x: nut.x + moveX,
            y: nut.y + moveY
          };
        }
        
        return nut;
      }));
    }
    
    // Clean up objects that have fallen off screen
    cleanupOffscreenObjects();
  };
  
  // Function to check collisions after positions are updated
  const checkCollisionsAfterUpdate = () => {
    // Check for collisions with nuts
    setNuts(prev => {
      if (prev.length === 0) return prev;
      
      let scoreIncrease = 0;
      const remainingNuts = prev.filter(nut => {
        // Check if nut is off screen
        if (nut.y >= screenHeight) {
          return false;
        }
        
        // Check for collision with squirrel
        const collected = checkCollision(
          nut.x, nut.y, NUT_SIZE, NUT_SIZE,
          squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
        );
        
        if (collected) {
          scoreIncrease += 10;
          playSoundEffect('collect');
          return false;
        }
        
        return true;
      });
      
      // Update score
      if (scoreIncrease > 0) {
        requestAnimationFrame(() => {
          setScore(s => s + scoreIncrease);
        });
      }
      
      return remainingNuts;
    });
    
    // Check for collisions with powerups
    setPowerups(prev => {
      if (prev.length === 0) return prev;
      
      const collectedPowerups = [];
      const remainingPowerups = prev.filter(powerup => {
        // Check if powerup is off screen
        if (powerup.y >= screenHeight) {
          return false;
        }
        
        // Check for collision with squirrel
        const collected = checkCollision(
          powerup.x, powerup.y, POWERUP_SIZE, POWERUP_SIZE,
          squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
        );
        
        if (collected) {
          activatePowerup(powerup.type);
          playSoundEffect('powerup');
          return false;
        }
        
        return true;
      });
      
      return remainingPowerups;
    });
    
    // Check for collisions with obstacles
    // Only if not shielded
    if (!activePowerups.shield) {
      setObstacles(prev => {
        if (prev.length === 0) return prev;
        
        let damageTotal = 0;
        const remainingObstacles = prev.filter(obstacle => {
          // Check if obstacle is off screen
          if (obstacle.y >= screenHeight) {
            return false;
          }
          
          // Check for collision with squirrel
          const hit = checkCollision(
            obstacle.x, obstacle.y, OBSTACLE_SIZE, OBSTACLE_SIZE,
            squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
          );
          
          if (hit) {
            damageTotal += (obstacle.damage || 1);
            playSoundEffect('hit');
            return false;
          }
          
          return true;
        });
        
        // Apply damage
        if (damageTotal > 0) {
          requestAnimationFrame(() => {
            setLives(l => Math.max(0, l - damageTotal));
          });
        }
        
        return remainingObstacles;
      });
    } else {
      // If shield is active
      setObstacles(prev => {
        if (prev.length === 0) return prev;
        
        const remainingObstacles = prev.filter(obstacle => {
          // Check if obstacle is off screen
          if (obstacle.y >= screenHeight) {
            return false;
          }
          
          // Check for collision with squirrel
          const hit = checkCollision(
            obstacle.x, obstacle.y, OBSTACLE_SIZE, OBSTACLE_SIZE,
            squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
          );
          
          if (hit) {
            playSoundEffect('deflect');
            return false;
          }
          
          return true;
        });
        
        return remainingObstacles;
      });
    }
  };
  
  // Function to clean up objects that have fallen off screen
  const cleanupOffscreenObjects = () => {
    setNuts(prev => prev.filter(nut => nut.y < screenHeight));
    setObstacles(prev => prev.filter(obstacle => obstacle.y < screenHeight));
    setPowerups(prev => prev.filter(powerup => powerup.y < screenHeight));
  };

  // Add additional collision check on squirrel movement
  const handleGesture = (event) => {
    if (gameStarted && !gameOver && !paused) {
      const { state, absoluteX } = event.nativeEvent;
      
      // Start or continue dragging
      if (state === State.BEGAN || state === State.ACTIVE) {
        setIsDragging(true);
        
        // Center the squirrel on the touch position
        let newX = absoluteX - (SQUIRREL_SIZE / 2);
        
        // Keep squirrel within screen bounds
        newX = Math.max(0, Math.min(screenWidth - SQUIRREL_SIZE, newX));
        
        // Update squirrel position
        setSquirrelPosition(prev => ({
          ...prev,
          x: newX,
        }));
        
        // Check for collisions immediately after moving the squirrel
        // This is safe because we're not in a render or effect
        checkCollisionsAfterMovement();
      } 
      // End dragging
      else if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
        setIsDragging(false);
      }
    }
  };

  // Function to check collisions after squirrel movement
  const checkCollisionsAfterMovement = () => {
    // Check for collisions with nuts
    setNuts(prev => {
      if (prev.length === 0) return prev;
      
      let scoreIncrease = 0;
      const remainingNuts = prev.filter(nut => {
        const collected = checkCollision(
          nut.x, nut.y, NUT_SIZE, NUT_SIZE,
          squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
        );
        
        if (collected) {
          scoreIncrease += 10;
          return false;
        }
        
        return true;
      });
      
      if (scoreIncrease > 0) {
        // Update score outside of render using requestAnimationFrame
        requestAnimationFrame(() => {
          setScore(s => s + scoreIncrease);
          playSoundEffect('collect');
        });
      }
      
      return remainingNuts;
    });
    
    // Check for collisions with powerups
    setPowerups(prev => {
      if (prev.length === 0) return prev;
      
      const collectedPowerups = [];
      const remainingPowerups = prev.filter(powerup => {
        const collected = checkCollision(
          powerup.x, powerup.y, POWERUP_SIZE, POWERUP_SIZE,
          squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
        );
        
        if (collected) {
          collectedPowerups.push(powerup.type);
          return false;
        }
        
        return true;
      });
      
      if (collectedPowerups.length > 0) {
        // Handle powerup activation outside of render using requestAnimationFrame
        requestAnimationFrame(() => {
          playSoundEffect('powerup');
          collectedPowerups.forEach(type => activatePowerup(type));
        });
      }
      
      return remainingPowerups;
    });
    
    // Check for collisions with obstacles
    if (!activePowerups.shield) {
      setObstacles(prev => {
        if (prev.length === 0) return prev;
        
        let damageTotal = 0;
        const remainingObstacles = prev.filter(obstacle => {
          const hit = checkCollision(
            obstacle.x, obstacle.y, OBSTACLE_SIZE, OBSTACLE_SIZE,
            squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
          );
          
          if (hit) {
            damageTotal += (obstacle.damage || 1);
            return false;
          }
          
          return true;
        });
        
        if (damageTotal > 0) {
          // Update lives outside of render using requestAnimationFrame
          requestAnimationFrame(() => {
            setLives(l => Math.max(0, l - damageTotal));
            playSoundEffect('hit');
          });
        }
        
        return remainingObstacles;
      });
    } else {
      // If shield is active
      setObstacles(prev => {
        if (prev.length === 0) return prev;
        
        let hitCount = 0;
        const remainingObstacles = prev.filter(obstacle => {
          const hit = checkCollision(
            obstacle.x, obstacle.y, OBSTACLE_SIZE, OBSTACLE_SIZE,
            squirrelPosition.x, squirrelPosition.y, SQUIRREL_SIZE, SQUIRREL_SIZE
          );
          
          if (hit) {
            hitCount++;
            return false;
          }
          
          return true;
        });
        
        if (hitCount > 0) {
          requestAnimationFrame(() => {
            playSoundEffect('deflect');
          });
        }
        
        return remainingObstacles;
      });
    }
  };

  // Highly reactive collision detection with expanded hitboxes
  const checkCollision = (x1, y1, w1, h1, x2, y2, w2, h2) => {
    // Expand the squirrel's hitbox for more reactive collision detection
    // This makes it easier to catch objects
    // IMPORTANT: We assume x2,y2,w2,h2 is ALWAYS the squirrel in our collision checks
    const expandSquirrel = 1.3; // 30% larger hitbox for squirrel
    
    // Apply expansion only if x2,y2,w2,h2 is the squirrel
    // (assuming squirrel is always the second object in our collision checks)
    const expandedW2 = w2 * expandSquirrel;
    const expandedH2 = h2 * expandSquirrel;
    const expandedX2 = x2 - ((expandedW2 - w2) / 2);
    const expandedY2 = y2 - ((expandedH2 - h2) / 2);
    
    // Use expanded hitbox for collision detection
    return (
      x1 < expandedX2 + expandedW2 &&
      x1 + w1 > expandedX2 &&
      y1 < expandedY2 + expandedH2 &&
      y1 + h1 > expandedY2
    );
  };

  // Handle direct touch on game area
  const handleTouch = (event) => {
    if (gameStarted && !gameOver && !paused) {
      const { locationX } = event.nativeEvent;
      
      // Center the squirrel on the touch position
      let newX = locationX - (SQUIRREL_SIZE / 2);
      
      // Keep squirrel within screen bounds
      newX = Math.max(0, Math.min(screenWidth - SQUIRREL_SIZE, newX));
      
      setSquirrelPosition(prev => ({
        ...prev,
        x: newX,
      }));

      // Use setTimeout to ensure state update completes before checking collisions
      setTimeout(() => {
        checkCollisionsAfterMovement();
      }, 0);
    }
  };
  
  const handleGameOver = (isWin) => {
    setGameOver(true);

    // Calculate the final score to send
    const finalScore = score; // If you want to add bonuses, do it here

    // Always add points, win or lose
    ApiService.addPoints(finalScore).catch((err) => {
      console.error('Failed to add points:', err);
    });
    // No collectCard call here

    if (isWin) {
      playSoundEffect('win');
      setTimeout(() => {
        Alert.alert(
          "Level Complete!",
          `Great job! You collected enough nuts!\nScore: ${finalScore}`,
          [
            { text: "Continue", onPress: () => navigation.goBack() }
          ]
        );
      }, 1000);
    } else {
      playSoundEffect('lose');
      setTimeout(() => {
        Alert.alert(
          "Game Over",
          `You ran out of lives. \nFinal Score: ${finalScore}`,
          [
            { text: "Continue", onPress: () => navigation.goBack() }
          ]
        );
      }, 1000);
    }
  };
  
  const togglePause = () => {
    setPaused(p => !p);
  };
  
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  const playSoundEffect = (type) => {
    // Implement different sound effects
    try {
      switch(type) {
        case 'collect':
          audioService.playSound('collect');
          break;
        case 'hit':
          audioService.playSound('hit');
          break;
        case 'powerup':
          audioService.playSound('powerup');
          break;
        case 'deflect':
          audioService.playSound('deflect');
          break;
        case 'win':
          audioService.playSound('win');
          break;
        case 'lose':
          audioService.playSound('lose');
          break;
        default:
          // No sound
          break;
      }
    } catch (error) {
      console.log('Sound effect error:', error);
    }
  };
  
  const activatePowerup = (powerupType) => {
    const powerupInfo = POWERUP_TYPES.find(p => p.id === powerupType);
    
    if (!powerupInfo) return;
    
    // Handle instant effects
    if (powerupType === 'extraLife') {
      setLives(l => Math.min(l + 1, 5)); // Cap at 5 lives
      return;
    }
    
    // Set the powerup as active
    setActivePowerups(prev => ({
      ...prev,
      [powerupType]: true
    }));
    
    // Set a timer to deactivate the powerup
    if (powerupInfo.duration > 0) {
      setTimeout(() => {
        setActivePowerups(prev => ({
          ...prev,
          [powerupType]: false
        }));
      }, powerupInfo.duration);
    }
  };
  
  // Render game elements
  const renderSquirrel = () => {
    return (
      <View
        style={[
          styles.squirrel,
          { left: squirrelPosition.x, top: squirrelPosition.y },
          { zIndex: 10 } // Add zIndex to ensure squirrel appears above other elements
        ]}
      >
        {/* Tail */}
        <View style={styles.squirrelTail} />
        
        {/* Simple colored shape for the squirrel */}
        <View style={styles.squirrelShape}>
          {/* Eyes */}
          <View style={styles.squirrelEye} />
          <View style={[styles.squirrelEye, { right: 10 }]} />
          {/* Nose */}
          <View style={styles.squirrelNose} />
        </View>
        
        {/* Shield effect */}
        {activePowerups.shield && (
          <View style={styles.shieldEffect} />
        )}
      </View>
    );
  };
  
  const renderNuts = () => {
    return nuts.map(nut => (
      <View
        key={nut.id}
        style={[
          styles.nut,
          { left: nut.x, top: nut.y }
        ]}
      >
        <Image 
          source={require('../../../../../assets/images/levels/Level2/nut.png')} 
          style={styles.nutImage} 
          resizeMode="contain"
        />
      </View>
    ));
  };
  
  const renderObstacles = () => {
    return obstacles.map(obstacle => {
      // Find the obstacle type to get the correct image
      const obstacleType = OBSTACLE_TYPES.find(type => type.id === obstacle.type) || OBSTACLE_TYPES[0];
      
      return (
        <View
          key={obstacle.id}
          style={[
            styles.obstacle,
            { left: obstacle.x, top: obstacle.y }
          ]}
        >
          <Image 
            source={obstacleType.image} 
            style={styles.obstacleImage} 
            resizeMode="contain"
          />
        </View>
      );
    });
  };
  
  const renderPowerups = () => {
    return powerups.map(powerup => {
      const powerupInfo = POWERUP_TYPES.find(p => p.id === powerup.type) || POWERUP_TYPES[0];
      
      return (
        <View
          key={powerup.id}
          style={[
            styles.powerup,
            { left: powerup.x, top: powerup.y }
          ]}
        >
          <Image 
            source={powerupInfo.image} 
            style={styles.powerupImage} 
            resizeMode="contain"
          />
        </View>
      );
    });
  };
  
  const renderLives = () => {
    const livesArray = [];
    for (let i = 0; i < lives; i++) {
      livesArray.push(
        <View key={`life-${i}`} style={styles.lifeIcon}>
          <Ionicons name="heart" size={14} color="#FF6B6B" />
        </View>
      );
    }
    return livesArray;
  };
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#1A3C40', '#0D1B1E']}
          style={styles.background}
        >
          {/* Game Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← EXIT</Text>
            </TouchableOpacity>
            
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>NUT COLLECTOR</Text>
              <Text style={styles.levelText}>LEVEL 2</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>SCORE</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LIVES</Text>
                <View style={styles.livesContainer}>
                  {renderLives()}
                </View>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LEVEL</Text>
                <Text style={styles.statValue}>{difficulty}</Text>
              </View>
            </View>
          </View>
          
          {/* Game Area */}
          <PanGestureHandler
            onGestureEvent={handleGesture}
            onHandlerStateChange={handleGesture}
            minDist={0}
            avgTouches={false}
          >
            <Animated.View 
              ref={gameAreaRef}
              style={[
                styles.gameArea,
                { opacity: fadeAnim }
              ]}
              onTouchStart={handleTouch}
              onTouchMove={handleTouch}
            >
              {!gameStarted ? (
                <TouchableOpacity 
                  style={styles.startButton}
                  onPress={startGame}
                >
                  <LinearGradient
                    colors={['#52B69A', '#1A759F']}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>START GAME</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <>
                  {renderSquirrel()}
                  {renderNuts()}
                  {renderObstacles()}
                  {renderPowerups()}
                  
                  {/* Game instructions overlay at the start */}
                  {gameStarted && !isDragging && score === 0 && (
                    <View style={styles.touchInstructions}>
                      <Text style={styles.touchInstructionsText}>
                        Touch and drag to move the squirrel
                      </Text>
                    </View>
                  )}
                  
                  {/* Active powerup indicators */}
                  <View style={styles.powerupIndicators}>
                    {activePowerups.shield && (
                      <View style={styles.activeIndicator}>
                        <Ionicons name="shield" size={16} color="#FFD700" />
                      </View>
                    )}
                    {activePowerups.magnet && (
                      <View style={styles.activeIndicator}>
                        <Ionicons name="magnet" size={16} color="#FFD700" />
                      </View>
                    )}
                  </View>
                  
                  {/* Game Controls - Positioned in right corner with column layout */}
                  <View style={styles.controlsContainer}>
                    {gameStarted && !gameOver && (
                      <TouchableOpacity 
                        style={styles.controlButton}
                        onPress={togglePause}
                      >
                        <LinearGradient
                          colors={['#52B69A', '#1A759F']}
                          style={styles.controlButtonGradient}
                        >
                          <Ionicons name={paused ? "play" : "pause"} size={14} color="#FFF" />
                        </LinearGradient>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.controlButton}
                      onPress={() => {
                        // Toggle sound
                        audioService.toggleMusic();
                      }}
                    >
                      <LinearGradient
                        colors={['#52B69A', '#1A759F']}
                        style={styles.controlButtonGradient}
                      >
                        <Ionicons name="volume-medium" size={14} color="#FFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  
                  {paused && (
                    <View style={styles.pauseOverlay}>
                      <Text style={styles.pauseText}>PAUSED</Text>
                      <TouchableOpacity 
                        style={styles.resumeButton}
                        onPress={togglePause}
                      >
                        <Text style={styles.resumeButtonText}>RESUME</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </Animated.View>
          </PanGestureHandler>
          
          {/* Remove the bottom controls section since we moved it to the game area */}
          
          {/* Game Instructions */}
          {!gameStarted && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>HOW TO PLAY</Text>
              <Text style={styles.instructionsText}>• Drag left and right to move the squirrel</Text>
              <Text style={styles.instructionsText}>• Collect nuts to score points</Text>
              <Text style={styles.instructionsText}>• Avoid falling obstacles</Text>
              <Text style={styles.instructionsText}>• Watch out for poison - they're more dangerous!</Text>
              <Text style={styles.instructionsText}>• Collect power-ups for special abilities</Text>
              <Text style={styles.instructionsText}>• Collect 200 points to win!</Text>
            </View>
          )}
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  gameInfo: {
    alignItems: 'center',
    marginLeft: 80,
  },
  gameTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 16,
    marginBottom: 5,
  },
  levelText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statLabel: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 8,
  },
  statValue: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 14,
  },
  livesContainer: {
    flexDirection: 'row',
  },
  lifeIcon: {
    marginHorizontal: 2,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  squirrel: {
    position: 'absolute',
    width: SQUIRREL_SIZE,
    height: SQUIRREL_SIZE,
    zIndex: 10, // Ensure squirrel is above other elements
  },
  squirrelShape: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B4513', // Brown color for squirrel
    borderRadius: SQUIRREL_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5D2906',
  },
  squirrelTail: {
    position: 'absolute',
    width: SQUIRREL_SIZE / 2,
    height: SQUIRREL_SIZE / 1.5,
    backgroundColor: '#8B4513',
    borderRadius: SQUIRREL_SIZE / 4,
    right: -10,
    top: -10,
    transform: [{ rotate: '-45deg' }],
    borderWidth: 2,
    borderColor: '#5D2906',
    zIndex: -1,
  },
  squirrelEye: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    top: 20,
    left: 10,
  },
  squirrelNose: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: 'black',
    borderRadius: 5,
    top: 40,
  },
  nut: {
    position: 'absolute',
    width: NUT_SIZE,
    height: NUT_SIZE,
  },
  nutImage: {
    width: '100%',
    height: '100%',
  },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_SIZE,
    height: OBSTACLE_SIZE,
  },
  obstacleImage: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  controlButton: {
    marginHorizontal: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  controlButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  startButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    width: 150,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  startButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  startButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 24,
    marginBottom: 20,
  },
  resumeButton: {
    backgroundColor: '#52B69A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  resumeButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 12,
  },
  instructionsContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: 'rgba(26, 60, 64, 0.8)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  instructionsTitle: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionsText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFF',
    fontSize: 8,
    marginBottom: 5,
  },
  powerup: {
    position: 'absolute',
    width: POWERUP_SIZE,
    height: POWERUP_SIZE,
  },
  powerupImage: {
    width: '100%',
    height: '100%',
  },
  shieldEffect: {
    position: 'absolute',
    width: SQUIRREL_SIZE + 10,
    height: SQUIRREL_SIZE + 10,
    borderRadius: (SQUIRREL_SIZE + 10) / 2,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    top: -5,
    left: -5,
  },
  powerupIndicators: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  activeIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  touchInstructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  touchInstructionsText: {
    fontFamily: 'PressStart2P_400Regular',
    color: '#FFD700',
    fontSize: 10,
    textAlign: 'center',
  },
  
  // Updated control styles for right corner column layout
  controlsContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  controlButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
