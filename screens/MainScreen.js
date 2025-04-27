import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeProvider';
import { createGlobalStyles } from '../styles/globalStyles';
import NavBar from '../components/NavBar';
import { fetchWithAuth } from '../utils/api';
import { useNavigation } from '@react-navigation/native';

export default function MainScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchDate, setLastFetchDate] = useState(new Date().toDateString());
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Для пересчёта времени
  const [isRetrying, setIsRetrying] = useState(false); // Для индикатора повторной попытки

  // Загрузка уведомлений
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setIsRetrying(true);
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/schedule/notifications/today',
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      setNotifications(data);
      await AsyncStorage.setItem('notifications', JSON.stringify(data));
      setLastFetchDate(new Date().toDateString());
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить уведомления');
      console.error('Error fetching notifications:', err);
      // Загружаем кэшированные данные
      const cached = await AsyncStorage.getItem('notifications');
      if (cached) {
        setNotifications(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  // Выполнение запроса при монтировании
  useEffect(() => {
    // Используем IIFE для асинхронной логики
    (async () => {
      try {
        // Проверяем кэш перед запросом
        const cached = await AsyncStorage.getItem('notifications');
        if (cached) {
          setNotifications(JSON.parse(cached));
          setIsLoading(false);
        }
        // Выполняем запрос к серверу
        await fetchNotifications();
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Ошибка загрузки данных');
        setIsLoading(false);
      }
    })();
  }, []);

  // Проверка смены суток и очистка кэша
  useEffect(() => {
    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();
      if (currentDate !== lastFetchDate) {
        (async () => {
          await AsyncStorage.removeItem('notifications');
          await fetchNotifications();
        })();
      }
    }, 300000); // Проверяем каждые 5 минут
    return () => clearInterval(interval);
  }, [lastFetchDate]);

  // Пересчёт времени каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger((prev) => prev + 1); // Вызывает ререндеринг
    }, 60000); // Каждую минуту
    return () => clearInterval(interval);
  }, []);

  // Функция для вычисления оставшегося времени
  const getTimeRemaining = (sentAt) => {
    const now = new Date();
    const notificationTime = new Date(sentAt);
    const diffMs = notificationTime - now;
    if (diffMs < 0) return { overdue: true, text: 'Просрочено' };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { overdue: false, text: `${hours} ч ${minutes} мин` };
  };

  // Отметка уведомления как принятого
  const markNotificationAsTaken = async (notificationId) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/schedule/notifications/${notificationId}/confirm`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'accepted', actual_taken_at: new Date().toISOString() }),
        },
        navigation
      );
      const updatedNotifications = await response.json();
      setNotifications(updatedNotifications);
      await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      setError(null);
    } catch (err) {
      console.error('Error confirming notification:', err);
      setError('Не удалось подтвердить уведомление');
    }
  };

  // Рендеринг карточки уведомления
  const renderNotification = ({ item }) => {
    const isTaken = item.status === 'accepted';
    const timeText = isTaken
      ? new Date(item.sent_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      : getTimeRemaining(item.sent_at).text;
    const isOverdue = !isTaken && getTimeRemaining(item.sent_at).overdue;

    return (
      <View style={[styles.card, isTaken ? styles.cardCompleted : isOverdue && styles.cardOverdue]}>
        <View>
          <Text style={styles.bodyText}>{item.medicationTradeName}</Text>
          <Text style={isOverdue ? styles.overdueText : styles.captionText}>{timeText}</Text>
        </View>
        <TouchableOpacity
          style={[styles.markButton, isTaken && styles.markButtonCompleted]}
          onPress={() => markNotificationAsTaken(item.id)}
          disabled={isTaken}
        >
          <Text style={styles.markButtonText}>{isTaken ? '✔' : 'Отметить'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && notifications.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.bodyText}>{error}</Text>
          <TouchableOpacity style={styles.markButton} onPress={fetchNotifications} disabled={isRetrying}>
            {isRetrying ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.markButtonText}>Повторить</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Сегодня</Text>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<Text style={styles.bodyText}>Нет уведомлений на сегодня</Text>}
          />
        </>
      )}
      <NavBar />
    </View>
  );
}