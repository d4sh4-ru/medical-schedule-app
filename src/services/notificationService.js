// services/notificationService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchTodayNotifications,
  fetchDayNotifications,
  fetchMonthNotificationDays,
  confirmNotification,
} from '../api/notificationApi';

export const getNotificationsForToday = async (navigation, setIsLoadingNotifications, setNotifications, setNotificationsError) => {
  try {
    setIsLoadingNotifications(true);
    const data = await fetchTodayNotifications(navigation);
    console.log('getNotificationsForToday data:', data);
    const notificationsData = Array.isArray(data) ? data : [];
    setNotifications(notificationsData);
    console.log('getNotificationsForToday set:', notificationsData);
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`notifications_${today}`, JSON.stringify(notificationsData));
    setNotificationsError(null);
    console.log('getNotificationsForToday returning:', notificationsData);
    return notificationsData; // Убедимся, что возвращаем данные
  } catch (err) {
    const errorMessage = err.message.includes('Network request failed')
      ? 'Не удалось загрузить уведомления. Проверьте подключение к интернету.'
      : err.message.includes('fetchWithAuth')
      ? 'Ошибка конфигурации приложения. Обратитесь в поддержку.'
      : 'Не удалось загрузить уведомления';
    setNotificationsError(errorMessage);
    console.error('Error fetching today notifications:', err);
    const today = new Date().toISOString().split('T')[0];
    const cached = await AsyncStorage.getItem(`notifications_${today}`);
    if (cached) {
      const cachedData = JSON.parse(cached);
      const notificationsData = Array.isArray(cachedData) ? cachedData : [];
      setNotifications(notificationsData);
      console.log('getNotificationsForToday cached:', notificationsData);
      return notificationsData; // Возвращаем кэшированные данные
    }
    throw err;
  } finally {
    setIsLoadingNotifications(false);
  }
};

export const getNotificationsForDay = async (day, month, year, navigation) => {
  try {
    const data = await fetchDayNotifications(day, month, year, navigation);
    return data;
  } catch (err) {
    console.error('Error fetching day notifications:', err);
    throw new Error('Не удалось загрузить уведомления за день');
  }
};

export const getNotificationDaysForMonth = async (month, year, navigation) => {
  try {
    const data = await fetchMonthNotificationDays(month, year, navigation);
    return data.days || [];
  } catch (err) {
    console.error('Error fetching month notification days:', err);
    return [];
  }
};

export const confirmUserNotification = async (id, notifications, setNotifications, navigation) => {
  try {
    await confirmNotification(id, navigation);
    const updatedNotifications = notifications.map((notif) =>
      notif.id === id
        ? { ...notif, status: 'accepted', actualTakenAt: new Date().toISOString() }
        : notif
    );
    setNotifications(updatedNotifications);
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  } catch (err) {
    console.error('Error confirming notification:', err);
    throw new Error('Не удалось подтвердить уведомление');
  }
};
