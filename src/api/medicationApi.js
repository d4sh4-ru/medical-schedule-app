import axios from './axiosInstance'; // Импортируем настроенный экземпляр axios
import log from '../utils/coloredLog';

const MEDICATION_API_URL = '/medications'; // Относительный путь, так как baseURL задан в axiosConfig

export const fetchMedicationNames = async (isDietarySupplement = null, navigation) => {
  try {
    const params = isDietarySupplement !== null ? { isDietarySupplement } : {};
    const response = await axios.get(`${MEDICATION_API_URL}/names`, { params, navigation });
    return response.data;
  } catch (err) {
    log.error('[fetchMedicationNames] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const fetchMedicationDetails = async (name, navigation) => {
  try {
    const response = await axios.get(`${MEDICATION_API_URL}/${encodeURIComponent(name)}`, { navigation });
    return response.data;
  } catch (err) {
    log.error('[fetchMedicationDetails] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const searchMedications = async (prefix, navigation) => {
  try {
    const response = await axios.get(`${MEDICATION_API_URL}/search`, { params: { prefix }, navigation });
    return response.data;
  } catch (err) {
    log.error('[searchMedications] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const checkMedicationExists = async (name, navigation) => {
  try {
    const response = await axios.get(`${MEDICATION_API_URL}/exists/${encodeURIComponent(name)}`, { navigation });
    return response.data;
  } catch (err) {
    log.error('[checkMedicationExists] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const fetchMedicationInstruction = async (name, navigation) => {
  try {
    const response = await axios.get(`${MEDICATION_API_URL}/${encodeURIComponent(name)}/instruction`, { navigation });
    return response.data;
  } catch (err) {
    log.error('[fetchMedicationInstruction] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};

export const createDietarySupplement = async (supplement, navigation) => {
  try {
    const response = await axios.post(`${MEDICATION_API_URL}/dietary-supplements`, supplement, { navigation });
    return response.data;
  } catch (err) {
    log.error('[createDietarySupplement] Error:', err.message, {
      code: err.code,
      httpStatus: err.httpStatus,
      response: err.response?.data,
    });
    throw err;
  }
};