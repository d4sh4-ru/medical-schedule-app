import axios from './axiosInstance'; // Импортируем настроенный экземпляр axios
import log from '../utils/coloredLog';

export const fetchStocksRequest = async (navigation) => {
  try {
    const response = await axios.get('/plan/restock'); 
    return { data: response.data, error: null };
  } catch (err) {
    log.error('[fetchStocksRequest] Error:', err.message, { code: err.code });
    return { data: null, error: { code: err.code, message: err.message, action: err.action } };
  }
};

export const createStockRequest = async (stock, navigation) => {
  try {
    const response = await axios.post('/plan/restock', stock, { navigation });
    return { data: response.data, error: null };
  } catch (err) {
    log.error('[createStockRequest] Error:', err.message, { code: err.code });
    return { data: null, error: { code: err.code, message: err.message, action: err.action } };
  }
};

export const updateStockRequest = async (id, stock, navigation) => {
  try {
    const response = await axios.put('/plan/restock', { id, ...stock }, { navigation });
    return { data: response.data, error: null };
  } catch (err) {
    log.error('[updateStockRequest] Error:', err.message, { code: err.code });
    return { data: null, error: { code: err.code, message: err.message, action: err.action } };
  }
};

export const deleteStockRequest = async (id, navigation) => {
  try {
    const response = await axios.delete(`/plan/restock/${id}`, { navigation });
    return { data: response.data, error: null };
  } catch (err) {
    log.error('[deleteStockRequest] Error:', err.message, { code: err.code });
    return { data: null, error: { code: err.code, message: err.message, action: err.action } };
  }
};

export const fetchSingleStockRequest = async (id, navigation) => {
  try {
    const response = await axios.get(`/plan/restock/${id}`, { navigation });
    return { data: response.data, error: null };
  } catch (err) {
    log.error('[fetchSingleStockRequest] Error:', err.message, { code: err.code });
    return { data: null, error: { code: err.code, message: err.message, action: err.action } };
  }
};