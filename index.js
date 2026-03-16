// =====================================================
// FILE: index.js
// =====================================================
import { registerRootComponent } from 'expo';
import App from './App';

// Для Snack нужен именно такой вызов
registerRootComponent(App);

// Этот экспорт не мешает, но и не обязателен
export default App;