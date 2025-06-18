// src/screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  HelpCircle, 
  Info, 
  Star, 
  Settings, 
  LogOut,
  Trash2,
  ExternalLink,
  ChevronRight 
} from 'lucide-react-native';
import { RootStackParamList } from '../types';
import storageService from '../utils/storage';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

interface MenuItem {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isDestructive?: boolean;
}

interface StorageInfo {
  keys: string[];
  size: number;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ keys: [], size: 0 });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // Load settings
      const settings = await storageService.getSettings();
      setNotificationsEnabled(settings.notifications ?? true);
      setAutoSaveEnabled(settings.autoSave ?? true);

      // Load scan history count
      const history = await storageService.getScanHistory();
      setScanCount(history.length);

      // Load storage info
      const info = await storageService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      const settings = await storageService.getSettings();
      await storageService.saveSettings({
        ...settings,
        notifications: value
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan pengaturan');
    }
  };

  const handleAutoSaveToggle = async (value: boolean) => {
    try {
      setAutoSaveEnabled(value);
      const settings = await storageService.getSettings();
      await storageService.saveSettings({
        ...settings,
        autoSave: value
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan pengaturan');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Hapus Semua Data',
      'Apakah Anda yakin ingin menghapus semua data aplikasi? Termasuk riwayat scan dan pengaturan. Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus Semua', 
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert(
                'Data Dihapus',
                'Semua data telah dihapus. Aplikasi akan restart.',
                [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      // Reset to onboarding
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Onboarding' }],
                      });
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus data');
            }
          }
        }
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rating Aplikasi',
      'Terima kasih telah menggunakan Pic a Fruit! Berikan rating di app store untuk membantu pengembangan aplikasi.',
      [
        { text: 'Nanti' },
        { text: 'Beri Rating', onPress: () => {
          // In production, you would open the app store
          Alert.alert('Info', 'Fitur ini akan membuka halaman app store');
        }}
      ]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Bantuan',
      'Butuh bantuan menggunakan aplikasi?\n\n• Pastikan pencahayaan cukup saat scan\n• Fokuskan kamera pada buah\n• Tunggu hingga proses selesai\n• Lihat tips pada hasil scan',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Tentang Pic a Fruit',
      'Pic a Fruit v1.0.0\n\nAplikasi AI untuk mendeteksi tingkat kematangan buah menggunakan teknologi computer vision.\n\nDikembangkan dengan ❤️ menggunakan React Native dan FastAPI.',
      [{ text: 'OK' }]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Kontak Pengembang',
      'Punya saran atau menemukan bug?\n\nHubungi kami di:\n📧 support@picafruit.com\n🐛 github.com/picafruit/issues',
      [
        { text: 'Batal' },
        { text: 'Buka Email', onPress: () => {
          Linking.openURL('mailto:support@picafruit.com?subject=Pic a Fruit Feedback');
        }}
      ]
    );
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Pengaturan',
      items: [
        {
          icon: <Bell size={20} color="#666" />,
          title: 'Notifikasi',
          subtitle: 'Terima pemberitahuan dan tips',
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: handleNotificationToggle,
          onPress: () => {}
        },
        {
          icon: <Settings size={20} color="#666" />,
          title: 'Auto-save Hasil',
          subtitle: 'Simpan hasil scan otomatis',
          hasSwitch: true,
          switchValue: autoSaveEnabled,
          onSwitchChange: handleAutoSaveToggle,
          onPress: () => {}
        }
      ]
    },
    {
      title: 'Dukungan',
      items: [
        {
          icon: <HelpCircle size={20} color="#666" />,
          title: 'Bantuan & FAQ',
          subtitle: 'Panduan penggunaan aplikasi',
          onPress: handleHelp
        },
        {
          icon: <Star size={20} color="#666" />,
          title: 'Beri Rating',
          subtitle: 'Rating di app store',
          onPress: handleRateApp
        },
        {
          icon: <ExternalLink size={20} color="#666" />,
          title: 'Hubungi Pengembang',
          subtitle: 'Saran dan laporan bug',
          onPress: handleContact
        }
      ]
    },
    {
      title: 'Informasi',
      items: [
        {
          icon: <Info size={20} color="#666" />,
          title: 'Tentang Aplikasi',
          subtitle: 'Versi dan info pengembang',
          onPress: handleAbout
        }
      ]
    },
    {
      title: 'Data',
      items: [
        {
          icon: <Trash2 size={20} color="#F44336" />,
          title: 'Hapus Semua Data',
          subtitle: 'Reset aplikasi ke pengaturan awal',
          onPress: handleClearData,
          isDestructive: true
        }
      ]
    }
  ];

  const renderMenuItem = (item: MenuItem, index: number) => (
    <TouchableOpacity 
      key={index}
      style={styles.menuItem}
      onPress={item.onPress}
      disabled={item.hasSwitch}
    >
      <View style={styles.menuItemLeft}>
        {item.icon}
        <View style={styles.menuItemText}>
          <Text style={[
            styles.menuItemTitle,
            item.isDestructive && styles.destructiveText
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.menuItemRight}>
        {item.hasSwitch ? (
          <Switch
            value={item.switchValue}
            onValueChange={item.onSwitchChange}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor="#FFFFFF"
          />
        ) : (
          <ChevronRight size={20} color="#CCC" />
        )}
      </View>
    </TouchableOpacity>
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
        
        <Text style={styles.title}>Profil</Text>
        
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#666" />
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Pengguna Pic a Fruit</Text>
            <Text style={styles.userEmail}>user@picafruit.com</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scanCount}</Text>
            <Text style={styles.statLabel}>Total Scan</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatStorageSize(storageInfo.size)}</Text>
            <Text style={styles.statLabel}>Data Tersimpan</Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuItems}>
              {section.items.map((item, itemIndex) => 
                renderMenuItem(item, itemIndex)
              )}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pic a Fruit v1.0.0{'\n'}
            Dibuat dengan ❤️ untuk petani dan pecinta buah
          </Text>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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
  content: {
    flex: 1,
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingVertical: 20,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  menuSection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItems: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  menuItemRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveText: {
    color: '#F44336',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ProfileScreen;