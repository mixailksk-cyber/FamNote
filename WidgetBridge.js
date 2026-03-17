// =====================================================
// FILE: WidgetBridge.js
// =====================================================
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { WidgetDataModule } = NativeModules;

const log = (message, data) => {
  console.log(`📱 Widget [${new Date().toISOString()}]: ${message}`, data || '');
};

export const updateWidgetData = async (notes) => {
  try {
    log('Updating widget data...');
    
    if (!notes || !Array.isArray(notes)) {
      log('No notes array provided');
      return;
    }

    log(`Total notes: ${notes.length}`);

    // Берем заметки из папки "Главная"
    const mainFolderNotes = notes
      .filter(note => {
        const isMain = note.folder === 'Главная';
        const notDeleted = !note.deleted;
        log(`Note ${note.id}: folder=${note.folder}, isMain=${isMain}, deleted=${note.deleted}, notDeleted=${notDeleted}`);
        return isMain && notDeleted;
      })
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .map(note => ({
        id: note.id,
        title: note.title || 'Без названия',
        content: note.content || '...',
        date: note.updatedAt || note.createdAt || Date.now()
      }));
    
    log(`Found ${mainFolderNotes.length} notes in Главная folder`);
    
    const notesJson = JSON.stringify(mainFolderNotes);
    log('Notes JSON prepared, size:', notesJson.length);
    
    // Для Android - передаем в нативный модуль
    if (Platform.OS === 'android') {
      if (WidgetDataModule) {
        log('WidgetDataModule found, sending data...');
        try {
          WidgetDataModule.updateWidgetNotes(notesJson);
          log('Data sent to native module');
        } catch (e) {
          log('Error sending to native module:', e);
        }
      } else {
        log('WidgetDataModule NOT found!');
      }
    }
    
    // Сохраняем в AsyncStorage
    await AsyncStorage.setItem('@widget_notes', notesJson);
    log('Saved to AsyncStorage');
    
  } catch (error) {
    log('ERROR:', error);
  }
};

export const getWidgetNotes = async () => {
  try {
    log('Getting widget notes from AsyncStorage');
    const notesJson = await AsyncStorage.getItem('@widget_notes');
    log('Retrieved from AsyncStorage:', notesJson ? notesJson.substring(0, 100) : 'null');
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    log('Error getting widget notes:', error);
    return [];
  }
};
