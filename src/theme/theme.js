/**
 * Светлая тема для приложения
 */
export const lightTheme = {
  colors: {
    primary: '#007AFF', // Циановый
    accent: '#CFD8DC', // Аквамариновый
    secondary: '#F0F4F8', // Светлый фон
    text: '#1A1A1A', // Тёмный текст
    error: '#FF5252', // Красный для ошибок
    background: '#FFFFFF', // Белый для карточек
    border: '#CFD8DC', // Светлая обводка
    success: '#26A69A',
  },
  typography: {
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
    },
  },
};

/**
 * Темная тема приложения
 */
export const darkTheme = {
  colors: {
    primary: '#00BCD4', // Циановый (тот же для консистентности)
    accent: '#26A69A', // Аквамариновый
    secondary: '#1E2A3C', // Тёмный фон
    text: '#E0E0E0', // Светлый текст
    error: '#FF5252', // Красный для ошибок
    background: '#2C3E50', // Тёмный для карточек
    border: '#546E7A', // Тёмная обводка
  },
  typography: lightTheme.typography, // Типографика та же
};