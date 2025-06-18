// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { RootStackParamList, OnboardingSlide } from '../types';
import storageService from '../utils/storage';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const onboardingData: OnboardingSlide[] = [
    {
      title: "Selamat Datang di Pic a Fruit!",
      description: "Aplikasi pintar untuk mengecek kesegaran buah dengan teknologi AI yang canggih",
      icon: "🎉"
    },
    {
      title: "Scan Buahmu",
      description: "Arahkan kamera ke buah dan biarkan AI kami menganalisis tingkat kematangan buah Anda",
      icon: "📱"
    },
    {
      title: "Dapatkan Info Kesegaran",
      description: "Ketahui apakah buahmu matang, busuk, atau belum matang dalam sekejap mata",
      icon: "✨"
    }
  ];

  const currentData = onboardingData[currentStep];

  const handleSkip = async () => {
    try {
      await storageService.setNotFirstTime();
      navigation.replace('Home');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  const handleNext = async () => {
    if (currentStep < onboardingData.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        await storageService.setNotFirstTime();
        navigation.replace('Home');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        Alert.alert('Error', 'Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Lewati</Text>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{currentData.icon}</Text>
        </View>
        
        <Text style={styles.title}>{currentData.title}</Text>
        <Text style={styles.description}>{currentData.description}</Text>
      </View>

      {/* Dots Indicator */}
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              index === currentStep ? styles.activeDot : styles.inactiveDot
            ]} 
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonsContainer}>
        {currentStep > 0 ? (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
            <ArrowLeft size={20} color="#666" />
            <Text style={styles.prevButtonText}>Sebelumnya</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.prevButton} />
        )}
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === onboardingData.length - 1 ? 'Mulai' : 'Selanjutnya'}
          </Text>
          <ArrowRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  icon: {
    fontSize: 100,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: '#E0E0E0',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  prevButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default OnboardingScreen;