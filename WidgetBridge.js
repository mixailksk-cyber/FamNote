// =====================================================
// FILE: WidgetBridge.js
// =====================================================
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { WidgetDataModule } = NativeModules;

export const updateWidgetData = async (notes) => {
  try {
    console.log('🔄 [WidgetBridge] updateWidgetData called');
    
    if (!notes || !Array.isArray(notes)) {
      console.log('❌ [WidgetBridge] No notes array provided');
      return;
    }

    const mainFolderNotes = notes
      .filter(note => note.folder === 'Главная' && !note.deleted)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .map(note => ({
        id: note.id,
        title: note.title || 'Без названия',
        content: note.content || '...',
        date: note.updatedAt || note.createdAt || Date.now()
      }));
    
    const notesJson = JSON.stringify(mainFolderNotes);
    console.log(`✅ [WidgetBridge] Filtered ${mainFolderNotes.length} notes`);
    
    // Сохраняем в AsyncStorage
    await AsyncStorage.setItem('@widget_notes', notesJson);
    console.log('💾 [WidgetBridge] Saved to AsyncStorage');
    
    // Пытаемся отправить в нативный модуль (если доступен)
    if (Platform.OS === 'android' && WidgetDataModule) {
      try {
        WidgetDataModule.updateWidgetNotes(notesJson);
        console.log('📱 [WidgetBridge] Sent to native module');
      } catch (e) {
        console.log('❌ [WidgetBridge] Native module error:', e);
      }
    } else {
      console.log('⚠️ [WidgetBridge] Native module not available, using AsyncStorage only');
    }
    
  } catch (error) {
    console.error('❌ [WidgetBridge] Error updating widget:', error);
  }
};

export const getWidgetNotes = async () => {
  try {
    const notesJson = await AsyncStorage.getItem('@widget_notes');
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error getting widget notes:', error);
    return [];
  }
};
