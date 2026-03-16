import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { WidgetDataModule } = NativeModules;

export const updateWidgetData = async (notes) => {
  try {
    const mainFolderNotes = notes
      .filter(note => note.folder === 'Главная' && !note.deleted)
      .slice(0, 5)
      .map(note => ({
        id: note.id,
        title: note.title || 'Без названия',
        content: note.content || '...'
      }));
    
    if (WidgetDataModule) {
      WidgetDataModule.updateWidgetNotes(mainFolderNotes);
    }
    
    await AsyncStorage.setItem('@widget_notes', JSON.stringify(mainFolderNotes));
  } catch (error) {
    console.error('Error updating widget:', error);
  }
};