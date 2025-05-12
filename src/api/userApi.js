import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from './fetchWithAuth';
import config from '../config/config';

const USER_API_URL = `${config.API_URL}/me`;

/**
 * Получает связанных пользователей с сервера или из кэша
 * @param {object} navigation — для редиректа при 401
 * @returns {Promise<{data: any, error: string | null}>}
 */
export const fetchLinkedUsers = async (navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/related-users`,
      { method: 'GET' },
      navigation
    );
    const data = await response.json();
    await AsyncStorage.setItem('linkedUsers', JSON.stringify(data));
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching linked users:', err);
    const cached = await AsyncStorage.getItem('linkedUsers');
    return {
      data: cached ? JSON.parse(cached) : [],
      error: 'Не удалось загрузить связанных пользователей',
    };
  }
};
