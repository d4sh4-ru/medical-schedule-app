import AsyncStorage from '@react-native-async-storage/async-storage';

// Сохранение токена
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('jwt_token', token);
  } catch (error) {
    console.error('Ошибка сохранения токена:', error);
  }
};

// Получение токена
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    return token;
  } catch (error) {
    console.error('Ошибка получения токена:', error);
    return null;
  }
};

// Удаление токена (для выхода из системы)
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('jwt_token');
  } catch (error) {
    console.error('Ошибка удаления токена:', error);
  }
};