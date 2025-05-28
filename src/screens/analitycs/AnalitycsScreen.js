import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import globalStyles from '../../constants/globalStyles';
import NavBar from '../../components/NavBar';
import Header from '../../components/Header';
import { fetchAnalyticsData } from '../../api/planApi';

// Компонент экрана аналитики
export default function AnalyticsScreen({ navigation }) {
  const { theme } = useTheme();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAnalyticsData();
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        console.warn('[AnalyticsScreen] Ошибка загрузки аналитики:', err);
        setError('Не удалось загрузить данные аналитики');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Преобразование минут в часы и минуты
  const formatTime = (minutes) => {
    if (!minutes || isNaN(minutes)) return '0 мин';
    const totalMinutes = Math.round(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} ч`);
    }
    if (mins > 0 || (hours === 0 && mins === 0)) {
      parts.push(`${mins} мин`);
    }
    return parts.join(' ');
  };

  // Подготовка данных для диаграммы "Принятые vs Пропущенные"
  const getNotificationsChartData = () => {
    if (!analyticsData) return { successful: 0, failed: 0, successfulCount: 0, failedCount: 0, total: 0 };

    const successful = analyticsData.successful_notifications || 0;
    const totalNotifications = analyticsData.total_notifications || 0;
    const failed = analyticsData.failed_notifications !== undefined
        ? analyticsData.failed_notifications
        : totalNotifications - successful;

    const total = successful + failed;

    const successfulPercent = total > 0 ? (successful / total) * 100 : 0;
    const failedPercent = total > 0 ? (failed / total) * 100 : 0;

    return {
      successful: successfulPercent,
      failed: failedPercent,
      successfulCount: successful,
      failedCount: failed,
      total: total,
    };
  };

  // Подготовка данных для диаграммы "Уведомления vs Оставшиеся дозы"
  const getDosesChartData = () => {
    if (!analyticsData) return { notifications: 0, remaining: 0, notificationsCount: 0, remainingCount: 0, total: 0 };

    const notifications = analyticsData.total_notifications || 0;
    const remaining = analyticsData.remaining_doses || 0;
    const total = notifications + remaining;

    const notificationsPercent = total > 0 ? (notifications / total) * 100 : 0;
    const remainingPercent = total > 0 ? (remaining / total) * 100 : 0;

    return {
      notifications: notificationsPercent,
      remaining: remainingPercent,
      notificationsCount: notifications,
      remainingCount: remaining,
      total: total,
    };
  };

  const notificationsChartData = getNotificationsChartData();
  const dosesChartData = getDosesChartData();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Аналитика"
        leftIconName="arrow-back-outline"
        onLeftPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        {isLoading ? (
          <Text style={[globalStyles.common.loadingText, { color: theme.colors.text }]}>
            Загрузка данных...
          </Text>
        ) : error ? (
          <Text style={[globalStyles.common.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        ) : analyticsData ? (
          <>
            {/* Текстовые данные */}
            <View style={styles.textSection}>
              {/* <Text style={[globalStyles.common.text, styles.label, { color: theme.colors.text }]}>
                Количество дней с приёмами: {analyticsData.total_intake_days || 0}
              </Text> */}
              <Text style={[globalStyles.common.text, styles.label, { color: theme.colors.text }]}>
                Планы приёма: {analyticsData.total_plans || 0} активных планов
              </Text>
              <Text style={[globalStyles.common.text, styles.label, { color: theme.colors.text }]}>
                Среднее время отклонения:{' '}
                {formatTime(analyticsData.average_acceptance_time_minutes)}
              </Text>
            </View>

            {/* Имитация диаграммы: Пропущенные vs Принятые */}
            <View style={styles.chartSection}>
              <Text style={[globalStyles.common.text, styles.chartTitle, { color: theme.colors.text }]}>
                Пропущенные и принятые приёмы
              </Text>
              <Text style={[globalStyles.common.captionText, styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
                Принято: {notificationsChartData.successfulCount} ({notificationsChartData.successful.toFixed(1)}%),{' '}
                Пропущено: {notificationsChartData.failedCount} ({notificationsChartData.failed.toFixed(1)}%)
              </Text>
              {notificationsChartData.total > 0 ? (
                <View style={styles.horizontalBarContainer}>
                  <View style={[
                    styles.successfulBar,
                    { width: `${notificationsChartData.successful}%` }
                  ]} />
                  <View style={[
                    styles.failedBar,
                    { width: `${notificationsChartData.failed}%` }
                  ]} />
                </View>
              ) : (
                <Text style={[globalStyles.common.captionText, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 }]}>
                  Нет данных для диаграммы приёмов.
                </Text>
              )}
            </View>

            {/* Имитация диаграммы: Уведомления vs Оставшиеся дозы */}
            <View style={styles.chartSection}>
              <Text style={[globalStyles.common.text, styles.chartTitle, { color: theme.colors.text }]}>
                Уведомления и оставшиеся дозы
              </Text>
              <Text style={[globalStyles.common.captionText, styles.chartSubtitle, { color: theme.colors.textSecondary }]}>
                Уведомления: {dosesChartData.notificationsCount} ({dosesChartData.notifications.toFixed(1)}%),{' '}
                Осталось доз: {dosesChartData.remainingCount} ({dosesChartData.remaining.toFixed(1)}%)
              </Text>
              {dosesChartData.total > 0 ? (
                <View style={styles.horizontalBarContainer}>
                  <View style={[
                    styles.notificationsBar,
                    { width: `${dosesChartData.notifications}%` }
                  ]} />
                  <View style={[
                    styles.remainingDosesBar,
                    { width: `${dosesChartData.remaining}%` }
                  ]} />
                </View>
              ) : (
                <Text style={[globalStyles.common.captionText, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 }]}>
                  Нет данных для диаграммы доз.
                </Text>
              )}
            </View>
          </>
        ) : (
          <Text style={[globalStyles.common.emptyText, { color: theme.colors.text }]}>
            Нет данных для отображения
          </Text>
        )}
      </View>
      <NavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  textSection: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
  },
  chartSection: {
    marginBottom: 24,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    borderColor: '#eee',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  chartSubtitle: {
    marginBottom: 12,
  },
  // Стили для имитации диаграмм
  horizontalBarContainer: {
    flexDirection: 'row', // Располагаем элементы горизонтально
    height: 30, // Высота полосы
    borderRadius: 5, // Немного скругляем углы
    overflow: 'hidden', // Обрезаем содержимое, если оно выходит за границы скругления
    backgroundColor: '#E0E0E0', // Фоновый цвет, если сумма процентов меньше 100
    marginTop: 10,
  },
  // Стили для сегментов первой диаграммы (Принятые vs Пропущенные)
  successfulBar: {
    height: '100%',
    backgroundColor: '#007AFF', // Синий цвет для принятых
  },
  failedBar: {
    height: '100%',
    backgroundColor: '#d32f2f', // Красный цвет для пропущенных
  },
  // Стили для сегментов второй диаграммы (Уведомления vs Оставшиеся дозы)
  notificationsBar: {
    height: '100%',
    backgroundColor: '#4CAF50', // Зеленый цвет для уведомлений
  },
  remainingDosesBar: {
    height: '100%',
    backgroundColor: '#B0BEC5', // Серый цвет для оставшихся доз
  },
});