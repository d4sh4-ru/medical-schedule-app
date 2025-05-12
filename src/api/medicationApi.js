import { fetchWithAuth } from './fetchWithAuth';
import config from '../config/config';

const MEDICATION_API_URL=`${config.API_URL}/medications`

export const fetchMedicationNames = async (isDietarySupplement = null, navigation) => {
  const url = new URL(`${MEDICATION_API_URL}/names`);
  if (isDietarySupplement !== null) {
    url.searchParams.append('isDietarySupplement', isDietarySupplement);
  }
  console.log("fetch medications with url: ", url)
  const response = await fetchWithAuth(url, { method: 'GET' }, navigation);
  return await response.json();
};

export const fetchMedicationDetails = async (name, navigation) => {
  const response = await fetchWithAuth(
    `${MEDICATION_API_URL}/${encodeURIComponent(name)}`,
    { method: 'GET' },
    navigation
  );
  return await response.json();
};

export const searchMedications = async (prefix, navigation) => {
  const response = await fetchWithAuth(
    `${MEDICATION_API_URL}/search?prefix=${encodeURIComponent(prefix)}`,
    { method: 'GET' },
    navigation
  );
  return await response.json();
};

export const checkMedicationExists = async (name, navigation) => {
  const response = await fetchWithAuth(
    `${MEDICATION_API_URL}/exists/${encodeURIComponent(name)}`,
    { method: 'GET' },
    navigation
  );
  return await response.json();
};

export const fetchMedicationInstruction = async (name, navigation) => {
  const response = await fetchWithAuth(
    `${MEDICATION_API_URL}/${encodeURIComponent(name)}/instruction`,
    { method: 'GET' },
    navigation
  );
  return await response.json();
};

export const createDietarySupplement = async (supplement, navigation) => {
  const response = await fetchWithAuth(
    `${MEDICATION_API_URL}/dietary-supplements`,
    {
      method: 'POST',
      body: JSON.stringify(supplement),
    },
    navigation
  );
  return await response.json();
};
