import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAuth } from './api';

export const MedicationContext = createContext();

export const MedicationProvider = ({ children, navigation }) => {
  const [medications, setMedications] = useState([
    {
      id: '1',
      name: 'Парацетамол',
      tabletCount: 2,
      tabletDosage: 500,
      times: [new Date(2025, 3, 20, 8, 0), new Date(2025, 3, 20, 20, 0)],
    },
    {
      id: '2',
      name: 'Ибупрофен',
      tabletCount: 1,
      tabletDosage: 400,
      times: [new Date(2025, 3, 21, 12, 0)],
    },
  ]);

  const [stocks, setStocks] = useState([]);
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [stocksError, setStocksError] = useState(null);

  // Загрузка остатков с сервера
  const fetchStocks = async () => {
    try {
      setIsLoadingStocks(true);
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/schedule/restock',
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

  // Инициализация при монтировании
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

  // Добавление остатка
  const addStock = async (stock) => {
    try {
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/schedule/restock',
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
    }
  };

  // Обновление остатка
  const updateStock = async (id, updatedStock) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/schedule/restock`,
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
    }
  };

  // Удаление остатка
  const deleteStock = async (id) => {
    try {
      await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/schedule/restock/${id}`,
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
    }
  };

  // Получение одного остатка
  const getStock = async (id) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/schedule/restock/${id}`,
        { method: 'GET' },
        navigation
      );
      const stock = await response.json();
      return stock;
    } catch (err) {
      console.error('Error fetching stock:', err);
      setStocksError('Не удалось загрузить остаток');
      return null;
    }
  };

  // Локальное управление медикаментами (без изменений)
  const addMedication = (medication) => {
    setMedications([...medications, medication]);
  };

  const updateMedication = (id, updatedMedication) => {
    setMedications(medications.map((med) => (med.id === id ? updatedMedication : med)));
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter((med) => med.id !== id));
  };

  return (
    <MedicationContext.Provider
      value={{
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        stocks,
        addStock,
        updateStock,
        deleteStock,
        getStock,
        isLoadingStocks,
        stocksError,
        fetchStocks,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
};