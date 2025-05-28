import axios from './axiosInstance'; // Импортируем настроенный экземпляр axios
import log from '../utils/coloredLog';

const NOTIFICATION_API_URL = '/plan/notifications'; // Относительный путь, так как baseURL задан в axiosConfig

export const fetchTodayNotifications = async (navigation) => {
  try {
    const response = await axios.get(`${NOTIFICATION_API_URL}/today`, { navigation });
    return response.data;
  } catch (err) {
    log.warn('[fetchTodayNotifications] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const fetchDayNotifications = async (day, month, year, navigation) => {
  try {
    const response = await axios.get(`${NOTIFICATION_API_URL}/day/${day}/${month}/${year}`, { navigation });
    return response.data;
  } catch (err) {
    log.warn('[fetchDayNotifications] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const fetchMonthNotificationDays = async (month, year, navigation) => {
  try {
    const response = await axios.get(`${NOTIFICATION_API_URL}/month/${month}/${year}`, { navigation });
    return response.data;
  } catch (err) {
    log.warn('[fetchMonthNotificationDays] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const confirmNotification = async (id, navigation) => {
  try {
    const response = await axios.patch(`${NOTIFICATION_API_URL}/${id}/confirm`, {}, { navigation });
    return response;
  } catch (err) {
    log.warn('[confirmNotification] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};