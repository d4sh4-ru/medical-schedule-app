import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchStocksRequest,
  createStockRequest,
  updateStockRequest,
  deleteStockRequest,
  fetchSingleStockRequest
} from '../api/stockApi';

export const getStocks = async (navigation) => {
  try {
    const data = await fetchStocksRequest(navigation);
    await AsyncStorage.setItem('stocks', JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Ошибка загрузки остатков:', err);
    const cached = await AsyncStorage.getItem('stocks');
    if (cached) return JSON.parse(cached);
    throw new Error('Не удалось загрузить остатки');
  }
};

export const createStock = async (stock, currentStocks, navigation) => {
  try {
    const newStock = await createStockRequest(stock, navigation);
    const updated = [...currentStocks, newStock];
    await AsyncStorage.setItem('stocks', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Ошибка добавления остатка:', err);
    throw new Error('Не удалось добавить остаток');
  }
};

export const modifyStock = async (id, updatedStock, currentStocks, navigation) => {
  try {
    const newStock = await updateStockRequest(id, updatedStock, navigation);
    const updated = currentStocks.map((stock) => stock.id === id ? newStock : stock);
    await AsyncStorage.setItem('stocks', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Ошибка обновления остатка:', err);
    throw new Error('Не удалось обновить остаток');
  }
};

export const removeStock = async (id, currentStocks, navigation) => {
  try {
    await deleteStockRequest(id, navigation);
    const updated = currentStocks.filter((stock) => stock.id !== id);
    await AsyncStorage.setItem('stocks', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Ошибка удаления остатка:', err);
    throw new Error('Не удалось удалить остаток');
  }
};

export const getStockById = async (id, navigation) => {
  try {
    return await fetchSingleStockRequest(id, navigation);
  } catch (err) {
    console.error('Ошибка получения остатка:', err);
    throw new Error('Не удалось загрузить остаток');
  }
};
