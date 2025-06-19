// src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { Camera, User, Wifi, WifiOff } from 'lucide-react-native';
import { RootStackParamList, ScanResult } from '../types';
import storageService from '../utils/storage';
import apiService from '../services/apiService';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadData();
      checkApiConnection();
    }, [])
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      const history = await storageService.getScanHistory();
      setScanHistory(history);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkApiConnection = async () => {
    try {
      const connected = await apiService.testConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await checkApiConnection();
    setRefreshing(false);
  };

  const handleScanPress = () => {
    if (isConnected === false) {
      Alert.alert(
        'Koneksi Bermasalah',
        'Tidak dapat terhubung ke server AI. Pastikan server berjalan dan koneksi internet tersedia.\n\nTetap lanjutkan?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Lanjutkan', onPress: () => navigation.navigate('Camera') }
        ]
      );
    } else {
      navigation.navigate('Camera');
    }
  };

  const handleHistoryItemPress = (item: ScanResult) => {
    navigation.navigate('Result', { scanResult: item });
  };

  const renderHistoryCard = (item: ScanResult) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.historyCard}
      onPress={() => handleHistoryItemPress(item)}
    >
      <Text style={styles.historyEmoji}>{item.image}</Text>
      <Text style={styles.historyFruit}>{item.fruit}</Text>
      <Text style={[
        styles.historyResult,
        { 
          color: item.result === 'Matang' ? '#4CAF50' : 
                item.result === 'Busuk' ? '#F44336' : '#FF9800'
        }
      ]}>
        {item.result}
      </Text>
      <Text style={styles.historyDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  const renderConnectionStatus = () => {
    if (isConnected === null) return null;
    
    return (
      <View style={[
        styles.connectionStatus,
        { backgroundColor: isConnected ? '#E8F5E8' : '#FFEBEE' }
      ]}>
        {isConnected ? (
          <Wifi size={16} color="#4CAF50" />
        ) : (
          <WifiOff size={16} color="#F44336" />
        )}
        <Text style={[
          styles.connectionText,
          { color: isConnected ? '#4CAF50' : '#F44336' }
        ]}>
          {isConnected ? 'Terhubung ke Server AI' : 'Server AI Tidak Tersedia'}
        </Text>
      </View>
    );
  };

  const renderEmptyHistory = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📷</Text>
      <Text style={styles.emptyTitle}>Belum Ada Riwayat Scan</Text>
      <Text style={styles.emptyText}>
        Mulai scan buah pertama Anda untuk melihat riwayat di sini
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo! 👋</Text>
          <Text style={styles.subGreeting}>Ayo scan buahmu hari ini</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <User size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Connection Status */}
      {renderConnectionStatus()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Fun Fact Card */}
        <View style={styles.factCard}>
          <Text style={styles.factTitle}>💡 Tahukah Kamu?</Text>
          <Text style={styles.factText}>
            Alpukat yang matang akan terasa sedikit empuk saat ditekan dengan lembut. 
            Warna kulitnya juga berubah dari hijau terang menjadi hijau gelap atau kehitaman.
          </Text>
        </View>

        {/* Recent Scans Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scan Terakhir</Text>
            {scanHistory.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {scanHistory.length === 0 ? (
            renderEmptyHistory()
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.historyScrollContainer}
            >
              {scanHistory.slice(0, 5).map(renderHistoryCard)}
            </ScrollView>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips Scan yang Baik</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>☀️</Text>
              <Text style={styles.tipText}>Pastikan pencahayaan cukup</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>🎯</Text>
              <Text style={styles.tipText}>Fokuskan pada buah saja</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipEmoji}>📏</Text>
              <Text style={styles.tipText}>Jarak ideal 15-30 cm</Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Scan Button */}
      <TouchableOpacity 
        style={[
          styles.scanButton,
          { opacity: isConnected === false ? 0.7 : 1 }
        ]}
        onPress={handleScanPress}
      >
        <Camera size={28} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>Scan Buah</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  factCard: {
    backgroundColor: '#FFF9C4',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  factTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 8,
  },
  factText: {
    fontSize: 14,
    color: '#F57F17',
    lineHeight: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  historyScrollContainer: {
    paddingRight: 20,
  },
  historyCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 110,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  historyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  historyFruit: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  historyResult: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  tipsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipEmoji: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  scanButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default HomeScreen;