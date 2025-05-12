import { fetchWithAuth } from './fetchWithAuth';
import config from '../config/config' ;

const STOCK_API_URL=`${config.API_URL}/plan/restock`

export const fetchStocksRequest = (navigation) =>
  fetchWithAuth(`${STOCK_API_URL}`, { method: 'GET' }, navigation)
    .then(res => res.json());

export const createStockRequest = (stock, navigation) =>
  fetchWithAuth(`${STOCK_API_URL}`, {
    method: 'POST',
    body: JSON.stringify(stock),
  }, navigation).then(res => res.json());

export const updateStockRequest = (id, stock, navigation) =>
  fetchWithAuth(`${STOCK_API_URL}`, {
    method: 'PUT',
    body: JSON.stringify({ id, ...stock }),
  }, navigation).then(res => res.json());

export const deleteStockRequest = (id, navigation) =>
  fetchWithAuth(`${STOCK_API_URL}/${id}`, { method: 'DELETE' }, navigation);

export const fetchSingleStockRequest = (id, navigation) =>
  fetchWithAuth(`${STOCK_API_URL}/${id}`, { method: 'GET' }, navigation)
    .then(res => res.json());
