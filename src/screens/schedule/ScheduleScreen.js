import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, StyleSheet, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { createGlobalStyles } from '../../constants/globalStyles';
import Svg, { Path, Circle } from 'react-native-svg';
import { FAB } from 'react-native-elements';
import NavBar from '../../components/NavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from '../../api/fetchWithAuth';
import Header from '../../components/Header';

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
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

  //TODO: использовать глобальные стили
  // Локальные стили
  const localStyles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: 8,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text || '#000000',
      opacity: 1,
      overflow: 'visible',
    },
    timeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    timeText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 8,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      flexWrap: 'wrap',
    },
    dateText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 8,
      flexWrap: 'wrap',
    },
  });

  // Форматирование времени
  const formatTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return 'Неверное время';
    }
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  // Форматирование даты
  const formatDate = (date) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Неверная дата';
    }
    return parsedDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };


  // TODO: убрать при переходе на использование NotificationList
  // Иконка статуса
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 16.2l-3.5-3.5L4 14.2l5 5L20 8l-1.4-1.4L9 16.2z"
              fill={theme.colors.success || '#00FF00'}
            />
          </Svg>
        );
      case 'pending':
        return (
          <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="10" stroke={theme.colors.primary} strokeWidth="2" />
            <Path d="M12 6v6l4 2" stroke={theme.colors.primary} strokeWidth="2" />
          </Svg>
        );
      case 'expired':
        return (
          <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 18L18 6M6 6l12 12"
              stroke={theme.colors.error}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        );
      default:
        return null;
    }
  };

  // TODO: убрать при переходе на использование NotificationList
  // Рендеринг времени приёма
  const renderTimeItem = ({ item }) => (
    <View style={localStyles.timeItem}>
      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={theme.colors.primary} strokeWidth="2" />
        <Path d="M12 6v6l4 2" stroke={theme.colors.primary} strokeWidth="2" />
      </Svg>
      <Text style={localStyles.timeText}>{item}</Text>
    </View>
  );

  // TODO: использовать методы сервиса
  // Загрузка дней с приёмами
  const fetchMarkedDays = async (month, year) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/notifications/month/${month}/${year}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      // Handle null days response
      const days = data.days || [];
      await AsyncStorage.setItem(`markedDays-${month}-${year}`, JSON.stringify(days));
      return days;
    } catch (err) {
      console.error('Error fetching marked days:', err);
      const cached = await AsyncStorage.getItem(`markedDays-${month}-${year}`);
      return cached ? JSON.parse(cached) : [];
    }
  };

  // TODO: использовать методы сервиса
  // Загрузка уведомлений на день
  const fetchNotifications = async (day, month, year) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/notifications/day/${day}/${month}/${year}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      setNotifications(data);
      await AsyncStorage.setItem(`notifications-${day}-${month}-${year}`, JSON.stringify(data));
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Не удалось загрузить приёмы');
      const cached = await AsyncStorage.getItem(`notifications-${day}-${month}-${year}`);
      if (cached) {
        setNotifications(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: использовать методы сервиса
  // Загрузка деталей приёма
  const fetchScheduleDetails = async (scheduleId) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/${scheduleId}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      setScheduleDetails(data);
    } catch (err) {
      console.error('Error fetching schedule details:', err);
      Alert.alert('Ошибка', 'Не удалось загрузить данные приёма');
      setScheduleDetails(null);
    }
  };

  // Инициализация
  const initialize = async (month, year) => {
    try {
      const days = await fetchMarkedDays(month, year);
      setMarkedDays(days);
    } catch (err) {
      console.error('Error fetching marked days during init:', err);
      setError('Ошибка загрузки отмеченных дней');
      setMarkedDays([]);
    }
  };

  // TODO: использовать методы сервиса
  // Загрузка уведомлений и очистка кэша
  const loadNotifications = async (day, month, year) => {
    await AsyncStorage.removeItem(`notifications-${day}-${month}-${year}`);
    await fetchNotifications(day, month, year);
  };

  // TODO: использовать методы сервиса
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

  // Обновление при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      const [year, month, day] = selectedDate.split('-').map(Number);
      loadNotifications(day, month, year);
      initialize(month, year);
    }, [selectedDate])
  );

  // TODO: использовать методы сервиса
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

  // TODO: использовать методы сервиса
  // Удаление уведомления
  const handleDelete = async (id) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этот приём?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetchWithAuth(
                `http://cloud-ru-test.netbird.cloud:8080/api/plan/${id}`,
                { method: 'DELETE' },
                navigation
              );
              setModalVisible(false);
              const [year, month, day] = selectedDate.split('-').map(Number);
              await loadNotifications(day, month, year);
              await initialize(month, year);
            } catch (err) {
              console.error('Error deleting notification:', err);
              Alert.alert('Ошибка', 'Не удалось удалить приём');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: 100 }]}>
      <Header
        title="Расписания приёмов"
      />
      <Calendar
        style={styles.calendar}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        onMonthChange={handleMonthChange}
        markedDates={markedDates}
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
      <ScrollView style={{ flex: 1 }}>
        {isLoading ? (
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 20 }]}>Загрузка...</Text>
        ) : error && notifications.length === 0 ? (
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 20 }]}>{error}</Text>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.card}
              onPress={() => openModal(notification)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{notification.medicationTradeName}</Text>
                <Text style={styles.cardText}>Время: {formatTime(notification.sentAt)}</Text>
              </View>
              <View style={styles.cardActions}>{renderStatusIcon(notification.status)}</View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 20 }]}>
            Нет приёмов на эту дату
          </Text>
        )}
      </ScrollView>
      {/* TODO: вынести в отдельный компонент */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={localStyles.modalContainer}>
          <View style={localStyles.modalContent}>
            {scheduleDetails ? (
              <>
                <Text style={localStyles.modalTitle}>{scheduleDetails.medicationTradeName}</Text>
                <Text style={localStyles.modalText}>
                  Дозировка: {scheduleDetails.singleDosageTablets} табл. x{' '}
                  {scheduleDetails.singleDosage}
                </Text>
                <View style={{ marginBottom: 8 }}>
                  <Text style={localStyles.modalText}>Время приёма:</Text>
                  <FlatList
                    data={scheduleDetails.administrationTimes.split(',')}
                    renderItem={renderTimeItem}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </View>
                <View style={localStyles.dateContainer}>
                  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v2H7v-2zm6 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
                      fill={theme.colors.primary}
                    />
                  </Svg>
                  <View style={{ marginLeft: 8 }}>
                    <Text style={localStyles.dateText}>
                      Начало: {formatDate(scheduleDetails.startDate)}
                    </Text>
                    <Text style={localStyles.dateText}>
                      Конец: {formatDate(scheduleDetails.endDate)}
                    </Text>
                  </View>
                </View>
                <View style={localStyles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[localStyles.modalButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('ScheduleForm', {
                        planId: selectedNotification?.planId,
                      });
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                          fill="#ffffff"
                        />
                      </Svg>
                      <Text style={[localStyles.modalButtonText, { color: '#ffffff', marginLeft: 4 }]}>
                        Редактировать
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[localStyles.modalButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => handleDelete(selectedNotification?.planId)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                          fill="#ffffff"
                        />
                      </Svg>
                      <Text style={[localStyles.modalButtonText, { color: '#ffffff', marginLeft: 4 }]}>
                        Удалить
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[localStyles.modalButton, { backgroundColor: '#000000', marginTop: 10 }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[localStyles.modalButtonText, { color: '#FFFFFF', backgroundColor: 'transparent', opacity: 1 }]}>Закрыть</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={localStyles.modalText}>Загрузка данных...</Text>
            )}
          </View>
        </View>
      </Modal>
      <FAB
        title="+"
        placement="right"
        color={theme.colors.primary}
        onPress={() => navigation.navigate('ScheduleForm')}
        buttonStyle={{ borderRadius: 50, width: 60, height: 60 }}
        titleStyle={{ fontSize: 24 }}
        containerStyle={{
          position: 'absolute',
          bottom: 55,
          right: 10,
        }}
      />
      <NavBar />
    </View>
  );
}