// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanResult, StorageData } from '../types';

class StorageService {
  private static readonly KEYS = {
    SCAN_HISTORY: 'pic_a_fruit_scan_history',
    IS_FIRST_TIME: 'pic_a_fruit_is_first_time',
    SETTINGS: 'pic_a_fruit_settings',
  };

  /**
   * Save scan result to history
   */
  async saveScanResult(scanResult: ScanResult): Promise<void> {
    try {
      const history = await this.getScanHistory();
      const updatedHistory = [scanResult, ...history];
      
      // Limit to 50 most recent scans
      const limitedHistory = updatedHistory.slice(0, 50);
      
      await AsyncStorage.setItem(
        StorageService.KEYS.SCAN_HISTORY,
        JSON.stringify(limitedHistory)
      );
      
      console.log('✅ Scan result saved to storage');
    } catch (error) {
      console.error('❌ Error saving scan result:', error);
      throw error;
    }
  }

  /**
   * Get scan history
   */
  async getScanHistory(): Promise<ScanResult[]> {
    try {
      const historyJson = await AsyncStorage.getItem(StorageService.KEYS.SCAN_HISTORY);
      
      if (historyJson) {
        const history = JSON.parse(historyJson);
        return Array.isArray(history) ? history : [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error getting scan history:', error);
      return [];
    }
  }

  /**
   * Clear scan history
   */
  async clearScanHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(StorageService.KEYS.SCAN_HISTORY);
      console.log('✅ Scan history cleared');
    } catch (error) {
      console.error('❌ Error clearing scan history:', error);
      throw error;
    }
  }

  /**
   * Check if this is first time opening app
   */
  async isFirstTime(): Promise<boolean> {
    try {
      const isFirstTime = await AsyncStorage.getItem(StorageService.KEYS.IS_FIRST_TIME);
      return isFirstTime === null; // null means first time
    } catch (error) {
      console.error('❌ Error checking first time:', error);
      return true; // Default to true if error
    }
  }

  /**
   * Mark that user has completed onboarding
   */
  async setNotFirstTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(StorageService.KEYS.IS_FIRST_TIME, 'false');
      console.log('✅ First time flag set to false');
    } catch (error) {
      console.error('❌ Error setting first time flag:', error);
      throw error;
    }
  }

  /**
   * Get app settings
   */
  async getSettings(): Promise<any> {
    try {
      const settingsJson = await AsyncStorage.getItem(StorageService.KEYS.SETTINGS);
      
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      
      // Default settings
      return {
        notifications: true,
        autoSave: true,
        theme: 'light'
      };
    } catch (error) {
      console.error('❌ Error getting settings:', error);
      return {};
    }
  }

  /**
   * Save app settings
   */
  async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        StorageService.KEYS.SETTINGS,
        JSON.stringify(settings)
      );
      console.log('✅ Settings saved');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Clear all app data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        StorageService.KEYS.SCAN_HISTORY,
        StorageService.KEYS.IS_FIRST_TIME,
        StorageService.KEYS.SETTINGS,
      ]);
      console.log('✅ All app data cleared');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
      throw error;
    }
  }

  /**
   * Get storage size info
   */
  async getStorageInfo(): Promise<{ keys: string[]; size: number }> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const appKeys = allKeys.filter(key => key.startsWith('pic_a_fruit_'));
      
      let totalSize = 0;
      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        keys: appKeys,
        size: totalSize
      };
    } catch (error) {
      console.error('❌ Error getting storage info:', error);
      return { keys: [], size: 0 };
    }
  }
}

export default new StorageService();