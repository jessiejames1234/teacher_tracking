import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getConfigApiBase(): string {
  // Prefer Expo runtime config: app.json/app.config.js extra.API_BASE
  const expoExtra = (Constants.manifest && (Constants.manifest as any).extra) || ((Constants as any).expoConfig && (Constants as any).expoConfig.extra);
  if (expoExtra && expoExtra.API_BASE) return expoExtra.API_BASE as string;

  // Environment variable fallback (works in some build flows)
  if (typeof process !== 'undefined' && (process as any).env && (process as any).env.API_BASE) {
    return (process as any).env.API_BASE as string;
  }

  // sensible defaults for emulator/simulator
  // Android emulator (Android Studio): host machine is 10.0.2.2
  // iOS simulator: localhost works
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
}

export const API_BASE = getConfigApiBase();
