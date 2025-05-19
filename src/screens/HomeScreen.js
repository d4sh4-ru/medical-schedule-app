import React, { useMemo, useState, useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getWeekDaysForCalendar, getTodayFormatted } from '../utils/dateUtils';
import { getNotificationsForToday, getNotificationsForDay, confirmUserNotification } from '../services/notificationService';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import WeekCalendar from '../components/WeekCalendar';
import NotificationsList from '../components/NotificationsList';
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
  const [notificationsError, setNotificationsError] = useState(null);
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
        data = await getNotificationsForToday(null, setIsLoadingNotifications, setNotifications, setNotificationsError);
      } else {
        data = await getNotificationsForDay(
          date.getDate(),
          date.getMonth() + 1,
          date.getFullYear(),
          null
        );
      }
      log.magenta('[HomeScreen] Loaded notifications:', { date: date.toISOString(), data });

      const notificationsData = Array.isArray(data) ? data : [];
      if (!data) {
        log.warn('[HomeScreen] No data returned from API, using empty array');
      }
      setNotifications(notificationsData);
      log.magenta('[HomeScreen] Set notifications:', notificationsData);
      setNotificationsError(null);

      const cacheKey = `notifications_${date.toISOString().split('T')[0]}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(notificationsData));
    } catch (err) {
      log.error('[HomeScreen] Error in loadNotifications:', err.message, { stack: err.stack });
      const errorMessage = err.message.includes('fetchWithAuth')
        ? 'Ошибка конфигурации приложения. Обратитесь в поддержку.'
        : 'Не удалось загрузить уведомления. Проверьте подключение к интернету.';
      setNotificationsError(errorMessage);
      const cacheKey = `notifications_${date.toISOString().split('T')[0]}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        const notificationsData = Array.isArray(cachedData) ? cachedData : [];
        setNotifications(notificationsData);
        log.magenta('[HomeScreen] Set cached notifications:', notificationsData);
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
      await confirmUserNotification(notificationId, notifications, setNotifications, null);
      await loadNotifications(selectedDate);
    } catch (error) {
      setNotificationsError(error.message || 'Ошибка при подтверждении уведомления');
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
        // Свайп влево: начало недели, содержащей newDate
        weekStart.setDate(newDate.getDate() - newDate.getDay() + (newDate.getDay() === 0 ? -6 : 1));
      } else {
        // Свайп вправо: начало предыдущей недели
        weekStart.setDate(newDate.getDate() - newDate.getDay() - 7);
      }
      log.magenta('[HomeScreen] Calculated weekStart:', weekStart.toISOString());
      handleWeekChange(weekStart);
      log.magenta('[HomeScreen] Week changed via swipe:', weekStart.toISOString());
    } else {
      setSelectedDate(newDate);
      log.magenta('[HomeScreen] Date changed via swipe:', newDate.toISOString());
    }
  };

  return (
    <SafeAreaView style={styles.homeScreen.container}>
      <StatusBar barStyle="light-content" />
      <Header
        title={getTodayFormatted(selectedDate)}
        leftIconName="settings-outline"
        onLeftPress={() => navigation.navigate('Settings')}
        rightIconName="calendar-outline"
        onRightPress={() => navigation.navigate('Calendar')}
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
        notificationsError={notificationsError}
        selectedDate={selectedDate}
        onRefresh={onRefresh}
        onConfirmNotification={handleConfirmNotification}
        isRetrying={isRetrying}
        getTodayFormatted={getTodayFormatted}
        onLeftSwipe={handleSwipe}
        onRightSwipe={handleSwipe}
      />
      <NavBar />
    </SafeAreaView>
  );
};

export default HomeScreen;