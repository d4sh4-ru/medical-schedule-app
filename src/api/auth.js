import config from '../config/config';

export const loginApi = async (email, password) => {
  const response = await fetch(`${config.API_HOST}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw { code: data.code || 'SERVER_ERROR', message: data.message || 'Ошибка входа' };
  }

  return data;
};

export const registerApi = async (userData) => {
  const response = await fetch(`${config.API_HOST}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw { code: data.code || 'REGISTRATION_ERROR', message: data.message || 'Ошибка регистрации' };
  }

  return data;
};
