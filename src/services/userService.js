import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, registerApi } from '../api/auth';

// Выполняет вход, сохраняет токен
export const loginUser = async ({ email, password }) => {
  const data = await loginApi(email, password);
  if (!data.token) throw { code: 'NO_TOKEN', message: 'Не удалось получить токен' };
  await saveToken(data.token);
  return data;
};

// Регистрация
export const registerUser = async (userData) => {
  const data = await registerApi(userData);
  return data;
};

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
    return await AsyncStorage.getItem('jwt_token');
  } catch (error) {
    console.error('Ошибка получения токена:', error);
    return null;
  }
};

// Удаление токена
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('jwt_token');
  } catch (error) {
    console.error('Ошибка удаления токена:', error);
  }
};

// Очистка всех данных при выходе
export const clearLogout = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage очищен');
  } catch (error) {
    console.error('Ошибка при очистке AsyncStorage:', error);
  }
};
