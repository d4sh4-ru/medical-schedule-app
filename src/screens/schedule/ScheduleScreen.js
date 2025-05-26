import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import styles from '../../constants/globalStyles';
import NavBar from '../../components/NavBar';
import Header from '../../components/Header';
import NotificationsList from '../../components/NotificationsList';
import ScheduleModal from '../../components/ScheduleModal';
import Toast from '../../components/Toast'; // Импорт компонента Toast
import ErrorModal from '../../components/ErrorModal'; // Импорт компонента ErrorModal
import { getNotificationsForDay, getNotificationDaysForMonth } from '../../services/notificationService';
import { getPlan, removePlan } from '../../services/planService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from '../../utils/dateUtils';

// Настройка локализации на русский язык
LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  monthNamesShort: [
    'Янв.',
    'Февр.',
    'Март',
    'Апр.',
    'Май',
    'Июнь',
    'Июль',
    'Авг.',
    'Сент.',
    'Окт.',
    'Нояб.',
    'Дек.',
  ],
  dayNames: [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня',
};

LocaleConfig.defaultLocale = 'ru';

// Компонент экрана расписаний
export default function ScheduleScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].substring(0, 7));
  const [notifications, setNotifications] = useState([]);
  const [markedDays, setMarkedDays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchDate, setLastFetchDate] = useState(new Date().toDateString());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [scheduleDetails, setScheduleDetails] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null); // Состояние для тоста
  const [errorModal, setErrorModal] = useState(null); // Состояние для модального окна ошибок

  // Проверка параметров навигации для показа тоста
  useFocusEffect(
    useCallback(() => {
      if (route.params?.showToast) {
        setToast(route.params.showToast);
        setTimeout(() => {
          setToast(null);
          navigation.setParams({ showToast: null }); // Очистка параметров
        }, 3500);
      }
    }, [route.params])
  );

  // Загрузка дней с приёмами
  const fetchMarkedDays = async (month, year) => {
    try {
      const days = await getNotificationDaysForMonth(month, year, navigation);
      await AsyncStorage.setItem(`markedDays-${month}-${year}`, JSON.stringify(days));
      return days;
    } catch (err) {
      console.warn('Ошибка загрузки отмеченных дней:', err);
      const cached = await AsyncStorage.getItem(`markedDays-${month}-${year}`);
      return cached ? JSON.parse(cached) : [];
    }
  };

  // Загрузка уведомлений
  const fetchNotifications = async (day, month, year) => {
    try {
      setIsLoading(true);
      const data = await getNotificationsForDay(day, month, year, navigation);
      setNotifications(Array.isArray(data) ? data : []);
      await AsyncStorage.setItem(`notifications-${day}-${month}-${year}`, JSON.stringify(data));
      setError(null);
    } catch (err) {
      console.warn('Ошибка загрузки уведомлений:', err);
      setError('Не удалось загрузить приёмы');
      const cached = await AsyncStorage.getItem(`notifications-${day}-${month}-${year}`);
      if (cached) {
        setNotifications(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка деталей плана
  const fetchScheduleDetails = async (scheduleId) => {
    try {
      const data = await getPlan(scheduleId, navigation);
      setScheduleDetails(data);
    } catch (err) {
      console.warn('Ошибка загрузки деталей плана:', err);
      setToast({ message: 'Не удалось загрузить данные приёма', type: 'error' });
      setTimeout(() => setToast(null), 3500);
      setScheduleDetails(null);
    }
  };

  // Инициализация
  const initialize = async (month, year) => {
    try {
      const days = await fetchMarkedDays(month, year);
      setMarkedDays(days);
    } catch (err) {
      console.warn('Ошибка загрузки отмеченных дней при инициализации:', err);
      setError('Ошибка загрузки отмеченных дней');
      setMarkedDays([]);
    }
  };

  // Загрузка уведомлений с очисткой кэша
  const loadNotifications = async (day, month, year) => {
    await AsyncStorage.removeItem(`notifications-${day}-${month}-${year}`);
    await fetchNotifications(day, month, year);
  };

  // Обновление при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      const [year, month, day] = selectedDate.split('-').map(Number);
      loadNotifications(day, month, year);
      initialize(month, year);
    }, [selectedDate])
  );

  // Очистка кэша при смене суток
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastFetchDate) {
        (async () => {
          const keys = await AsyncStorage.getAllKeys();
          const notificationKeys = keys.filter((key) => key.startsWith('notifications-') || key.startsWith('markedDays-'));
          await AsyncStorage.multiRemove(notificationKeys);
          const [year, month, day] = selectedDate.split('-').map(Number);
          await loadNotifications(day, month, year);
          await initialize(month, year);
          setLastFetchDate(currentDate);
        })();
      }
    }, 300000); // Каждые 5 минут
    return () => clearInterval(interval);
  }, [lastFetchDate, selectedDate]);

  // Очистка кэша при монтировании
  useEffect(() => {
    const clearCache = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const notificationKeys = keys.filter((key) => key.startsWith('notifications-') || key.startsWith('markedDays-'));
      await AsyncStorage.multiRemove(notificationKeys);
    };

    clearCache();

    const [year, month] = selectedDate.split('-').map(Number);
    initialize(month, year);
  }, []);

  // Отметки на календаре
  const markedDates = markedDays.reduce((acc, day) => {
    const date = `${currentMonth}-${day.toString().padStart(2, '0')}`;
    acc[date] = { marked: true, dotColor: theme.colors.primary };
    return acc;
  }, {});

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: theme.colors.accent,
  };

  // Обработчик смены месяца
  const handleMonthChange = async (date) => {
    const newMonth = date.month;
    const newYear = date.year;
    setCurrentMonth(`${newYear}-${newMonth.toString().padStart(2, '0')}`);
    await initialize(newMonth, newYear);
  };

  // Открытие модального окна
  const openModal = (notification) => {
    setSelectedNotification(notification);
    fetchScheduleDetails(notification.planId);
    setModalVisible(true);
  };

  // Удаление уведомления
  const handleDelete = async (id) => {
    setErrorModal({
      visible: true,
      title: 'Предупреждение',
      error: 'Вы уверены, что хотите удалить этот приём?',
      secondaryButtonText: 'Удалить',
      onSecondaryAction: async () => {
        try {
          await removePlan(id, navigation);
          setModalVisible(false);
          setErrorModal(null);
          const [year, month, day] = selectedDate.split('-').map(Number);
          await loadNotifications(day, month, year);
          await initialize(month, year);
          setToast({ message: 'Приём успешно удален', type: 'success' });
          setTimeout(() => setToast(null), 3500);
        } catch (err) {
          console.warn('Ошибка удаления приёма:', err);
          setErrorModal(null);
          setToast({ message: 'Не удалось удалить приём', type: 'error' });
          setTimeout(() => setToast(null), 3500);
        }
      },
      onClose: () => setErrorModal(null),
    });
  };

  // Обработчик обновления
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const [year, month, day] = selectedDate.split('-').map(Number);
    await loadNotifications(day, month, year);
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.scheduleScreen.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Расписания приёмов"
        leftIconName="list-outline"
        onLeftPress={() => navigation.navigate('ScheduleList')}
        rightIconName="add-circle-outline"
        onRightPress={() => navigation.navigate('ScheduleForm')}
      />
      <Calendar
        style={styles.scheduleScreen.calendar}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
        locale="ru"
        firstDay={1}
        theme={{
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.text,
          dayTextColor: theme.colors.text,
          todayTextColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.accent,
          selectedDayTextColor: '#ffffff',
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.text,
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />
      <View style={styles.scheduleScreen.notificationsContainer}>
        <NotificationsList
          notifications={notifications}
          isLoadingNotifications={isLoading}
          isRefreshing={isRefreshing}
          notificationsError={error}
          selectedDate={selectedDate}
          onRefresh={handleRefresh}
          onConfirmNotification={() => {}} // Заглушка
          isRetrying={false}
          getTodayFormatted={formatDate}
          onNotificationPress={openModal}
          disableSwipes={true}
        />
      </View>
      <ScheduleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        scheduleDetails={scheduleDetails}
        onEdit={() => {
          setModalVisible(false);
          navigation.navigate('ScheduleForm', {
            planId: selectedNotification?.planId,
          });
        }}
        onDelete={() => handleDelete(selectedNotification?.planId)}
        theme={theme}
      />
      {/* Рендеринг тоста */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onDismiss={() => setToast(null)}
        />
      )}
      {/* Рендеринг модального окна ошибок */}
      {errorModal && (
        <ErrorModal
          visible={errorModal.visible}
          onClose={errorModal.onClose}
          title={errorModal.title}
          error={errorModal.error}
          secondaryButtonText={errorModal.secondaryButtonText}
          onSecondaryAction={errorModal.onSecondaryAction}
        />
      )}
      <NavBar />
    </SafeAreaView>
  );
}