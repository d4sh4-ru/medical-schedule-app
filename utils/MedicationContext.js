import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from './api';

export const MedicationContext = createContext();

export const MedicationProvider = ({ children, navigation }) => {
  const [stocks, setStocks] = useState([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [stocksError, setStocksError] = useState(null);

  // --- Остатки (Stock) ---

  // Получение всех остатков
  const fetchStocks = async () => {
    try {
      setIsLoadingStocks(true);
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan/restock',
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      setStocks(data);
      await AsyncStorage.setItem('stocks', JSON.stringify(data));
      setStocksError(null);
    } catch (err) {
      setStocksError('Не удалось загрузить остатки');
      console.error('Error fetching stocks:', err);
      const cached = await AsyncStorage.getItem('stocks');
      if (cached) {
        setStocks(JSON.parse(cached));
      }
    } finally {
      setIsLoadingStocks(false);
    }
  };

  // Инициализация остатков при монтировании
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('stocks');
        if (cached) {
          setStocks(JSON.parse(cached));
          setIsLoadingStocks(false);
        }
        await fetchStocks();
      } catch (err) {
        console.error('Error loading stocks:', err);
        setStocksError('Ошибка загрузки остатков');
        setIsLoadingStocks(false);
      }
    })();
  }, []);

  // Создание нового остатка
  const addStock = async (stock) => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan/restock',
        {
          method: 'POST',
          body: JSON.stringify(stock),
        },
        navigation
      );
      const newStock = await response.json();
      setStocks([...stocks, newStock]);
      await AsyncStorage.setItem('stocks', JSON.stringify([...stocks, newStock]));
      setStocksError(null);
    } catch (err) {
      console.error('Error adding stock:', err);
      setStocksError('Не удалось добавить остаток');
      throw err;
    }
  };

  // Обновление остатка
  const updateStock = async (id, updatedStock) => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan/restock',
        {
          method: 'PUT',
          body: JSON.stringify({ id, ...updatedStock }),
        },
        navigation
      );
      const newStock = await response.json();
      const updatedStocks = stocks.map((stock) => (stock.id === id ? newStock : stock));
      setStocks(updatedStocks);
      await AsyncStorage.setItem('stocks', JSON.stringify(updatedStocks));
      setStocksError(null);
    } catch (err) {
      console.error('Error updating stock:', err);
      setStocksError('Не удалось обновить остаток');
      throw err;
    }
  };

  // Удаление остатка
  const deleteStock = async (id) => {
    try {
      await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/restock/${id}`,
        { method: 'DELETE' },
        navigation
      );
      const updatedStocks = stocks.filter((stock) => stock.id !== id);
      setStocks(updatedStocks);
      await AsyncStorage.setItem('stocks', JSON.stringify(updatedStocks));
      setStocksError(null);
    } catch (err) {
      console.error('Error deleting stock:', err);
      setStocksError('Не удалось удалить остаток');
      throw err;
    }
  };

  // Получение одного остатка
  const getStock = async (id) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/restock/${id}`,
        { method: 'GET' },
        navigation
      );
      const stock = await response.json();
      return stock;
    } catch (err) {
      console.error('Error fetching stock:', err);
      setStocksError('Не удалось загрузить остаток');
      throw err;
    }
  };

  // --- Планы приёма (Plan) ---

  // Создание обычного плана
  const createPlan = async (plan) => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan',
        {
          method: 'POST',
          body: JSON.stringify(plan),
        },
        navigation
      );
      const newPlan = await response.json();
      return newPlan;
    } catch (err) {
      console.error('Error creating plan:', err);
      throw new Error('Не удалось создать план');
    }
  };

  // Создание кастомного плана
  const createCustomPlan = async (customPlan) => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan/custom',
        {
          method: 'POST',
          body: JSON.stringify(customPlan),
        },
        navigation
      );
      const newPlan = await response.json();
      return newPlan;
    } catch (err) {
      console.error('Error creating custom plan:', err);
      throw new Error('Не удалось создать кастомный план');
    }
  };

  // Получение всех планов
  const fetchPlans = async () => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan',
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching plans:', err);
      throw new Error('Не удалось загрузить планы');
    }
  };

  // Получение одного плана
  const fetchPlan = async (id) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/${id}`,
        { method: 'GET' },
        navigation
      );
      const plan = await response.json();
      return plan;
    } catch (err) {
      console.error('Error fetching plan:', err);
      throw new Error('Не удалось загрузить план');
    }
  };

  // Удаление плана
  const deletePlan = async (id) => {
    try {
      await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/${id}`,
        { method: 'DELETE' },
        navigation
      );
    } catch (err) {
      console.error('Error deleting plan:', err);
      throw new Error('Не удалось удалить план');
    }
  };

  // Обновление обычного плана
  const updatePlan = async (id, updatedPlan) => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan',
        {
          method: 'PUT',
          body: JSON.stringify({ id, ...updatedPlan }),
        },
        navigation
      );
      const updatedPlanData = await response.json();
      return updatedPlanData;
    } catch (err) {
      console.error('Error updating plan:', err);
      throw new Error('Не удалось обновить план');
    }
  };

  // --- Уведомления (Notifications) ---

  // Получение уведомлений на сегодня
  const fetchTodayNotifications = async () => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan/notifications/today',
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching today notifications:', err);
      throw new Error('Не удалось загрузить уведомления на сегодня');
    }
  };

  // Получение уведомлений на конкретный день
  const fetchDayNotifications = async (day, month, year) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/notifications/day/${day}/${month}/${year}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching day notifications:', err);
      throw new Error('Не удалось загрузить уведомления за день');
    }
  };

  // Получение дней с приёмами в месяце
  const fetchMonthNotificationDays = async (month, year) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/notifications/month/${month}/${year}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data.days || [];
    } catch (err) {
      console.error('Error fetching month notification days:', err);
      return [];
    }
  };

  // Подтверждение уведомления
  const confirmNotification = async (id) => {
    try {
      await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/plan/notifications/${id}/confirm`,
        { method: 'PATCH' },
        navigation
      );
    } catch (err) {
      console.error('Error confirming notification:', err);
      throw new Error('Не удалось подтвердить уведомление');
    }
  };

  // --- Медикаменты (Medications) ---

  // Получение списка имён медикаментов
  const fetchMedicationNames = async (isDietarySupplement = null) => {
    try {
      const url = new URL('http://cloud-ru-test.netbird.cloud:8080/api/medications/names');
      if (isDietarySupplement !== null) {
        url.searchParams.append('isDietarySupplement', isDietarySupplement);
      }
      const response = await fetchWithAuth(url.toString(), { method: 'GET' }, navigation);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching medication names:', err);
      throw new Error('Не удалось загрузить список медикаментов');
    }
  };

  // Получение полной информации о медикаменте
  const fetchMedicationDetails = async (name) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/medications/${encodeURIComponent(name)}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching medication details:', err);
      throw new Error('Не удалось загрузить информацию о медикаменте');
    }
  };

  // Поиск медикаментов по префиксу
  const searchMedications = async (prefix) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/medications/search?prefix=${encodeURIComponent(prefix)}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data.names;
    } catch (err) {
      console.error('Error searching medications:', err);
      throw new Error('Не удалось выполнить поиск медикаментов');
    }
  };

  // Проверка существования медикамента
  const checkMedicationExists = async (name) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/medications/exists/${encodeURIComponent(name)}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error checking medication existence:', err);
      throw new Error('Не удалось проверить существование медикамента');
    }
  };

  // Получение инструкции по медикаменту
  const fetchMedicationInstruction = async (name) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/medications/${encodeURIComponent(name)}/instruction`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching medication instruction:', err);
      throw new Error('Не удалось загрузить инструкцию');
    }
  };

  // Создание нового БАД
  const createDietarySupplement = async (supplement) => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/medications/dietary-supplements',
        {
          method: 'POST',
          body: JSON.stringify(supplement),
        },
        navigation
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error creating dietary supplement:', err);
      throw new Error('Не удалось создать БАД');
    }
  };

  return (
    <MedicationContext.Provider
      value={{
        // Остатки
        stocks,
        fetchStocks,
        addStock,
        updateStock,
        deleteStock,
        getStock,
        isLoadingStocks,
        stocksError,
        // Планы
        createPlan,
        createCustomPlan,
        fetchPlans,
        fetchPlan,
        deletePlan,
        updatePlan,
        // Уведомления
        fetchTodayNotifications,
        fetchDayNotifications,
        fetchMonthNotificationDays,
        confirmNotification,
        // Медикаменты
        fetchMedicationNames,
        fetchMedicationDetails,
        searchMedications,
        checkMedicationExists,
        fetchMedicationInstruction,
        createDietarySupplement,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};