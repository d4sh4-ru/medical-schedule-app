import axios from './axiosInstance'; // Импортируем настроенный экземпляр axios
import log from '../utils/coloredLog';

const PLAN_API_URL = '/plan'; // Относительный путь, так как baseURL задан в axiosConfig

export const createPlanRequest = async (plan, navigation) => {
  try {
    const response = await axios.post(PLAN_API_URL, plan, { navigation });
    return response.data;
  } catch (err) {
    log.error('[createPlanRequest] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const fetchPlansRequest = async (navigation) => {
  try {
    const response = await axios.get(PLAN_API_URL, { navigation });
    return response.data;
  } catch (err) {
    log.error('[fetchPlansRequest] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const fetchPlanRequest = async (id, navigation) => {
  try {
    const response = await axios.get(`${PLAN_API_URL}/${id}`, { navigation });
    return response.data;
  } catch (err) {
    log.error('[fetchPlanRequest] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const deletePlanRequest = async (id, navigation) => {
  try {
    const response = await axios.delete(`${PLAN_API_URL}/${id}`, { navigation });
    return response.data;
  } catch (err) {
    log.error('[deletePlanRequest] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const updatePlanRequest = async (id, updatedPlan, navigation) => {
  try {
    const response = await axios.put(PLAN_API_URL, { id, ...updatedPlan }, { navigation });
    return response.data;
  } catch (err) {
    log.error('[updatePlanRequest] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const fetchAnalyticsData = async (navigation) => {
  try {
    const response = await axios.get(`${PLAN_API_URL}/analytics`, { navigation });
    return response.data;
  } catch (err) {
    log.error('[fetchAnalyticsData] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};