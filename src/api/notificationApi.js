import config from '../config/config';
import { fetchWithAuth } from './fetchWithAuth';

const NOTIFICATION_API_URL = `${config.API_URL}/plan/notifications`;

export const fetchTodayNotifications = async (navigation) => {
  const response = await fetchWithAuth(`${NOTIFICATION_API_URL}/today`, { method: 'GET' }, navigation);
  return response.data;
};

export const fetchDayNotifications = async (day, month, year, navigation) => {
  const response = await fetchWithAuth(
    `${NOTIFICATION_API_URL}/day/${day}/${month}/${year}`,
    { method: 'GET' },
    navigation
  );
  return response.data;
};

export const fetchMonthNotificationDays = async (month, year, navigation) => {
  const response = await fetchWithAuth(
    `${NOTIFICATION_API_URL}/month/${month}/${year}`,
    { method: 'GET' },
    navigation
  );
  return response.data;
};

export const confirmNotification = async (id, navigation) => {
  const response = await fetchWithAuth(
    `${NOTIFICATION_API_URL}/${id}/confirm`,
    { method: 'PATCH' },
    navigation
  );
  return response.data;
};