import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth } = Dimensions.get('window');

export default function MediumMapScreen() {
    const navigation = useNavigation();
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [unlockedLevels, setUnlockedLevels] = useState(1); // Only first level unlocked initially
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const mapAnim = useRef(new Animated.Value(0)).current;
    const levelAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;
    const backButtonAnim = useRef(new Animated.Value(0)).current;

    // Level data
    const levels = [
        {
            id: 6,
            name: 'Level 6',
            stars: 0,
            unlocked: true,
        },
        {
            id: 7,
            name: 'Level 7',
            stars: 0,
            unlocked: true,
        },
        {
            id: 8,
            name: 'Level 8',
            stars: 0,
            unlocked: true,
        },
        {
            id: 9,
            name: 'Level 9',
            stars: 0,
            unlocked: true,
        },
        {
            id: 10,
            name: 'Level 10',
            stars: 0,
            unlocked: true,
        },
    ];

    useEffect(() => {
        // Title and map animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(mapAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(backButtonAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Staggered level node animations
        const levelAnimations = levelAnims.map((anim, index) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: 500 + index * 200,
                useNativeDriver: true,
            })
        );

        Animated.stagger(200, levelAnimations).start();
    }, []);

    const handleLevelPress = (level) => {
        if (!level.unlocked) return;
        
        setSelectedLevel(level.id);
        // Add a small delay for the selection animation
        setTimeout(() => {
            // Navigate to the level details screen
            navigation.navigate('LevelDetails', { 
                difficulty: 'Medium', 
                level: level.id 
            });
        }, 300);
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                    opacity: mapAnim,
                    transform: [
                        { scale: mapAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1]
                        })}
                    ]
                }
            ]}
        >
            <ImageBackground 
                source={require('../../../../assets/images/levels/dark-aerial-view.jpg')} 
                style={styles.mapBackground}
                resizeMode="cover"
            >
                {/* Title overlay */}
                <Animated.View style={[styles.titleOverlay, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>MEDIUM MODE</Text>
                </Animated.View>
                
                {/* Back Button - 8-bit style */}
                <Animated.View 
                    style={[
                        styles.backButtonContainer,
                        {
                            opacity: backButtonAnim,
                            transform: [
                                { translateX: backButtonAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-50, 0]
                                })}
                            ]
                        }
                    ]}
                >
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={handleGoBack}
                    >
                        <Text style={styles.backButtonText}>RETURN</Text>
                    </TouchableOpacity>
                </Animated.View>
                
                {/* Level 6 */}
                <Animated.View
                    style={[
                        styles.levelNodeContainer,
                        styles.level6Container,
                        {
                            opacity: levelAnims[0],
                            transform: [
                                { scale: levelAnims[0].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1]
                                })}
                            ]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.levelNode,
                            levels[0].unlocked ? styles.unlockedLevel : styles.lockedLevel,
                            selectedLevel === levels[0].id && styles.selectedLevel
                        ]}
                        onPress={() => handleLevelPress(levels[0])}
                        disabled={!levels[0].unlocked}
                    >
                        <Text style={styles.levelNumber}>{levels[0].id}</Text>
                    </TouchableOpacity>
                    
                    {levels[0].stars > 0 && (
                        <View style={styles.starsContainer}>
                            {[...Array(3)].map((_, starIndex) => (
                                <Image
                                    key={`star-${levels[0].id}-${starIndex}`}
                                    source={require('../../../../assets/images/levels/easy.png')}
                                    style={[
                                        styles.starIcon,
                                        starIndex < levels[0].stars ? styles.earnedStar : styles.unearnedStar
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </Animated.View>
                
                {/* Level 7 */}
                <Animated.View
                    style={[
                        styles.levelNodeContainer,
                        styles.level7Container,
                        {
                            opacity: levelAnims[1],
                            transform: [
                                { scale: levelAnims[1].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1]
                                })}
                            ]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.levelNode,
                            levels[1].unlocked ? styles.unlockedLevel : styles.lockedLevel,
                            selectedLevel === levels[1].id && styles.selectedLevel
                        ]}
                        onPress={() => handleLevelPress(levels[1])}
                        disabled={!levels[1].unlocked}
                    >
                        <Text style={styles.levelNumber}>{levels[1].id}</Text>
                    </TouchableOpacity>
                    
                    {levels[1].stars > 0 && (
                        <View style={styles.starsContainer}>
                            {[...Array(3)].map((_, starIndex) => (
                                <Image
                                    key={`star-${levels[1].id}-${starIndex}`}
                                    source={require('../../../../assets/images/levels/easy.png')}
                                    style={[
                                        styles.starIcon,
                                        starIndex < levels[1].stars ? styles.earnedStar : styles.unearnedStar
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </Animated.View>
                
                {/* Level 8 */}
                <Animated.View
                    style={[
                        styles.levelNodeContainer,
                        styles.level8Container,
                        {
                            opacity: levelAnims[2],
                            transform: [
                                { scale: levelAnims[2].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1]
                                })}
                            ]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.levelNode,
                            levels[2].unlocked ? styles.unlockedLevel : styles.lockedLevel,
                            selectedLevel === levels[2].id && styles.selectedLevel
                        ]}
                        onPress={() => handleLevelPress(levels[2])}
                        disabled={!levels[2].unlocked}
                    >
                        <Text style={styles.levelNumber}>{levels[2].id}</Text>
                    </TouchableOpacity>
                    
                    {levels[2].stars > 0 && (
                        <View style={styles.starsContainer}>
                            {[...Array(3)].map((_, starIndex) => (
                                <Image
                                    key={`star-${levels[2].id}-${starIndex}`}
                                    source={require('../../../../assets/images/levels/easy.png')}
                                    style={[
                                        styles.starIcon,
                                        starIndex < levels[2].stars ? styles.earnedStar : styles.unearnedStar
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </Animated.View>
                
                {/* Level 9 */}
                <Animated.View
                    style={[
                        styles.levelNodeContainer,
                        styles.level9Container,
                        {
                            opacity: levelAnims[3],
                            transform: [
                                { scale: levelAnims[3].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1]
                                })}
                            ]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.levelNode,
                            levels[3].unlocked ? styles.unlockedLevel : styles.lockedLevel,
                            selectedLevel === levels[3].id && styles.selectedLevel
                        ]}
                        onPress={() => handleLevelPress(levels[3])}
                        disabled={!levels[3].unlocked}
                    >
                        <Text style={styles.levelNumber}>{levels[3].id}</Text>
                    </TouchableOpacity>
                    
                    {levels[3].stars > 0 && (
                        <View style={styles.starsContainer}>
                            {[...Array(3)].map((_, starIndex) => (
                                <Image
                                    key={`star-${levels[3].id}-${starIndex}`}
                                    source={require('../../../../assets/images/levels/easy.png')}
                                    style={[
                                        styles.starIcon,
                                        starIndex < levels[3].stars ? styles.earnedStar : styles.unearnedStar
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </Animated.View>
                
                {/* Level 10 */}
                <Animated.View
                    style={[
                        styles.levelNodeContainer,
                        styles.level10Container,
                        {
                            opacity: levelAnims[4],
                            transform: [
                                { scale: levelAnims[4].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1]
                                })}
                            ]
                        }
                    ]}
                >
                    <TouchableOpacity
                        style={[
                            styles.levelNode,
                            levels[4].unlocked ? styles.unlockedLevel : styles.lockedLevel,
                            selectedLevel === levels[4].id && styles.selectedLevel
                        ]}
                        onPress={() => handleLevelPress(levels[4])}
                        disabled={!levels[4].unlocked}
                    >
                        <Text style={styles.levelNumber}>{levels[4].id}</Text>
                    </TouchableOpacity>
                    
                    {levels[4].stars > 0 && (
                        <View style={styles.starsContainer}>
                            {[...Array(3)].map((_, starIndex) => (
                                <Image
                                    key={`star-${levels[4].id}-${starIndex}`}
                                    source={require('../../../../assets/images/levels/easy.png')}
                                    style={[
                                        styles.starIcon,
                                        starIndex < levels[4].stars ? styles.earnedStar : styles.unearnedStar
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </Animated.View>
            </ImageBackground>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mapBackground: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    titleOverlay: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    title: {
        fontFamily: 'PressStart2P_400Regular',
        color: '#FFD700',
        fontSize: 18,
        textShadowColor: '#000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
        backgroundColor: 'rgba(19, 19, 19, 0.5)',
        padding: 10,
        borderRadius: 10,
    },
    levelNodeContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    // Individual level positions - adjust these values to position each level node
    level6Container: {
        left: '8.5%',
        top: '38%',
    },
    level7Container: {
        left: '35%',
        top: '30%',
    },
    level8Container: {
        left: '51.5%',
        top: '60%',
    },
    level9Container: {
        left: '70%',
        top: '45%',
    },
    level10Container: {
        left: '94%',
        top: '50%',
    },
    levelNode: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 2,
        elevation: 5,
    },
    unlockedLevel: {
        backgroundColor: '#8B4513',
        borderColor: '#FFD700',
    },
    lockedLevel: {
        backgroundColor: '#555',
        borderColor: '#888',
    },
    selectedLevel: {
        transform: [{ scale: 1.1 }],
        borderColor: '#FFF',
        shadowColor: '#FFD700',
        shadowOpacity: 0.8,
    },
    levelNumber: {
        fontFamily: 'PressStart2P_400Regular',
        color: '#FFF',
        fontSize: 16,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
        marginTop: 5,
    },
    starsContainer: {
        flexDirection: 'row',
        marginTop: 5,
    },
    starIcon: {
        width: 15,
        height: 15,
        marginHorizontal: 2,
    },
    earnedStar: {
        tintColor: '#FFD700',
    },
    unearnedStar: {
        tintColor: '#555',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
    },
    backButton: {
        backgroundColor: '#8B4513',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 3,
        borderColor: '#FFD700',
        // 8-bit style with sharp edges
        borderRadius: 0,
        // Pixelated shadow effect
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    backButtonText: {
        fontFamily: 'PressStart2P_400Regular',
        color: '#FFF',
        fontSize: 12,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 0,
    },
});
