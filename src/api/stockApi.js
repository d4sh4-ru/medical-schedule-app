import { fetchWithAuth } from './fetchWithAuth';
import config from '../config/config';

const STOCK_API_URL = `${config.API_URL}/plan/restock`;

export const fetchStocksRequest = async (navigation) => {
  const response = await fetchWithAuth(STOCK_API_URL, { method: 'GET' }, navigation);
  return response.data;
};

export const createStockRequest = async (stock, navigation) => {
  const response = await fetchWithAuth(STOCK_API_URL, {
    method: 'POST',
    body: JSON.stringify(stock),
  }, navigation);
  return response.data;
};

export const updateStockRequest = async (id, stock, navigation) => {
  const response = await fetchWithAuth(STOCK_API_URL, {
    method: 'PUT',
    body: JSON.stringify({ id, ...stock }),
  }, navigation);
  return response.data;
};

export const deleteStockRequest = async (id, navigation) => {
  const response = await fetchWithAuth(`${STOCK_API_URL}/${id}`, { method: 'DELETE' }, navigation);
  return response.data;
};

export const fetchSingleStockRequest = async (id, navigation) => {
  const response = await fetchWithAuth(`${STOCK_API_URL}/${id}`, { method: 'GET' }, navigation);
  return response.data;
};