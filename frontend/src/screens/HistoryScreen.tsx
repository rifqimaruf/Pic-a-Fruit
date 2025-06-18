// src/screens/HistoryScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Search, Trash2, Filter, Calendar } from 'lucide-react-native';
import { RootStackParamList, ScanResult } from '../types';
import storageService from '../utils/storage';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Matang' | 'Busuk' | 'Belum Matang'>('all');

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // Filter history when search query or filter type changes
  useEffect(() => {
    filterHistory();
  }, [scanHistory, searchQuery, filterType]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const history = await storageService.getScanHistory();
      setScanHistory(history);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Gagal memuat riwayat scan.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const filterHistory = () => {
    let filtered = scanHistory;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.fruit.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.result.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.result === filterType);
    }

    setFilteredHistory(filtered);
  };

  const handleItemPress = (item: ScanResult) => {
    navigation.navigate('Result', { scanResult: item });
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Hapus Semua Riwayat',
      'Apakah Anda yakin ingin menghapus semua riwayat scan? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearScanHistory();
              setScanHistory([]);
              setFilteredHistory([]);
              Alert.alert('Berhasil', 'Semua riwayat telah dihapus.');
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus riwayat.');
            }
          }
        }
      ]
    );
  };

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

  const renderFilterButton = (type: typeof filterType, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterType === type && styles.activeFilterButton
      ]}
      onPress={() => setFilterType(type)}
    >
      <Text style={[
        styles.filterButtonText,
        filterType === type && styles.activeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: ScanResult }) => (
    <TouchableOpacity 
      style={styles.historyItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemImageContainer}>
        <Text style={styles.itemEmoji}>{item.image}</Text>
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemFruit}>{item.fruit}</Text>
        <Text style={[
          styles.itemResult,
          { color: getResultColor(item.result) }
        ]}>
          {item.result} ({item.confidence}%)
        </Text>
        <View style={styles.itemMetadata}>
          <Calendar size={12} color="#999" />
          <Text style={styles.itemDate}>{item.date}</Text>
        </View>
      </View>
      
      <View style={styles.itemArrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {searchQuery || filterType !== 'all' ? '🔍' : '📱'}
      </Text>
      <Text style={styles.emptyTitle}>
        {searchQuery || filterType !== 'all' ? 'Tidak Ada Hasil' : 'Belum Ada Riwayat'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery || filterType !== 'all' 
          ? 'Tidak ditemukan riwayat yang sesuai dengan pencarian Anda'
          : 'Mulai scan buah pertama Anda untuk melihat riwayat di sini'
        }
      </Text>
      {!searchQuery && filterType === 'all' && (
        <TouchableOpacity 
          style={styles.scanNowButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.scanNowText}>Scan Sekarang</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari buah atau hasil..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        {renderFilterButton('all', 'Semua')}
        {renderFilterButton('Matang', 'Matang')}
        {renderFilterButton('Belum Matang', 'Belum Matang')}
        {renderFilterButton('Busuk', 'Busuk')}
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredHistory.length} hasil
          {searchQuery && ` untuk "${searchQuery}"`}
        </Text>
        
        {scanHistory.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Trash2 size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.title}>Riwayat Scan</Text>
        
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderHistoryItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          filteredHistory.length === 0 && styles.emptyListContainer
        ]}
      />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemFruit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemResult: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  itemArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
  },
  arrowText: {
    fontSize: 20,
    color: '#CCC',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  scanNowButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanNowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;