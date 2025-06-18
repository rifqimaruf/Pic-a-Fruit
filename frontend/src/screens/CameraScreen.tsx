// src/screens/CameraScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Zap, ZapOff, Image as ImageIcon, RotateCcw } from 'lucide-react-native';
import { RootStackParamList, ScanResult } from '../types';
import apiService from '../services/apiService';
import storageService from '../utils/storage';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

interface Props {
  navigation: CameraScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      try {
        // Request camera permissions
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        
        if (status !== 'granted') {
          Alert.alert(
            'Izin Kamera Diperlukan',
            'Aplikasi ini memerlukan akses kamera untuk scan buah. Silakan berikan izin di pengaturan.',
            [
              { text: 'Nanti', onPress: () => navigation.goBack() },
              { text: 'Buka Pengaturan', onPress: () => {
                // You can add logic to open app settings here
                navigation.goBack();
              }}
            ]
          );
        }
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current || isLoading || isProcessing) {
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('📷 Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      console.log('✅ Picture taken:', photo.uri);
      
      // Navigate to processing screen
      navigation.navigate('Processing');
      setIsProcessing(true);
      
      // Process the image
      await processImage(photo.uri);
      
    } catch (error) {
      console.error('❌ Error taking picture:', error);
      Alert.alert('Error', 'Gagal mengambil foto. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      console.log('📁 Opening image picker...');
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Galeri Diperlukan',
          'Aplikasi memerlukan akses galeri untuk memilih foto buah.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('✅ Image selected:', result.assets[0].uri);
        
        setIsLoading(true);
        navigation.navigate('Processing');
        setIsProcessing(true);
        
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar dari galeri.');
    }
  };

  const processImage = async (imageUri: string) => {
    try {
      console.log('🔄 Processing image:', imageUri);
      
      // Call API service
      const result = await apiService.predictFruit(imageUri);
      console.log('✅ Prediction result:', result);
      
      // Save to storage
      await storageService.saveScanResult(result);
      
      // Navigate to result screen
      navigation.replace('Result', { scanResult: result });
      
    } catch (error: any) {
      console.error('❌ Processing error:', error);
      
      // Navigate back to camera and show error
      navigation.goBack();
      
      Alert.alert(
        'Error Pemrosesan',
        error.message || 'Gagal memproses gambar. Pastikan server AI berjalan dan koneksi internet tersedia.',
        [
          { text: 'Coba Lagi', onPress: () => {} },
          { text: 'Kembali', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(flashMode === FlashMode.off ? FlashMode.on : FlashMode.off);
  };

  const flipCamera = () => {
    setCameraType(cameraType === CameraType.back ? CameraType.front : CameraType.back);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.permissionText}>Meminta izin kamera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.noPermissionIcon}>📷</Text>
        <Text style={styles.noPermissionTitle}>Akses Kamera Diperlukan</Text>
        <Text style={styles.noPermissionText}>
          Aplikasi ini memerlukan akses kamera untuk scan buah dan mendeteksi tingkat kesegarannya.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => Camera.requestCameraPermissionsAsync()}
        >
          <Text style={styles.permissionButtonText}>Berikan Izin Kamera</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backToHomeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backToHomeText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Camera 
        style={styles.camera} 
        type={cameraType} 
        flashMode={flashMode}
        ref={cameraRef}
      >
        {/* Overlay Frame */}
        <View style={styles.overlay}>
          <View style={styles.focusFrame}>
            <View style={styles.frameCorners}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.focusText}>
              Posisikan buah di dalam area ini
            </Text>
          </View>
        </View>
      </Camera>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity 
          style={styles.topButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Scan Buah</Text>
        
        <TouchableOpacity 
          style={styles.topButton}
          onPress={toggleFlash}
        >
          {flashMode === FlashMode.on ? (
            <Zap size={24} color="#FFD700" />
          ) : (
            <ZapOff size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Gallery Button */}
        <TouchableOpacity 
          style={styles.sideButton}
          onPress={pickImage}
          disabled={isLoading}
        >
          <ImageIcon size={24} color="#fff" />
          <Text style={styles.sideButtonText}>Galeri</Text>
        </TouchableOpacity>

        {/* Shutter Button */}
        <TouchableOpacity 
          style={[
            styles.shutterButton, 
            (isLoading || isProcessing) && styles.shutterDisabled
          ]}
          onPress={takePicture}
          disabled={isLoading || isProcessing}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </TouchableOpacity>

        {/* Flip Camera Button */}
        <TouchableOpacity 
          style={styles.sideButton}
          onPress={flipCamera}
          disabled={isLoading}
        >
          <RotateCcw size={24} color="#fff" />
          <Text style={styles.sideButtonText}>Putar</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          💡 Pastikan pencahayaan cukup dan buah terlihat jelas
        </Text>
      </View>

      {/* Loading Overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Memproses gambar...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  frameCorners: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  focusText: {
    color: '#fff',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    maxWidth: 220,
    fontWeight: '500',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  topButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 22,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  sideButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 60,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ddd',
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
  },
  instructions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  instructionText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
    fontWeight: '500',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 40,
  },
  permissionText: {
    marginTop: 20,
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  noPermissionIcon: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5,
  },
  noPermissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  noPermissionText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backToHomeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backToHomeText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CameraScreen;