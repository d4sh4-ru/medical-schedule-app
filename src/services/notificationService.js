import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchTodayNotifications,
  fetchDayNotifications,
  fetchMonthNotificationDays,
  confirmNotification,
} from '../api/notificationApi';
import { fetchStocksRequest } from '../api/stockApi';
import log from '../utils/coloredLog';

export const getNotificationsForToday = async (navigation) => {
  try {
    const data = await fetchTodayNotifications(navigation);
    const notificationsData = Array.isArray(data) ? data : [];
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`notifications_${today}`, JSON.stringify(notificationsData));
    return notificationsData;
  } catch (err) {
    log.error('[getNotificationsForToday] Error:', err.message, { stack: err.stack });
    const today = new Date().toISOString().split('T')[0];
    const cached = await AsyncStorage.getItem(`notifications_${today}`);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        return Array.isArray(cachedData) ? cachedData : [];
      } catch (parseErr) {
        log.error('[getNotificationsForToday] Error parsing cached data:', parseErr.message);
      }
    }
    throw new Error(
      err.message.includes('Network request failed')
        ? 'Не удалось загрузить уведомления. Проверьте подключение к интернету.'
        : err.message || 'Не удалось загрузить уведомления'
    );
  }
};

export const getNotificationsForDay = async (day, month, year, navigation) => {
  try {
    const data = await fetchDayNotifications(day, month, year, navigation);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    log.error('[getNotificationsForDay] Error:', err.message, { stack: err.stack });
    throw new Error('Не удалось загрузить уведомления за день');
  }
};

export const getNotificationDaysForMonth = async (month, year, navigation) => {
  try {
    const data = await fetchMonthNotificationDays(month, year, navigation);
    return data.days || [];
  } catch (err) {
    log.error('[getNotificationDaysForMonth] Error:', err.message, { stack: err.stack });
    return [];
  }
};

export const confirmUserNotification = async (id, notifications, setNotifications, navigation) => {
  try {
    // Подтверждение уведомления
    await confirmNotification(id, navigation);
    const updatedNotifications = notifications.map((notif) =>
      notif.id === id
        ? { ...notif, status: 'accepted', actualTakenAt: new Date().toISOString() }
        : notif
    );
    setNotifications(updatedNotifications);
    const today = new Date().toISOString().split('T')[0];
    await AsyncStorage.setItem(`notifications_${today}`, JSON.stringify(updatedNotifications));
    log.cyan('[confirmUserNotification] Notification confirmed:', { id });

    // Загрузка остатков
    const notification = notifications.find((notif) => notif.id === id);
    const medicationTradeName = notification?.medicationTradeName || 'Неизвестный препарат';
    const stockId = notification?.stockId;

    const { data: stocks, error: stockError } = await fetchStocksRequest(navigation);
    if (stockError) {
      log.error('[confirmUserNotification] Error fetching stocks:', stockError.message);
      throw new Error('Не удалось загрузить остатки препаратов.');
    }

    // Поиск остатка
    let stock;
    if (stockId) {
      stock = stocks.find((s) => s.id === stockId);
    } else {
      stock = stocks.find((s) => s.medicationTradeName === medicationTradeName);
    }

    if (stock && stock.remainingQuantity < 3) {
      const message = `У вас заканчивается ${medicationTradeName}, рекомендуем в скором времени приобрести.`;
      log.warn('[confirmUserNotification] Low stock warning:', { medicationTradeName, remainingQuantity: stock.remainingQuantity });
      throw new Error(message);
    }

    log.cyan('[confirmUserNotification] Stock check passed:', { medicationTradeName, remainingQuantity: stock?.remainingQuantity });
  } catch (err) {
    log.warn('[confirmUserNotification] Error:', err.message, { code: err.code, stack: err.stack });
    throw err;
  }
};