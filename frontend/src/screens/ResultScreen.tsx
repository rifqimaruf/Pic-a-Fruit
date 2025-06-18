// src/screens/ResultScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { ArrowLeft, RotateCcw, Share2, Bookmark, Info } from 'lucide-react-native';
import { RootStackParamList, ScanResult } from '../types';

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
}

const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { scanResult } = route.params;
  
  if (!scanResult) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Data hasil scan tidak ditemukan</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Matang':
        return '#4CAF50';
      case 'Busuk':
        return '#F44336';
      case 'Belum Matang':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getBackgroundColor = (result: string) => {
    switch (result) {
      case 'Matang':
        return '#E8F5E8';
      case 'Busuk':
        return '#FFEBEE';
      case 'Belum Matang':
        return '#FFF3E0';
      default:
        return '#F5F5F5';
    }
  };

  const getResultMessage = (result: string) => {
    switch (result) {
      case 'Matang':
        return 'Buah ini sudah matang dan siap untuk dikonsumsi! 🎉';
      case 'Busuk':
        return 'Buah ini sudah busuk. Sebaiknya tidak dikonsumsi. ⚠️';
      case 'Belum Matang':
        return 'Buah ini belum matang. Tunggu beberapa hari lagi. ⏰';
      default:
        return 'Hasil analisis buah Anda.';
    }
  };

  const getTips = (result: string, fruit: string) => {
    const tips: { [key: string]: string[] } = {
      'Matang': [
        'Konsumsi segera untuk rasa terbaik',
        'Simpan di kulkas jika ingin tahan lebih lama',
        'Cocok untuk jus atau smoothie'
      ],
      'Busuk': [
        'Jangan dikonsumsi karena berbahaya',
        'Buang dengan benar untuk kompos',
        'Periksa buah lain di sekitarnya'
      ],
      'Belum Matang': [
        'Simpan di suhu ruang untuk mempercepat pematangan',
        'Letakkan bersama pisang untuk mempercepat',
        'Tunggu hingga warna dan tekstur berubah'
      ]
    };
    
    return tips[result] || ['Tidak ada tips khusus'];
  };

  const handleShare = async () => {
    try {
      const message = `Hasil scan buah menggunakan Pic a Fruit:\n\n🍎 ${scanResult.fruit}\n📊 Status: ${scanResult.result}\n🎯 Tingkat keyakinan: ${scanResult.confidence}%\n📅 ${scanResult.date}\n\nDownload Pic a Fruit untuk scan buah Anda!`;
      
      await Share.share({
        message,
        title: 'Hasil Scan Buah'
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Gagal berbagi hasil scan');
    }
  };

  const handleScanAgain = () => {
    navigation.navigate('Camera');
  };

  const handleViewTips = () => {
    const tips = getTips(scanResult.result, scanResult.fruit);
    Alert.alert(
      `Tips untuk ${scanResult.fruit} ${scanResult.result}`,
      tips.join('\n\n• '),
      [{ text: 'OK' }]
    );
  };

  const resultColor = getResultColor(scanResult.result);
  const backgroundColor = getBackgroundColor(scanResult.result);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={backgroundColor} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => navigation.navigate('Home')}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Hasil Scan</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleShare}
        >
          <Share2 size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Fruit Image */}
        <View style={styles.imageContainer}>
          <Text style={styles.fruitImage}>{scanResult.image}</Text>
        </View>

        {/* Result Info */}
        <View style={styles.resultContainer}>
          <Text style={[styles.resultStatus, { color: resultColor }]}>
            {scanResult.result.toUpperCase()}
          </Text>
          
          <Text style={styles.fruitName}>{scanResult.fruit}</Text>
          
          <Text style={styles.resultMessage}>
            {getResultMessage(scanResult.result)}
          </Text>
          
          {/* Confidence Score */}
          <View style={styles.confidenceContainer}>
            <View style={styles.confidenceHeader}>
              <Text style={styles.confidenceLabel}>Tingkat Keyakinan AI</Text>
              <Text style={styles.confidenceValue}>{scanResult.confidence}%</Text>
            </View>
            
            <View style={styles.confidenceBarContainer}>
              <View 
                style={[
                  styles.confidenceBar,
                  { 
                    width: `${scanResult.confidence}%`,
                    backgroundColor: resultColor 
                  }
                ]} 
              />
            </View>
            
            <Text style={styles.confidenceDescription}>
              {scanResult.confidence >= 90 ? 'Sangat Yakin' :
               scanResult.confidence >= 80 ? 'Yakin' :
               scanResult.confidence >= 70 ? 'Cukup Yakin' : 'Kurang Yakin'}
            </Text>
          </View>

          {/* Additional Info */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Scan:</Text>
              <Text style={styles.infoValue}>{scanResult.date}</Text>
            </View>
            
            {scanResult.originalLabel && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Deteksi AI:</Text>
                <Text style={styles.infoValue}>{scanResult.originalLabel}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: resultColor }]}
            onPress={handleViewTips}
          >
            <Info size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Tips Penyimpanan</Text>
          </TouchableOpacity>
          
          <View style={styles.secondaryButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleScanAgain}
            >
              <RotateCcw size={20} color={resultColor} />
              <Text style={[styles.secondaryButtonText, { color: resultColor }]}>
                Scan Lagi
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('History')}
            >
              <Bookmark size={20} color={resultColor} />
              <Text style={[styles.secondaryButtonText, { color: resultColor }]}>
                Lihat Riwayat
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  fruitImage: {
    fontSize: 120,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resultStatus: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fruitName: {
    fontSize: 24,
    color: '#333',
    marginBottom: 16,
    fontWeight: '600',
  },
  resultMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  confidenceContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  confidenceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  confidenceBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  infoContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.48,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultScreen;