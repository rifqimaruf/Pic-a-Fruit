// src/screens/ProcessingScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';

const ProcessingScreen: React.FC = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Start rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Animation Container */}
        <View style={styles.animationContainer}>
          <Animated.View 
            style={[
              styles.searchIcon,
              { transform: [{ rotate }] }
            ]}
          >
            <Text style={styles.searchEmoji}>🔍</Text>
          </Animated.View>
          
          <View style={styles.fruitContainer}>
            <Text style={styles.fruitEmoji}>🥭</Text>
          </View>
        </View>
        
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Sedang menganalisis buahmu...</Text>
          <Text style={styles.subtitle}>AI sedang mengecek tingkat kematangan</Text>
          
          {/* Progress Dots */}
          <View style={styles.progressContainer}>
            <ProcessingDots />
          </View>
          
          <Text style={styles.tips}>
            💡 Proses ini biasanya memakan waktu 5-10 detik
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

// Component for animated dots
const ProcessingDots: React.FC = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const createDotAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.loop(
        Animated.parallel([
          createDotAnimation(dot1Anim, 0),
          createDotAnimation(dot2Anim, 200),
          createDotAnimation(dot3Anim, 400),
        ])
      ).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  animationContainer: {
    position: 'relative',
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    zIndex: 2,
    left: -30,
    top: -10,
  },
  searchEmoji: {
    fontSize: 40,
  },
  fruitContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fruitEmoji: {
    fontSize: 80,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    marginBottom: 30,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
  },
  tips: {
    fontSize: 14,
    color: '#E8F5E8',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default ProcessingScreen;