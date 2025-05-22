import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from './axiosInstance'; // Импортируем настроенный экземпляр axios
import log from '../utils/coloredLog';

const USER_API_URL = '/me'; // Относительный путь, так как baseURL задан в axiosConfig

export const fetchLinkedUsers = async (navigation) => {
  try {
    const response = await axios.get(`${USER_API_URL}/related-users`, { navigation });
    const data = response.data;
    await AsyncStorage.setItem('linkedUsers', JSON.stringify(data));
    return { data, error: null };
  } catch (err) {
    log.error('[fetchLinkedUsers] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    const cached = await AsyncStorage.getItem('linkedUsers');
    return {
      data: cached ? JSON.parse(cached) : [],
      error: 'Не удалось загрузить связанных пользователей',
    };
  }
};

export const setTimeZone = async (timeZone, navigation) => {
  try {
    const response = await axios.post(`${USER_API_URL}/timezone/${timeZone}`, {}, { navigation });
    const data = response.data;
    return { data, error: null };
  } catch (err) {
    log.error('[setTimeZone] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    return {
      data: null,
      error: 'Не удалось установить часовой пояс',
    };
  }
};

export const fetchDeviceTokens = async (navigation) => {
  try {
    const response = await axios.get(`${USER_API_URL}/token`, { navigation });
    const data = response.data;
    await AsyncStorage.setItem('deviceTokens', JSON.stringify(data));
    return { data, error: null };
  } catch (err) {
    log.error('[fetchDeviceTokens] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    const cached = await AsyncStorage.getItem('deviceTokens');
    return {
      data: cached ? JSON.parse(cached) : null,
      error: 'Не удалось загрузить токены устройств',
    };
  }
};

export const registerDeviceToken = async (tokenData, navigation) => {
  try {
    const response = await axios.post(`${USER_API_URL}/token`, tokenData, { navigation });
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
    return { data, error: null };
  } catch (err) {
    log.error('[registerDeviceToken] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    return {
      data: null,
      error: 'Не удалось зарегистрировать токен устройства',
    };
  }
};

export const deleteDeviceToken = async (token, navigation) => {
  try {
    const response = await axios.delete(`${USER_API_URL}/token/${token}`, { navigation });
    const data = response.data;
    const cachedTokens = await AsyncStorage.getItem('deviceTokens');
    if (cachedTokens) {
      const tokens = JSON.parse(cachedTokens);
      const updatedTokens = tokens.filter((t) => t.deviceToken !== token);
      await AsyncStorage.setItem('deviceTokens', JSON.stringify(updatedTokens));
    }
    return { data, error: null };
  } catch (err) {
    log.error('[deleteDeviceToken] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    return {
      data: null,
      error: 'Не удалось удалить токен устройства',
    };
  }
};

export const fetchMe = async (navigation) => {
  try {
    const response = await axios.get(USER_API_URL, { navigation });
    return response.data;
  } catch (err) {
    log.error('[fetchMe] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};