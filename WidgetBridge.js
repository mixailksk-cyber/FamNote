// =====================================================
// FILE: WidgetBridge.js
// =====================================================
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { WidgetDataModule } = NativeModules;

export const updateWidgetData = async (notes) => {
  try {
    if (!notes || !Array.isArray(notes)) {
      console.log('No notes to update widget');
      return;
    }

    // Берем ВСЕ заметки из папки "Главная" (без ограничения по количеству)
    const mainFolderNotes = notes
      .filter(note => note.folder === 'Главная' && !note.deleted)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .map(note => ({
        id: note.id,
        title: note.title || 'Без названия',
        content: note.content || '...',
        date: note.updatedAt || note.createdAt || Date.now()
      }));
    
    console.log('Updating widget with notes:', mainFolderNotes.length);
    
    const notesJson = JSON.stringify(mainFolderNotes);
    
    // Для Android - передаем в нативный модуль
    if (Platform.OS === 'android' && WidgetDataModule) {
      WidgetDataModule.updateWidgetNotes(notesJson);
    }
    
    // Для всех платформ - сохраняем в AsyncStorage как запасной вариант
    await AsyncStorage.setItem('@widget_notes', notesJson);
    
  } catch (error) {
    console.error('Error updating widget:', error);
  }
};

// Функция для получения данных виджета (будет вызываться из нативного кода)
export const getWidgetNotes = async () => {
  try {
    const notesJson = await AsyncStorage.getItem('@widget_notes');
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error getting widget notes:', error);
    return [];
  }
};
