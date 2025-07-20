import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions, Image as RNImage, findNodeHandle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

const PET_VIDEOS = {
  1: require('../../../assets/images/pets/rabbitt.mp4'),
  2: require('../../../assets/images/pets/squirell.mp4'),
  3: require('../../../assets/images/pets/duckk.mp4'),
  4: require('../../../assets/images/pets/butterflyy.mp4'),
  5: require('../../../assets/images/pets/frogg.mp4'),
  6: require('../../../assets/images/pets/redfoxx.mp4'),
  7: require('../../../assets/images/pets/racconn.mp4'),
  8: require('../../../assets/images/pets/owll.mp4'),
  9: require('../../../assets/images/pets/beaverr.mp4'),
  10: require('../../../assets/images/pets/turtlee.mp4'),
  11: require('../../../assets/images/pets/leopardd.mp4'),
  12: require('../../../assets/images/pets/orangutann.mp4'),
  13: require('../../../assets/images/pets/seaturtlee.mp4'),
  14: require('../../../assets/images/pets/baldeaglee.mp4'),
  15: require('../../../assets/images/pets/bluedartt.mp4'),
};

const ANIMAL_NAMES = {
  1: 'Rabbit', 2: 'Squirrel', 3: 'Duck', 4: 'Butterfly', 5: 'Frog',
  6: 'Red Fox', 7: 'Raccoon', 8: 'Owl', 9: 'Beaver', 10: 'Turtle',
  11: 'Snow Leopard', 12: 'Orangutan', 13: 'Sea Turtle', 14: 'Bald Eagle', 15: 'Poison Dart Frog',
};

const FOOD_IMAGES = [
  require('../../../assets/images/levels/Level2/nut.png'),
  require('../../../assets/images/levels/Level3/bug.png'),
  require('../../../assets/images/levels/Level5/fly.png'),
];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function PetGifScreen({ route, navigation }) {
  const { levelId } = route.params;
  const video = PET_VIDEOS[levelId];
  const animalName = ANIMAL_NAMES[levelId] || 'Animal';
  const [fed, setFed] = useState(false);
  const [foodIndex, setFoodIndex] = useState(Math.floor(Math.random() * FOOD_IMAGES.length));
  const foodImage = FOOD_IMAGES[foodIndex];

  // Drag state
  const pan = useRef(new Animated.ValueXY()).current;
  const [dragging, setDragging] = useState(false);
  const foodScale = useRef(new Animated.Value(1)).current;
  const foodOpacity = useRef(new Animated.Value(1)).current;

  // Video position for drop detection
  const videoDropRef = useRef(null);
  const [videoLayout, setVideoLayout] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  // Helper to get absolute position of video drop area
  const updateVideoLayout = () => {
    if (videoDropRef.current) {
      const handle = findNodeHandle(videoDropRef.current);
      if (handle) {
        videoDropRef.current.measureInWindow((x, y, width, height) => {
          setVideoLayout({ x, y, width, height });
        });
      }
    }
  };

  React.useEffect(() => {
    setTimeout(updateVideoLayout, 500);
  }, []);

  const handleVideoLayout = () => {
    setTimeout(updateVideoLayout, 100);
  };

  const resetFood = () => {
    pan.setValue({ x: 0, y: 0 });
    foodScale.setValue(1);
    foodOpacity.setValue(1);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true);
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x, dy: pan.y },
      ], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        setDragging(false);
        pan.flattenOffset();
        if (videoLayout) {
          const { pageX, pageY } = e.nativeEvent;
          const { x, y, width, height } = videoLayout;
          setDebugInfo(`Drop: (${pageX.toFixed(1)}, ${pageY.toFixed(1)})\nVideo: (${x.toFixed(1)}, ${y.toFixed(1)}, ${width.toFixed(1)}, ${height.toFixed(1)})`);
          if (
            pageX >= x && pageX <= x + width &&
            pageY >= y && pageY <= y + height
          ) {
            Animated.parallel([
              Animated.timing(foodScale, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
              }),
              Animated.timing(foodOpacity, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
              })
            ]).start(() => {
              setFed(true);
              setTimeout(() => {
                setFed(false);
                setFoodIndex(Math.floor(Math.random() * FOOD_IMAGES.length));
                resetFood();
              }, 1200);
            });
            return;
          }
        }
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={32} color="#FFD700" />
      </TouchableOpacity>
      <View style={styles.content}>
        <View
          ref={videoDropRef}
          onLayout={handleVideoLayout}
          style={[styles.videoWrapper, styles.dropArea]}
        >
          {video && (
            <Video
              source={video}
              style={styles.video}
              resizeMode="contain"
              isLooping
              shouldPlay
            />
          )}
          {fed && (
            <Text style={styles.fedText}>Yum! 😋</Text>
          )}
        </View>
        <Text style={styles.animalName}>{animalName}</Text>
        {/* Debug info for drop detection */}
        {debugInfo ? (
          <Text style={{ color: 'yellow', fontSize: 12, marginTop: 8, textAlign: 'center' }}>{debugInfo}</Text>
        ) : null}
      </View>
      {/* Food icon at the bottom */}
      <Animated.View
        style={[
          styles.food,
          {
            transform: [
              ...pan.getTranslateTransform(),
              { scale: foodScale },
            ],
            opacity: foodOpacity,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <RNImage source={foodImage} style={{ width: 60, height: 60 }} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    width: 340, // larger for easier drop
    height: 340,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#FFD700',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  dropArea: {
    borderStyle: 'dashed',
    borderColor: '#FFD700',
    borderWidth: 4,
    backgroundColor: 'rgba(255,255,0,0.08)',
  },
  video: {
    width: 320,
    height: 320,
    borderRadius: 20,
  },
  animalName: {
    color: '#FFD700',
    fontSize: 22,
    fontFamily: 'PressStart2P_400Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  food: {
    position: 'absolute',
    bottom: 40,
    left: screenWidth / 2 - 30,
    zIndex: 20,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fedText: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
}); 