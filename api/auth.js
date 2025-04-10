import { saveToken } from '../utils/auth';

export const login = async (email, password) => {
  const response = await fetch('http://noname-pc.netbird.cloud:8080/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка входа');
  }

  const data = await response.json();
  const token = data.token;
  if (!token) {
    throw new Error('Токен не получен от сервера');
  }

  await saveToken(token);
  return data;
};

export const register = async (email, password, firstName, lastName, role, middleName, phoneNumber) => {
  const response = await fetch('http://noname-pc.netbird.cloud:8080/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      role,
      middleName,
      phoneNumber,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка регистрации');
  }

  const data = await response.json();
  return data;
};