import { fetchWithAuth } from './fetchWithAuth';
import config from '../config/config';

export const createPlanRequest = async (plan, navigation) => {
  const response = await fetchWithAuth(`${config.API_URL}/plan`, {
    method: 'POST',
    body: JSON.stringify(plan),
  }, navigation);
  return response.data;
};

export const fetchPlansRequest = async (navigation) => {
  const response = await fetchWithAuth(`${config.API_URL}/plan`, {
    method: 'GET',
  }, navigation);
  return response.data;
};

export const fetchPlanRequest = async (id, navigation) => {
  const response = await fetchWithAuth(`${config.API_URL}/plan/${id}`, {
    method: 'GET',
  }, navigation);
  return response.data;
};

export const deletePlanRequest = async (id, navigation) => {
  const response = await fetchWithAuth(`${config.API_URL}/plan/${id}`, {
    method: 'DELETE',
  }, navigation);
  return response.data;
};

export const updatePlanRequest = async (id, updatedPlan, navigation) => {
  const response = await fetchWithAuth(`${config.API_URL}/plan`, {
    method: 'PUT',
    body: JSON.stringify({ id, ...updatedPlan }),
  }, navigation);
  return response.data;
};