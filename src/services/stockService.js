import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchStocksRequest,
  createStockRequest,
  updateStockRequest,
  deleteStockRequest,
  fetchSingleStockRequest
} from '../api/stockApi';
import log from '../utils/coloredLog';

export const getStocks = async (navigation) => {
  try {
    const data = await fetchStocksRequest(navigation);
    await AsyncStorage.setItem('stocks', JSON.stringify(data));
    return data;
  } catch (err) {
    console.warn('Ошибка загрузки остатков:', err);
    const cached = await AsyncStorage.getItem('stocks');
    if (cached) return JSON.parse(cached);
    throw new Error('Не удалось загрузить остатки');
  }
};

export const createStock = async (stock, navigation) => {
  try {
    log.info('[createStock] Sending stock data:', stock);
    const response = await createStockRequest(stock, navigation);
    if (response.error) {
      log.error('[createStock] API error:', response.error);
      throw new Error(response.error.message || 'Не удалось добавить остаток');
    }
    log.info('[createStock] Success:', response.data);
    return response;
  } catch (err) {
    log.error('[createStock] Unexpected error:', err.message, { stack: err.stack });
    throw err; // Перебрасываем ошибку для обработки в компоненте
  }
};

export const modifyStock = async (id, updatedStock, currentStocks, navigation) => {
  try {
    const newStock = await updateStockRequest(id, updatedStock, navigation);
    const updated = currentStocks.map((stock) => stock.id === id ? newStock : stock);
    await AsyncStorage.setItem('stocks', JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Ошибка обновления остатка:', err);
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
    console.warn('Ошибка удаления остатка:', err);
    throw new Error('Не удалось удалить остаток');
  }
};

export const getStockById = async (id, navigation) => {
  try {
    return await fetchSingleStockRequest(id, navigation);
  } catch (err) {
    console.warn('Ошибка получения остатка:', err);
    throw new Error('Не удалось загрузить остаток');
  }
};
