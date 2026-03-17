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

    // Берем заметки из папки "Главная", не удаленные, сортируем по дате
    const mainFolderNotes = notes
      .filter(note => note.folder === 'Главная' && !note.deleted)
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, 5) // Показываем до 5 заметок
      .map(note => ({
        id: note.id,
        title: note.title || 'Без названия',
        content: note.content || '...',
        date: note.updatedAt || note.createdAt || Date.now()
      }));
    
    console.log('Updating widget with notes:', mainFolderNotes.length);
    
    // Для Android - передаем в нативный модуль
    if (Platform.OS === 'android' && WidgetDataModule) {
      WidgetDataModule.updateWidgetNotes(mainFolderNotes);
    }
    
    // Для всех платформ - сохраняем в AsyncStorage как запасной вариант
    await AsyncStorage.setItem('@widget_notes', JSON.stringify(mainFolderNotes));
    
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
