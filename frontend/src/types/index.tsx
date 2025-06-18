// src/types/index.ts

export interface ScanResult {
  id: number;
  fruit: string;
  result: 'Matang' | 'Busuk' | 'Belum Matang';
  confidence: number;
  date: string;
  image: string;
  originalLabel: string;
  timestamp: number;
}

export interface PredictionResponse {
  status: 'success' | 'error';
  label: string;
  confidence: number;
  demo_mode?: boolean;
  model_version?: string;
  message?: string;
  error?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

export type FruitCondition = 'Matang' | 'Busuk' | 'Belum Matang';

export interface FruitInfo {
  name: string;
  emoji: string;
  condition: FruitCondition;
  tips?: string[];
}

export interface AppConfig {
  apiBaseUrl: string;
  timeoutMs: number;
  maxImageSize: number;
  supportedFormats: string[];
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: undefined;
  Home: undefined;
  Camera: undefined;
  Processing: undefined;
  Result: { scanResult: ScanResult };
  History: undefined;
  Profile: undefined;
};

export interface OnboardingSlide {
  title: string;
  description: string;
  icon: string;
}

// Storage types
export interface StorageData {
  scanHistory: ScanResult[];
  isFirstTime: boolean;
  settings: {
    notifications: boolean;
    autoSave: boolean;
  };
}