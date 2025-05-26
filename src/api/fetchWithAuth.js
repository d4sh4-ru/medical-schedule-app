import apiClient from './axiosInstance';
import log from '../utils/coloredLog';

/**
 * Выполняет HTTP-запрос с авторизацией, используя axios.
 * Токен и обработка 401 выполняются перехватчиками в axiosInstance.
 * 
 * @param {string} url - URL запрашиваемого ресурса (относительный или полный).
 * @param {Object} [options={}] - Опции для запроса (method, headers, body и т.д.).
 * @param {Object} [navigation=null] - Объект навигации для перенаправления на экран входа при 401.
 * @returns {Promise<AxiosResponse>} Ответ от сервера (объект AxiosResponse).
 * @throws {Error} Если запрос не удался (например, ошибка сети или 401).
 */
export const fetchWithAuth = async (url, options = {}, navigation = null) => {
  log.cyan('[fetchWithAuth] called:', { url, options, navigation: !!navigation });

  try {
    // Добавляем navigation в конфигурацию для перехватчика
    const response = await apiClient({
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      data: options.body, // axios использует data вместо body
      ...options,
      navigation, // Передаём navigation для обработки 401
    });

    return response;
  } catch (err) {
    console.warn('Fetch error:', {
      error: err.message,
      url,
      options,
    });
    throw err;
  }
};