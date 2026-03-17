// Добавьте эту функцию в компонент
const testWidget = async () => {
  addLog('🧪 Тестирование виджета...');
  
  try {
    // Импортируйте функцию тестирования
    const { testWidget } = require('./WidgetBridge');
    await testWidget();
    addLog('✅ Тест виджета выполнен');
    Alert.alert('✅ Тест выполнен', 'Проверьте логи в консоли');
  } catch (e) {
    addLog('❌ Ошибка теста:', e);
    Alert.alert('❌ Ошибка', e.message);
  }
};

// Добавьте кнопку в секцию резервного копирования
<View style={{ backgroundColor: '#F8F9FA', borderRadius: 16, padding: 20, gap: 12 }}>
  {/* ... существующие кнопки ... */}
  
  <TouchableOpacity 
    style={{ 
      backgroundColor: '#2196F3', 
      padding: 12, 
      borderRadius: 8, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center'
    }} 
    onPress={testWidget}
  >
    <MaterialIcons name="widgets" size={20} color="white" style={{ marginRight: 8 }} />
    <Text style={{ color: 'white', fontSize: 14 }}>Тест виджета</Text>
  </TouchableOpacity>
</View>
