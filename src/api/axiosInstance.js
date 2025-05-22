import axios from 'axios';
import config from '../config/config';
import { getToken, removeToken } from '../services/userService';
import log from '../utils/coloredLog';
import { mapError } from './errorMapper';

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
    log.warn('[axios] Request error:', error.message);
    return Promise.reject(error);
  }
);

// Перехватчик ответов: обрабатываем ошибки
apiClient.interceptors.response.use(
  (response) => {
    // Считаем статусы 200 и 201 успешными
    if (response.status === 200 || response.status === 201 || response.status === 204) {
      console.log(response)
      log.cyan('[axios] Response:', {
        status: response.status,
        url: response.config.url,
      });
      return response;
    }
    // Другие статусы считаем ошибками
    throw response;
  },
  async (error) => {
    const { response, config } = error;
    let errorDetails = {
      code: 'INTERNAL_ERROR',
      message: 'Произошла непредвиденная ошибка',
      httpStatus: response?.status || 500,
      action: null,
    };

    // Извлекаем ошибку из ответа сервера
    if (response?.data && response.data.code) {
      errorDetails = mapError(response.data.code, response.data.message);
      errorDetails.httpStatus = response.status;
    } else if (error.message.includes('Network Error')) {
      errorDetails = {
        code: 'NETWORK_ERROR',
        message: 'Ошибка сети. Проверьте подключение к интернету.',
        httpStatus: 0,
        action: null,
      };
    }

    log.warn('[axios] Response error:', {
      responseCode: response.data.code,
      responseMessage: response.data.message,
      code: errorDetails.code,
      message: errorDetails.message,
      httpStatus: errorDetails.httpStatus,
      url: config?.url,
    });

    // Обрабатываем 401 (Unauthorized)
    if (errorDetails.httpStatus === 401 && config.navigation) {
      log.cyan('[axios] Unauthorized (401), removing token and navigating to Login');
      await removeToken();
      config.navigation.replace('Login');
      errorDetails.message = 'Сессия истекла. Пожалуйста, войдите снова.';
    }

    // Создаём кастомную ошибку с дополнительными полями
    const customError = new Error(errorDetails.message);
    customError.code = errorDetails.code;
    customError.httpStatus = errorDetails.httpStatus;
    customError.action = errorDetails.action;

    return Promise.reject(customError);
  }
);

export default apiClient;