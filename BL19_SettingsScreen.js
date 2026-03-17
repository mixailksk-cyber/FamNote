// =====================================================
// FILE: BL19_SettingsScreen.js
// =====================================================
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import Header from './BL04_Header';
import { NOTE_COLORS, getBrandColor } from './BL02_Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Linking } from 'react-native';

let Sharing;
if (Platform.OS !== 'web') {
  try {
    Sharing = require('expo-sharing');
  } catch (e) {
    console.log('Sharing not available:', e);
  }
}

const SettingsScreen = ({ setCurrentScreen, goToSearch, settings, saveSettings, notes, folders, onBrandColorChange }) => {
  const fontSizeOptions = [14, 16, 18, 20, 22, 24];
  const brandColor = getBrandColor(settings);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [fsInfo, setFsInfo] = useState({});

  // Диагностика файловой системы при загрузке
  useEffect(() => {
    checkFileSystem();
  }, []);

  const checkFileSystem = async () => {
    try {
      const info = {
        platform: Platform.OS,
        platformVersion: Platform.Version,
        isWeb: Platform.OS === 'web',
      };

      if (Platform.OS !== 'web') {
        // Проверяем директории
        info.documentDirectory = FileSystem.documentDirectory || 'null';
        info.cacheDirectory = FileSystem.cacheDirectory || 'null';
        info.bundleDirectory = FileSystem.bundleDirectory || 'null';
        
        // Проверяем права на запись
        try {
          const testFile = FileSystem.cacheDirectory + 'test.txt';
          await FileSystem.writeAsStringAsync(testFile, 'test');
          const testRead = await FileSystem.readAsStringAsync(testFile);
          await FileSystem.deleteAsync(testFile);
          info.canWrite = true;
          info.canRead = true;
          info.testData = testRead;
        } catch (e) {
          info.canWrite = false;
          info.writeError = e.message;
        }

        // Проверяем разрешения MediaLibrary для Android 13+
        if (Platform.OS === 'android' && parseInt(Platform.Version, 10) >= 33) {
          const { status, granted } = await MediaLibrary.getPermissionsAsync();
          info.mediaLibraryStatus = status;
          info.mediaLibraryGranted = granted;
        }

        // Проверяем Sharing
        if (Sharing) {
          info.sharingAvailable = await Sharing.isAvailableAsync();
        }
      }

      setFsInfo(info);
      console.log('📁 File System Diagnostics:', JSON.stringify(info, null, 2));
      
      // Показываем предупреждение если есть проблемы
      if (!info.canWrite) {
        Alert.alert(
          '⚠️ Проблема с файловой системой',
          `Не удается записать файлы. Будет использован буфер обмена.\n\nОшибка: ${info.writeError || 'неизвестна'}`,
          [
            { text: 'Понятно' },
            { 
              text: 'Диагностика', 
              onPress: () => Alert.alert('Диагностика', JSON.stringify(info, null, 2))
            }
          ]
        );
      }
    } catch (e) {
      console.log('Error checking file system:', e);
    }
  };

  const formatDateForFilename = () => {
    const date = new Date();
    return `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
  };

  const handleFontSizeChange = (size) => saveSettings({ ...settings, fontSize: size });

  const handleBrandColorChange = (color) => {
    saveSettings({ ...settings, brandColor: color });
    if (onBrandColorChange) onBrandColorChange(color);
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && parseInt(Platform.Version, 10) >= 33) {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        console.log('📸 MediaLibrary permission requested:', status);
        setPermissionStatus(status);
        return status === 'granted';
      } catch (e) {
        console.log('Error requesting permissions:', e);
        return false;
      }
    }
    return true;
  };

  const handleBackup = async () => {
    try {
      const backup = { notes, folders, settings };
      const backupStr = JSON.stringify(backup, null, 2);
      const fileName = `FamNote_Backup_${formatDateForFilename()}.bak`;

      console.log('💾 Starting backup process...');
      console.log('📦 Backup size:', backupStr.length, 'bytes');
      console.log('📁 FileSystem info:', fsInfo);

      // Web версия
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform - using blob download');
        const blob = new Blob([backupStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('✅ Успех', 'Резервная копия создана');
        return;
      }

      // Android версия - пробуем разные способы
      console.log('📱 Android platform - trying file write');
      
      // Способ 1: Пробуем cacheDirectory
      try {
        console.log('Attempt 1: Writing to cacheDirectory');
        const cacheDir = FileSystem.cacheDirectory;
        console.log('cacheDirectory:', cacheDir);
        
        if (!cacheDir) {
          throw new Error('cacheDirectory is null');
        }

        const fileUri = cacheDir + fileName;
        console.log('File URI:', fileUri);
        
        await FileSystem.writeAsStringAsync(fileUri, backupStr, {
          encoding: FileSystem.EncodingType.UTF8
        });
        console.log('✅ File written successfully');

        // Проверяем что файл создался
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log('File info:', fileInfo);

        if (fileInfo.exists) {
          console.log('✅ File exists, size:', fileInfo.size);
          
          // Пробуем поделиться
          if (Sharing && await Sharing.isAvailableAsync()) {
            console.log('Sharing available, attempting to share');
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/json',
              dialogTitle: 'Сохранить резервную копию'
            });
          } else {
            Alert.alert('✅ Успех', 'Резервная копия создана во временной папке');
          }
          return;
        }
      } catch (cacheError) {
        console.log('❌ Attempt 1 failed:', cacheError.message);
        console.log('Error details:', cacheError);
        
        // Способ 2: Пробуем documentDirectory
        try {
          console.log('Attempt 2: Writing to documentDirectory');
          const docDir = FileSystem.documentDirectory;
          console.log('documentDirectory:', docDir);
          
          if (!docDir) {
            throw new Error('documentDirectory is null');
          }

          const fileUri = docDir + fileName;
          await FileSystem.writeAsStringAsync(fileUri, backupStr);
          console.log('✅ File written to documentDirectory');

          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (fileInfo.exists) {
            if (Sharing && await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri, {
                mimeType: 'application/json',
                dialogTitle: 'Сохранить резервную копию'
              });
            } else {
              Alert.alert('✅ Успех', 'Резервная копия создана');
            }
            return;
          }
        } catch (docError) {
          console.log('❌ Attempt 2 failed:', docError.message);
        }
      }

      // Если все способы не сработали - копируем в буфер
      console.log('⚠️ All file write attempts failed, falling back to clipboard');
      await Clipboard.setStringAsync(backupStr);
      Alert.alert(
        '📋 Скопировано в буфер', 
        'Не удалось создать файл. Данные скопированы в буфер обмена.\n\n' +
        'Диагностика:\n' +
        `cacheDirectory: ${fsInfo.cacheDirectory || 'null'}\n` +
        `canWrite: ${fsInfo.canWrite || false}\n` +
        `writeError: ${fsInfo.writeError || 'none'}`
      );

    } catch (e) {
      console.log('💥 Fatal backup error:', e);
      Alert.alert('❌ Ошибка', `Не удалось создать резервную копию: ${e.message}`);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'application/octet-stream'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) return;
      
      const fileUri = result.assets[0].uri;
      console.log('Restore file URI:', fileUri);
      
      let content;
      if (Platform.OS === 'web') {
        const response = await fetch(fileUri);
        content = await response.text();
      } else {
        content = await FileSystem.readAsStringAsync(fileUri);
      }
      
      const backup = JSON.parse(content);
      
      if (backup.notes && backup.folders) {
        const normalizedNotes = backup.notes.map(n => ({ ...n, color: n.color || brandColor }));
        await AsyncStorage.setItem('notes', JSON.stringify(normalizedNotes));
        await AsyncStorage.setItem('folders', JSON.stringify(backup.folders));
        if (backup.settings) await AsyncStorage.setItem('settings', JSON.stringify(backup.settings));
        Alert.alert('✅ Успех', 'Данные восстановлены');
      } else {
        Alert.alert('❌ Ошибка', 'Неверный формат файла');
      }
    } catch (e) {
      console.log('Restore error:', e);
      Alert.alert('❌ Ошибка', 'Не удалось восстановить данные');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header 
        title="Настройки" 
        showBack 
        onBack={() => setCurrentScreen('notes')} 
        rightIcon="close" 
        onRightPress={() => setCurrentScreen('notes')} 
        showSearch 
        onSearchPress={goToSearch} 
        brandColor={brandColor}
      />
      
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Размер текста */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Размер текста</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
              {fontSizeOptions.map((size) => (
                <TouchableOpacity 
                  key={size} 
                  onPress={() => handleFontSizeChange(size)} 
                  style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 22, 
                    backgroundColor: settings.fontSize === size ? brandColor : '#F0F0F0', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    margin: 4 
                  }}
                >
                  <Text style={{ color: settings.fontSize === size ? 'white' : '#666' }}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Цвет бренда */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Цвет бренда</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {NOTE_COLORS.map((color, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => handleBrandColorChange(color)} 
                  style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: 25, 
                    backgroundColor: color, 
                    margin: 6, 
                    borderWidth: brandColor === color ? 3 : 0, 
                    borderColor: '#333' 
                  }} 
                />
              ))}
            </View>
          </View>
        </View>

        {/* Резервное копирование */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 }}>Резервное копирование</Text>
          <View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, gap: 12 }}>
            <TouchableOpacity 
              style={{ 
                backgroundColor: brandColor, 
                padding: 16, 
                borderRadius: 12, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center'
              }} 
              onPress={handleBackup}
            >
              <MaterialIcons name="backup" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Создать копию</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#FF6B6B', 
                padding: 16, 
                borderRadius: 12, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center'
              }} 
              onPress={() => {
                Alert.alert(
                  'Восстановление', 
                  'Все данные будут заменены. Продолжить?', 
                  [
                    { text: 'Отмена', style: 'cancel' }, 
                    { text: 'Восстановить', onPress: handleRestore }
                  ]
                );
              }}
            >
              <MaterialIcons name="restore" size={24} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Восстановить</Text>
            </TouchableOpacity>

            {/* Кнопка диагностики */}
            <TouchableOpacity 
              style={{ 
                backgroundColor: '#4A4A4A', 
                padding: 12, 
                borderRadius: 8, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: 8
              }} 
              onPress={() => {
                Alert.alert(
                  '📊 Диагностика ФС',
                  JSON.stringify(fsInfo, null, 2),
                  [
                    { text: 'OK' },
                    { text: 'Проверить снова', onPress: checkFileSystem }
                  ]
                );
              }}
            >
              <MaterialIcons name="bug-report" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontSize: 14 }}>Диагностика</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
