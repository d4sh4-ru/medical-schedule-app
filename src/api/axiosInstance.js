import axios from 'axios';
import config from '../config/config';
import { getToken, removeToken } from '../services/userService';
import log from '../utils/coloredLog';

// Создаём экземпляр axios с базовой конфигурацией
const apiClient = axios.create({
  baseURL: config.API_URL, // Базовый URL из config.js
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Таймаут запроса 10 секунд
});

// Перехватчик запросов: добавляем токен авторизации
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    log.cyan('[axios] Adding token to request:', token ? 'Token exists' : 'No token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    log.cyan('[axios] Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    log.error('[axios] Request error:', error);
    return Promise.reject(error);
  }
);

// Перехватчик ответов: обрабатываем ошибку 401
apiClient.interceptors.response.use(
  (response) => {
    log.cyan('[axios] Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    const { response, config } = error;
    log.error('[axios] Response error:', {
      status: response?.status,
      url: config?.url,
      message: error.message,
    });

    // Обрабатываем 401 (Unauthorized)
    if (response?.status === 401 && config.navigation) {
      log.cyan('[axios] Unauthorized (401), removing token and navigating to Login');
      await removeToken();
      config.navigation.replace('Login');
      return Promise.reject(new Error('Unauthorized: Токен недействителен или истёк'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;