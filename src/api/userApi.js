import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from './fetchWithAuth';
import config from '../config/config';
import log from '../utils/coloredLog';

const USER_API_URL = `${config.API_URL}/me`;

export const fetchLinkedUsers = async (navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/related-users`,
      { method: 'GET' },
      navigation
    );
    const data = response.data;
    await AsyncStorage.setItem('linkedUsers', JSON.stringify(data));
    log.cyan('[fetchLinkedUsers] Success:', data);
    return { data, error: null };
  } catch (err) {
    log.error('[fetchLinkedUsers] Error:', err.message);
    const cached = await AsyncStorage.getItem('linkedUsers');
    return {
      data: cached ? JSON.parse(cached) : [],
      error: 'Не удалось загрузить связанных пользователей',
    };
  }
};

export const setTimeZone = async (timeZone, navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/timezone/${timeZone}`,
      { method: 'POST' },
      navigation
    );
    const data = response.data;
    log.cyan('[setTimeZone] Success:', data);
    return { data, error: null };
  } catch (err) {
    log.error('[setTimeZone] Error:', err.message);
    return {
      data: null,
      error: 'Не удалось установить часовой пояс',
    };
  }
};

export const fetchDeviceTokens = async (navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/token`,
      { method: 'GET' },
      navigation
    );
    const data = response.data;
    await AsyncStorage.setItem('deviceTokens', JSON.stringify(data));
    log.cyan('[fetchDeviceTokens] Success:', data);
    return { data, error: null };
  } catch (err) {
    log.error('[fetchDeviceTokens] Error:', err.message);
    const cached = await AsyncStorage.getItem('deviceTokens');
    return {
      data: cached ? JSON.parse(cached) : null,
      error: 'Не удалось загрузить токены устройств',
    };
  }
};

export const registerDeviceToken = async (tokenData, navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/token`,
      {
        method: 'POST',
        body: JSON.stringify(tokenData),
      },
      navigation
    );
    const data = response.data;
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
    log.cyan('[registerDeviceToken] Success:', data);
    return { data, error: null };
  } catch (err) {
    log.error('[registerDeviceToken] Error:', err.message);
    return {
      data: null,
      error: 'Не удалось зарегистрировать токен устройства',
    };
  }
};

export const deleteDeviceToken = async (token, navigation) => {
  try {
    const response = await fetchWithAuth(
      `${USER_API_URL}/token/${token}`,
      { method: 'DELETE' },
      navigation
    );
    const data = response.data;
    const cachedTokens = await AsyncStorage.getItem('deviceTokens');
    if (cachedTokens) {
      const tokens = JSON.parse(cachedTokens);
      const updatedTokens = tokens.filter((t) => t.deviceToken !== token);
      await AsyncStorage.setItem('deviceTokens', JSON.stringify(updatedTokens));
    }
    log.cyan('[deleteDeviceToken] Success:', data);
    return { data, error: null };
  } catch (err) {
    log.error('[deleteDeviceToken] Error:', err.message);
    return {
      data: null,
      error: 'Не удалось удалить токен устройства',
    };
  }
};

export const fetchMe = async (navigation) => {
  const response = await fetchWithAuth(`${USER_API_URL}`, {
    method: 'GET',
  }, navigation);
  return response.data;
};