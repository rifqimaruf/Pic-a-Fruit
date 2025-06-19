import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import apiService from '../services/apiService';
import storageService from '../utils/storage';

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;

interface Props {
  navigation: CameraScreenNavigationProp;
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const takePicture = async () => {
    if (!cameraRef.current || isLoading || isProcessing) return;

    try {
      setIsLoading(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        base64: false,
        skipProcessing: false,
      });

      navigation.navigate('Processing');
      setIsProcessing(true);
      await processImage(photo.uri);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Gagal mengambil foto. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        navigation.navigate('Processing');
        setIsProcessing(true);
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih gambar. Silakan coba lagi.');
    }
  };

  const processImage = async (uri: string) => {
    try {
      const result = await apiService.predictFruit(uri);
      await storageService.saveScanResult(result);
      navigation.replace('Result', { scanResult: result });
    } catch (error: any) {
      Alert.alert('Gagal memproses gambar', error.message || 'Periksa koneksi atau server.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  const toggleFacing = () => {
    setCameraType(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.permissionText}>Memeriksa izin kamera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.noPermissionIcon}>📷</Text>
        <Text style={styles.noPermissionTitle}>Akses Kamera Diperlukan</Text>
        <Text style={styles.noPermissionText}>
          Aplikasi ini memerlukan akses kamera untuk scan buah.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Berikan Izin Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        <CameraView 
          style={styles.camera} 
          facing={cameraType}
          ref={cameraRef}
        >
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={toggleFacing}>
              <AntDesign name="retweet" size={28} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.scanButton} 
              onPress={takePicture}
              disabled={isLoading || isProcessing}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <AntDesign name="camera" size={28} color="white" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => setShowCamera(false)}
            >
              <AntDesign name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.selectionContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <Text style={styles.selectionTitle}>Scan Buah</Text>
      <Text style={styles.selectionSubtitle}>Pilih metode untuk memindai buah</Text>
      
      <View style={styles.selectionOptions}>
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => setShowCamera(true)}
          disabled={isLoading || isProcessing}
        >
          <View style={styles.optionIconContainer}>
            <MaterialIcons name="photo-camera" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.optionText}>Ambil Foto</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={pickImage}
          disabled={isLoading || isProcessing}
        >
          <View style={styles.optionIconContainer}>
            <MaterialIcons name="photo-library" size={32} color="#4CAF50" />
          </View>
          <Text style={styles.optionText}>Pilih dari Galeri</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Batal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  selectionContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonRow: {
    flex: 1,
    flexDirection: 'row',
    margin: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Selection screen styles
  selectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  selectionOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  optionButton: {
    alignItems: 'center',
    width: '40%',
  },
  optionIconContainer: {
    backgroundColor: '#f0f9f0',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  cancelButton: {
    alignSelf: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    width: '80%',
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CameraScreen;