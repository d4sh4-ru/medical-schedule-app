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

/**
 * Устанавливает часовой пояс пользователя
 * @param {string} timeZone — часовой пояс (например, "Europe/Moscow")
 * @param {object} navigation — для редиректа при 401
 * @returns {Promise<{data: { message: string }, error: string | null}>}
 */
export const setTimeZone = async (timeZone, navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/timezone/${timeZone}`,
      { method: 'POST' },
      navigation
    );
    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    console.error('Error setting timezone:', err);
    return {
      data: null,
      error: 'Не удалось установить часовой пояс',
    };
  }
};

/**
 * Получает токены устройств пользователя с сервера или из кэша
 * @param {object} navigation — для редиректа при 401
 * @returns {Promise<{data: any[] | null, error: string | null}>}
 */
export const fetchDeviceTokens = async (navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/token`,
      { method: 'GET' },
      navigation
    );
    const data = await response.json();
    await AsyncStorage.setItem('deviceTokens', JSON.stringify(data));
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching device tokens:', err);
    const cached = await AsyncStorage.getItem('deviceTokens');
    return {
      data: cached ? JSON.parse(cached) : null,
      error: 'Не удалось загрузить токены устройств',
    };
  }
};

/**
 * Регистрирует токен устройства
 * @param {object} tokenData — данные токена { deviceToken, deviceType, appVersion, platform }
 * @param {object} navigation — для редиректа при 401
 * @returns {Promise<{data: { message: string }, error: string | null}>}
 */
export const registerDeviceToken = async (tokenData, navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData),
      },
      navigation
    );
    const data = await response.json();
    // Обновляем кэш токенов
    const cachedTokens = await AsyncStorage.getItem('deviceTokens');
    const tokens = cachedTokens ? JSON.parse(cachedTokens) : [];
    if (Array.isArray(tokens)) {
      tokens.push({
        deviceToken: tokenData.deviceToken,
        deviceType: tokenData.deviceType || '',
        appVersion: tokenData.appVersion || '',
        platform: tokenData.platform || '',
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('deviceTokens', JSON.stringify(tokens));
    }
    return { data, error: null };
  } catch (err) {
    console.error('Error registering device token:', err);
    return {
      data: null,
      error: 'Не удалось зарегистрировать токен устройства',
    };
  }
};

/**
 * Удаляет токен устройства
 * @param {string} token — токен устройства для удаления
 * @param {object} navigation — для редиректа при 401
 * @returns {Promise<{data: { message: string }, error: string | null}>}
 */
export const deleteDeviceToken = async (token, navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/token/${token}`,
      { method: 'DELETE' },
      navigation
    );
    const data = await response.json();
    // Обновляем кэш токенов
    const cachedTokens = await AsyncStorage.getItem('deviceTokens');
    if (cachedTokens) {
      const tokens = JSON.parse(cachedTokens);
      const updatedTokens = tokens.filter((t) => t.deviceToken !== token);
      await AsyncStorage.setItem('deviceTokens', JSON.stringify(updatedTokens));
    }
    return { data, error: null };
  } catch (err) {
    console.error('Error deleting device token:', err);
    return {
      data: null,
      error: 'Не удалось удалить токен устройства',
    };
  }
};