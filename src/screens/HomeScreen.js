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
      console.log('Loaded notifications:', { date: date.toISOString(), data });
      
      const notificationsData = Array.isArray(data) ? data : [];
      if (!data) {
        console.warn('No data returned from API, using empty array');
      }
      setNotifications(notificationsData);
      console.log('Set notifications:', notificationsData);
      setNotificationsError(null);
      
      const cacheKey = `notifications_${date.toISOString().split('T')[0]}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(notificationsData));
    } catch (err) {
      console.error('Error in loadNotifications:', err);
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
        console.log('Set cached notifications:', notificationsData);
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
    setSelectedDate(new Date(date));
  };

  // Обработчик смены недели
  const handleWeekChange = (newSelectedDate) => {
    setSelectedDate(new Date(newSelectedDate));
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
      />
      <NavBar />
    </SafeAreaView>
  );
};

export default HomeScreen;