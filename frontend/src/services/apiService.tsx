// src/services/apiService.ts
import axios, { AxiosResponse } from 'axios';
import { PredictionResponse, ScanResult, FruitCondition, FruitInfo } from '../types';
import { Platform } from 'react-native';

// Konfigurasi API
class ApiConfig {
  // PENTING: Ganti IP sesuai dengan setup Anda
  private static readonly ENDPOINTS = {
    // Untuk Android Emulator
    ANDROID_EMULATOR: 'http://10.8.76.122:8000',
    // Untuk iOS Simulator  
    IOS_SIMULATOR: 'http://localhost:8000',
    // Untuk device fisik (ganti dengan IP komputer Anda)
    PHYSICAL_DEVICE: 'http://10.8.76.122:8000', // Sesuaikan IP ini!
    // Untuk development di komputer yang sama
    LOCAL: 'http://10.8.76.122'
  };

  static getBaseUrl(): string {
    // Auto-detect platform atau set manual
    if (__DEV__) { // __DEV__ adalah variabel global yang bernilai true saat dalam mode development
      
      // Jika OS adalah Android, cek apakah ini emulator atau perangkat fisik
      if (Platform.OS === 'android') {
        // Cek apakah perangkat adalah emulator. `isEmulator` mungkin tidak selalu ada,
        // jadi kita bisa mengandalkan `Brand` yang biasanya "generic" atau "google" untuk emulator.
        const isEmulator = Platform.constants.Brand.toLowerCase().startsWith('generic') || Platform.constants.Brand.toLowerCase() === 'google';
        
        if (isEmulator) {
          console.log('🤖 Running on Android Emulator. Using 10.0.2.2');
          return this.ENDPOINTS.ANDROID_EMULATOR;
        } else {
          console.log('📱 Running on Physical Android Device. Using local IP.');
          return this.ENDPOINTS.PHYSICAL_DEVICE;
        }
      } 
      // Untuk iOS
      else if (Platform.OS === 'ios') {
        // Untuk iOS, kita perlu cara lain untuk membedakan simulator dan device.
        // Tapi untuk sekarang, kita bisa asumsikan development di simulator.
        console.log('🍎 Running on iOS Simulator. Using localhost.');
        return this.ENDPOINTS.IOS_SIMULATOR;
      }
    }
    
    // Fallback untuk mode production atau platform lain
    console.log('🚀 Running in production or unknown environment. Using physical device URL.');
    return this.ENDPOINTS.PHYSICAL_DEVICE;
  }
}

class ApiService {
  private readonly baseURL: string;
  private readonly timeout: number = 30000; // 30 seconds

  constructor() {
    this.baseURL = ApiConfig.getBaseUrl();
    console.log(`🌐 API Base URL: ${this.baseURL}`);
  }

  /**
   * Test koneksi ke backend
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing API connection...');
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      
      console.log('✅ API connection successful:', response.data);
      return true;
    } catch (error) {
      console.error('❌ API connection failed:', error);
      return false;
    }
  }

  /**
   * Upload dan predict gambar buah
   */
  async predictFruit(imageUri: string): Promise<ScanResult> {
    try {
      console.log('📤 Uploading image for prediction...');
      
      // Buat FormData untuk upload
      const formData = new FormData();
      
      // Untuk React Native, format file upload
      const fileInfo = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `fruit_${Date.now()}.jpg`,
      };
      
      // @ts-ignore - React Native FormData handling
      formData.append('file', fileInfo);

      // Request ke backend
      const response: AxiosResponse<PredictionResponse> = await axios.post(
        `${this.baseURL}/predict`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: this.timeout,
        }
      );

      console.log('📥 Prediction response:', response.data);

      // Handle error response
      if (response.data.status === 'error') {
        throw new Error(response.data.message || response.data.error || 'Prediction failed');
      }

      // Process hasil prediksi
      const result = this.processPredictionResult(response.data);
      console.log('✅ Processed result:', result);
      
      return result;

    } catch (error: any) {
      console.error('❌ Prediction error:', error);
      
      // Handle berbagai jenis error
      if (error.response) {
        // Server response dengan error status
        const serverError = error.response.data;
        throw new Error(serverError.detail || serverError.message || 'Server error occurred');
      } else if (error.request) {
        // Network error
        throw new Error('Tidak dapat terhubung ke server. Pastikan server berjalan dan jaringan tersedia.');
      } else if (error.message) {
        // Error dari processing
        throw new Error(error.message);
      } else {
        // Unknown error
        throw new Error('Terjadi kesalahan tidak dikenal saat memproses gambar.');
      }
    }
  }

  /**
   * Process hasil prediksi dari backend menjadi ScanResult
   */
  private processPredictionResult(prediction: PredictionResponse): ScanResult {
    const fruitInfo = this.extractFruitInfo(prediction.label);
    
    return {
      id: Date.now(),
      fruit: fruitInfo.name,
      result: fruitInfo.condition,
      confidence: Math.round(prediction.confidence * 100),
      date: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      image: fruitInfo.emoji,
      originalLabel: prediction.label,
      timestamp: Date.now()
    };
  }

  /**
   * Extract informasi buah dari label prediksi
   */
  private extractFruitInfo(label: string): FruitInfo {
    const labelLower = label.toLowerCase();
    
    // Mapping buah
    const fruitMapping: { [key: string]: { name: string; emoji: string } } = {
      'apple': { name: 'Apel', emoji: '🍎' },
      'banana': { name: 'Pisang', emoji: '🍌' },
      'orange': { name: 'Jeruk', emoji: '🍊' },
      'rambutan': { name: 'Rambutan', emoji: '🔴' },
      // Tambah mapping buah lain sesuai model Anda
    };

    // Tentukan jenis buah
    let fruitInfo = { name: 'Buah', emoji: '🍇' }; // default
    for (const [key, value] of Object.entries(fruitMapping)) {
      if (labelLower.includes(key)) {
        fruitInfo = value;
        break;
      }
    }

    // Tentukan kondisi buah
    let condition: FruitCondition;
    if (labelLower.includes('fresh')) {
      condition = 'Matang';
    } else if (labelLower.includes('rotten')) {
      condition = 'Busuk';
    } else if (labelLower.includes('unripe')) {
      condition = 'Belum Matang';
    } else {
      // Fallback untuk label yang tidak standar
      condition = 'Matang';
    }

    return {
      name: fruitInfo.name,
      emoji: fruitInfo.emoji,
      condition
    };
  }

  /**
   * Get server info
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/`);
      return response.data;
    } catch (error) {
      console.error('Error getting server info:', error);
      throw error;
    }
  }
}

// Export singleton instance
export default new ApiService();