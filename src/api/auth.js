import axios from 'axios';
import config from '../config/config';
import log from '../utils/coloredLog';

export const loginApi = async (email, password) => {
  try {
    log.cyan('[loginApi] Sending login request:', { email });
    const response = await axios.post(`${config.API_HOST}/login`, {
      email,
      password,
    });
    log.cyan('[loginApi] Login successful:', response.data);
    return response.data;
  } catch (error) {
    log.error('[loginApi] Login error:', error.response?.data || error.message);
    const data = error.response?.data || {};
    throw {
      code: data.code || 'SERVER_ERROR',
      message: data.message || 'Ошибка входа',
    };
  }
};

export const registerApi = async (userData) => {
  try {
    log.cyan('[registerApi] Sending register request:', userData);
    const response = await axios.post(`${config.API_HOST}/register`, userData);
    log.cyan('[registerApi] Registration successful:', response.data);
    return response.data;
  } catch (error) {
    log.error('[registerApi] Registration error:', error.response?.data || error.message);
    const data = error.response?.data || {};
    throw {
      code: data.code || 'REGISTRATION_ERROR',
      message: data.message || 'Ошибка регистрации',
    };
  }
};