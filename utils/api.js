import { getToken } from './auth';

// Обёртка для fetch с добавлением токена в заголовки
export const fetchWithAuth = async (url, options = {}) => {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await removeToken();
    navigation.replace('Login');
    throw new Error('Unauthorized: Токен недействителен или истёк');
  }

  return response;
};