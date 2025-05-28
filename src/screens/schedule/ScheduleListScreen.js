import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import styles from '../../constants/globalStyles';
import { FAB } from 'react-native-elements';
import NavBar from '../../components/NavBar';
import Header from '../../components/Header';
import ScheduleModal from '../../components/ScheduleModal';
import Toast from '../../components/Toast'; // Импорт компонента Toast
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPlans, removePlan } from '../../services/planService';
import { formatDate } from '../../utils/dateUtils';

// Компонент экрана списка расписаний
export default function ScheduleListScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState(null); // Состояние для тоста

  // Открытие модального окна
  const openModal = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    setSelectedPlan(plan);
    setModalVisible(true);
    console.log('[ScheduleListScreen] Открыто модальное окно для плана:', planId);
  };

  // Загрузка планов
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const data = await getPlans(navigation);
      const plansData = Array.isArray(data) ? data : [];
      setPlans(plansData);
      await AsyncStorage.setItem('plans', JSON.stringify(plansData));
      setError(null);
      console.log('[ScheduleListScreen] Загружены планы:', plansData);
    } catch (err) {
      console.warn('[ScheduleListScreen] Ошибка загрузки планов:', err);
      setError('Не удалось загрузить планы');
      const cached = await AsyncStorage.getItem('plans');
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          setPlans(Array.isArray(cachedData) ? cachedData : []);
        } catch (parseErr) {
          console.warn('[ScheduleListScreen] Ошибка парсинга кэшированных планов:', parseErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление плана
  const handleDelete = async (planId) => {
    try {
      await removePlan(planId, navigation);
      setPlans((prev) => prev.filter((plan) => plan.id !== planId));
      await AsyncStorage.setItem('plans', JSON.stringify(plans.filter((plan) => plan.id !== planId)));
      setModalVisible(false);
      setSelectedPlan(null);
      // Показ тоста об успешном удалении
      setToast({ message: 'План успешно удален', type: 'success' });
      setTimeout(() => setToast(null), 3500); // Скрытие тоста после анимации
      console.log('[ScheduleListScreen] Удален план:', planId);
    } catch (err) {
      console.warn('[ScheduleListScreen] Ошибка удаления плана:', err);
      setError('Не удалось удалить план');
      // Показ тоста с ошибкой
      setToast({ message: 'Не удалось удалить план', type: 'error' });
      setTimeout(() => setToast(null), 3500);
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    fetchPlans();
  }, []);

  // Обновление при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [])
  );

  // Обработчик pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await AsyncStorage.removeItem('plans');
    await fetchPlans();
    setIsRefreshing(false);
  };

  // Рендеринг карточки плана
  const renderPlan = ({ item }) => (
    <TouchableOpacity
      style={[styles.common.card, { backgroundColor: theme.colors.cardBackground || '#f9f9f9' }]}
      onPress={() => openModal(item.id)}
      activeOpacity={0.7}
    >
      <View>
        <Text style={[styles.common.text, { color: theme.colors.text }]}>
          {item.medicationTradeName || 'Без названия'}
        </Text>
        <Text style={[styles.common.captionText, { color: theme.colors.textSecondary || '#666' }]}>
          Тип: {item.type === 'custom' ? 'Индивидуальный' : 'Равномерный'}
        </Text>
        {item.type === 'uniform' && (
          <>
            <Text style={[styles.common.captionText, { color: theme.colors.textSecondary || '#666' }]}>
              Дозировка: {item.singleDosageTablets} табл. x {item.singleDosage}
            </Text>
            <Text style={[styles.common.captionText, { color: theme.colors.textSecondary || '#666' }]}>
              Начало: {formatDate(item.startDate)}
            </Text>
            <Text style={[styles.common.captionText, { color: theme.colors.textSecondary || '#666' }]}>
              Конец: {formatDate(item.endDate)}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.scheduleListScreen.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Список расписаний"
        onLeftPress={() => navigation.navigate('Schedule')}
        leftIconName="close-outline"
        onRightPress={() => navigation.navigate('ScheduleArchive')}
        rightIconName="archive-outline"
      />
      <View style={styles.scheduleListScreen.listContainer}>
        {isLoading && !isRefreshing ? (
          <Text style={[styles.common.loadingText, { color: theme.colors.text }]}>Загрузка планов...</Text>
        ) : error ? (
          <Text style={[styles.common.errorText, { color: theme.colors.error }]}>{error}</Text>
        ) : plans.length === 0 ? (
          <Text style={[styles.common.emptyText, { color: theme.colors.text }]}>Нет планов</Text>
        ) : (
          <>
            <Text style={[styles.common.debugText, { color: theme.colors.textSecondary || '#666' }]}>
              Расписаний: {plans.length}
            </Text>
            <FlatList
              data={plans}
              renderItem={renderPlan}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.notificationsList.list}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[theme.colors.primary || '#007AFF']}
                  tintColor={theme.colors.primary || '#007AFF'}
                />
              }
            />
          </>
        )}
      </View>
      <FAB
        title="+"
        placement="right"
        color={theme.colors.primary}
        onPress={() => navigation.navigate('ScheduleForm')}
        buttonStyle={{ borderRadius: 50, width: 60, height: 60 }}
        titleStyle={{ fontSize: 24 }}
        containerStyle={{
          position: 'absolute',
          bottom: 80,
          right: 10,
        }}
      />
      <ScheduleModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedPlan(null);
        }}
        scheduleDetails={selectedPlan}
        onEdit={() => {
          setModalVisible(false);
          navigation.navigate('ScheduleForm', {
            planId: selectedPlan?.id,
          });
          setSelectedPlan(null);
        }}
        onDelete={() => handleDelete(selectedPlan?.id)}
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
      <NavBar />
    </SafeAreaView>
  );
}