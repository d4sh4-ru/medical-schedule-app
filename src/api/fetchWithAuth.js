import { getToken, removeToken } from '../services/userService';
import log from '../utils/coloredLog';

/**
 * Выполняет HTTP-запрос с авторизацией с использованием токена.
 * Добавляет заголовок `Authorization` с токеном, если он доступен.
 * Если сервер возвращает ошибку 401 (Unauthorized), удаляет токен и перенаправляет на экран входа.
 * 
 * @param {string} url - URL запрашиваемого ресурса.
 * @param {Object} [options={}] - Опции для запроса, включая метод, тело и другие заголовки.
 * @param {Object} [navigation=null] - Объект навигации, используемый для перенаправления на экран входа в случае ошибки 401.
 * @returns {Promise<Response>} Ответ от сервера (объект `Response`).
 * @throws {Error} Если токен недействителен или истёк, выбрасывается ошибка с сообщением "Unauthorized".
 */
export const fetchWithAuth = async (url, options = {}, navigation = null) => {
  log.cyan('[fetchWithAuth] called:', { url, options, navigation: !!navigation });

  try {
    const token = await getToken();
    log.cyan('[fetchWithAuth] Token retrieved:', token ? 'Token exists' : 'No token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    log.cyan('[fetchWithAuth] Sending request:', { url, method: options.method || 'GET', headers });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    log.cyan('[fetchWithAuth] Response received:', {
      status: response.status,
      ok: response.ok,
      url: response.url,
    });

    if (response.status === 401 && navigation) {
      log.cyan('[fetchWithAuth] Unauthorized (401), removing token and navigating to Login');
      await removeToken();
      navigation.replace('Login');
      throw new Error('Unauthorized: Токен недействителен или истёк');
    }

    return response;
  } catch (err) {
    console.error('Fetch error:', {
      error: err.message,
      url,
      options,
    });
    throw err;
  }
};