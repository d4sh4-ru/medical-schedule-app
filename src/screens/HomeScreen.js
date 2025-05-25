import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getWeekDaysForCalendar, getTodayFormatted } from '../utils/dateUtils';
import { getNotificationsForToday, getNotificationsForDay, confirmUserNotification } from '../services/notificationService';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import WeekCalendar from '../components/WeekCalendar';
import NotificationsList from '../components/NotificationsList';
import ErrorModal from '../components/ErrorModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../constants/globalStyles';
import log from '../utils/coloredLog';

const HomeScreen = () => {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const navigation = useNavigation();
  const [weeks, setWeeks] = useState(generateWeeks(today));
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, error: null, secondaryButtonText: null, onSecondaryAction: null });
  const [isRetrying, setIsRetrying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Генерация недель для календаря
  function generateWeeks(startDate) {
    const weeks = [];
    const start = new Date(startDate);
    start.setDate(start.getDate() - 21); // 3 недели назад
    for (let i = 0; i < 7; i++) {
      const weekStart = new Date(start);
      weekStart.setDate(start.getDate() + i * 7);
      weeks.push(getWeekDaysForCalendar(weekStart));
    }
    return weeks;
  }

  // Проверка, находится ли дата в текущей неделе
  const isDateInCurrentWeek = (date) => {
    const currentWeek = weeks.find(week =>
      week.some(day => day.date.toDateString() === selectedDate.toDateString())
    );
    const result = currentWeek?.some(day => day.date.toDateString() === date.toDateString()) || false;
    log.magenta('[HomeScreen] isDateInCurrentWeek:', { date: date.toISOString(), result });
    return result;
  };

  // Загрузка уведомлений
  useEffect(() => {
    loadNotifications(selectedDate);
  }, [selectedDate]);

  const loadNotifications = async (date) => {
    try {
      setIsLoadingNotifications(true);
      const isToday = date.toDateString() === today.toDateString();
      let data;
      if (isToday) {
        data = await getNotificationsForToday(navigation);
      } else {
        data = await getNotificationsForDay(
          date.getDate(),
          date.getMonth() + 1,
          date.getFullYear(),
          navigation
        );
      }
      log.magenta('[HomeScreen] Loaded notifications:', { date: date.toISOString(), data });

      const notificationsData = Array.isArray(data) ? data : [];
      if (!data) {
        log.warn('[HomeScreen] No data returned from API, using empty array');
      }
      setNotifications(notificationsData);
      log.magenta('[HomeScreen] Set notifications:', notificationsData);
      setErrorModal({ visible: false, error: null, secondaryButtonText: null, onSecondaryAction: null });

      const cacheKey = `notifications_${date.toISOString().split('T')[0]}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(notificationsData));
    } catch (err) {
      log.error('[HomeScreen] Error in loadNotifications:', err.message, { stack: err.stack });
      setErrorModal({
        visible: true,
        error: err.message || 'Не удалось загрузить уведомления. Проверьте подключение к интернету.',
        secondaryButtonText: null,
        onSecondaryAction: null,
      });
      const cacheKey = `notifications_${date.toISOString().split('T')[0]}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          const notificationsData = Array.isArray(cachedData) ? cachedData : [];
          setNotifications(notificationsData);
          log.magenta('[HomeScreen] Set cached notifications:', notificationsData);
        } catch (parseErr) {
          log.error('[HomeScreen] Error parsing cached data:', parseErr.message);
        }
      }
    } finally {
      setIsLoadingNotifications(false);
      setIsRefreshing(false);
    }
  };

  // Обработчик обновления при потягивании
  const onRefresh = () => {
    setIsRefreshing(true);
    loadNotifications(selectedDate);
  };

  // Обработчик подтверждения уведомления
  const handleConfirmNotification = async (notificationId) => {
    if (notificationId === 0) return;
    setIsRetrying(true);
    try {
      await confirmUserNotification(notificationId, notifications, setNotifications, navigation);
      await loadNotifications(selectedDate);
      setErrorModal({ visible: false, error: null, secondaryButtonText: null, onSecondaryAction: null });
    } catch (error) {
      const notification = notifications.find((notif) => notif.id === notificationId);
      const medicationTradeName = notification?.medicationTradeName || 'Неизвестный препарат';
      const stockId = notification?.stockId; // Предполагается, что уведомление может содержать stockId
      if (error.message.includes('У вас нет запасов данного препарата.')) {
        setErrorModal({
          visible: true,
          error: `У вас нет запасов препарата "${medicationTradeName}". Добавить запас?`,
          secondaryButtonText: 'Добавить',
          onSecondaryAction: () => {
            navigation.navigate('StockForm', { medicationTradeName });
            setErrorModal({ visible: false, error: null, secondaryButtonText: null, onSecondaryAction: null });
          },
        });
      } else if (error.message.includes('Недостаточное количество препарата.')) {
        setErrorModal({
          visible: true,
          error: `Недостаточное количество препарата "${medicationTradeName}". Увеличить запас?`,
          secondaryButtonText: 'Увеличить',
          onSecondaryAction: () => {
            navigation.navigate('Stock', { medicationTradeName, stockId, editStock: true });
            setErrorModal({ visible: false, error: null, secondaryButtonText: null, onSecondaryAction: null });
          },
        });
      } else {
        setErrorModal({
          visible: true,
          error: error.message || 'Ошибка при подтверждении уведомления',
          secondaryButtonText: null,
          onSecondaryAction: null,
        });
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // Обработчик выбора дня
  const handleSelectDay = (date) => {
    const newDate = new Date(date);
    setSelectedDate(newDate);
    log.magenta('[HomeScreen] Selected day:', newDate.toISOString());
  };

  // Обработчик смены недели
  const handleWeekChange = (newSelectedDate) => {
    const newDate = new Date(newSelectedDate);
    const newWeeks = generateWeeks(newDate);
    setWeeks(newWeeks);
    setSelectedDate(newDate);
    log.magenta('[HomeScreen] Week changed:', { newDate: newDate.toISOString(), weeks: newWeeks });
  };

  // Обработчик свайпов
  const handleSwipe = (newDate) => {
    const isLeftSwipe = newDate.getTime() > selectedDate.getTime();
    log.magenta('[HomeScreen] handleSwipe:', {
      newDate: newDate.toISOString(),
      selectedDate: selectedDate.toISOString(),
      isLeftSwipe,
    });

    if (!isDateInCurrentWeek(newDate)) {
      const weekStart = new Date(newDate);
      if (isLeftSwipe) {
        weekStart.setDate(newDate.getDate() - newDate.getDay() + (newDate.getDay() === 0 ? -6 : 1));
      } else {
        weekStart.setDate(newDate.getDate() - newDate.getDay() + (newDate.getDay() === 0 ? -6 : 1));
      }
      log.magenta('[HomeScreen] Calculated weekStart:', weekStart.toISOString());
      handleWeekChange(weekStart);
      setSelectedDate(newDate);
      log.magenta('[HomeScreen] Week changed via swipe:', {
        weekStart: weekStart.toISOString(),
        selectedDate: newDate.toISOString(),
      });
    } else {
      setSelectedDate(newDate);
      log.magenta('[HomeScreen] Date changed via swipe:', newDate.toISOString());
    }
  };

  return (
    <SafeAreaView style={styles.homeScreen.container}>
      <StatusBar barStyle="dark-content" />
      <Header
        title={getTodayFormatted(selectedDate)}
        leftIconName="settings-outline"
        onLeftPress={() => navigation.navigate('Settings')}
        // rightIconName="calendar-outline"
        // onRightPress={() => navigation.navigate('Calendar')}
      />
      <WeekCalendar
        weeks={weeks}
        selectedDate={selectedDate}
        onSelectDay={handleSelectDay}
        onWeekChange={handleWeekChange}
      />
      <NotificationsList
        notifications={notifications}
        isLoadingNotifications={isLoadingNotifications}
        isRefreshing={isRefreshing}
        selectedDate={selectedDate}
        onRefresh={onRefresh}
        onConfirmNotification={handleConfirmNotification}
        isRetrying={isRetrying}
        getTodayFormatted={getTodayFormatted}
        onLeftSwipe={handleSwipe}
        onRightSwipe={handleSwipe}
      />
      <ErrorModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, error: null, secondaryButtonText: null, onSecondaryAction: null })}
        error={errorModal.error}
        secondaryButtonText={errorModal.secondaryButtonText}
        onSecondaryAction={errorModal.onSecondaryAction}
      />
      <NavBar />
    </SafeAreaView>
  );
};

export default HomeScreen;