import { fetchWithAuth } from './fetchWithAuth';
import { API_URL } from '../config';

export const createPlanRequest = (plan, navigation) =>
  fetchWithAuth(`${API_URL}/plan`, {
    method: 'POST',
    body: JSON.stringify(plan),
  }, navigation).then(res => res.json());

export const createCustomPlanRequest = (customPlan, navigation) =>
  fetchWithAuth(`${API_URL}/plan/custom`, {
    method: 'POST',
    body: JSON.stringify(customPlan),
  }, navigation).then(res => res.json());

export const fetchPlansRequest = (navigation) =>
  fetchWithAuth(`${API_URL}/plan`, {
    method: 'GET',
  }, navigation).then(res => res.json());

export const fetchPlanRequest = (id, navigation) =>
  fetchWithAuth(`${API_URL}/plan/${id}`, {
    method: 'GET',
  }, navigation).then(res => res.json());

export const deletePlanRequest = (id, navigation) =>
  fetchWithAuth(`${API_URL}/plan/${id}`, {
    method: 'DELETE',
  }, navigation);

export const updatePlanRequest = (id, updatedPlan, navigation) =>
  fetchWithAuth(`${API_URL}/plan`, {
    method: 'PUT',
    body: JSON.stringify({ id, ...updatedPlan }),
  }, navigation).then(res => res.json());
