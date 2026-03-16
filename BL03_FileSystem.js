// =====================================================
// FILE: BL03_FileSystem.js
// =====================================================
import { Platform } from 'react-native';

// Создаем модуль файловой системы с заглушками для web
let FileSystemModule;

if (Platform.OS === 'web') {
  // Web заглушка
  FileSystemModule = {
    documentDirectory: '',
    cacheDirectory: '',
    writeAsStringAsync: async () => {},
    readAsStringAsync: async () => '',
    getInfoAsync: async () => ({ exists: false, size: 0, isDirectory: false }),
    deleteAsync: async () => {},
    makeDirectoryAsync: async () => {},
    copyAsync: async () => {},
    moveAsync: async () => {},
    downloadAsync: async () => ({ uri: '' }),
    createDownloadResumable: () => ({}),
    StorageAccessFramework: {
      requestDirectoryPermissionsAsync: async () => ({ granted: false }),
      createFileAsync: async () => '',
      readDirectoryAsync: async () => []
    }
  };
} else {
  // Native версия
  try {
    // Используем require вместо import для избежания ошибок в web
    const ExpoFS = require('expo-file-system');
    FileSystemModule = ExpoFS;
  } catch (e) {
    console.warn('expo-file-system not available, using mock');
    FileSystemModule = {
      documentDirectory: '',
      cacheDirectory: '',
      writeAsStringAsync: async () => {},
      readAsStringAsync: async () => '',
      getInfoAsync: async () => ({ exists: false }),
      deleteAsync: async () => {},
      makeDirectoryAsync: async () => {},
      copyAsync: async () => {},
      moveAsync: async () => {}
    };
  }
}

export default FileSystemModule;