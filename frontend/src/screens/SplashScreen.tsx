// src/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import storageService from '../utils/storage';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(async () => {
      try {
        const isFirstTime = await storageService.isFirstTime();
        
        if (isFirstTime) {
          navigation.replace('Onboarding');
        } else {
          navigation.replace('Home');
        }
      } catch (error) {
        console.error('Error checking first time:', error);
        // Default to onboarding if error
        navigation.replace('Onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation]);

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
        <Text style={styles.logo}>🥝</Text>
        <Text style={styles.title}>Fruit Lens</Text>
        <Text style={styles.subtitle}>Kesegaran dalam Genggaman</Text>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Memuat...</Text>
        </View>
      </Animated.View>
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
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    marginTop: 20,
  },
  loadingText: {
    color: '#E8F5E8',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SplashScreen;