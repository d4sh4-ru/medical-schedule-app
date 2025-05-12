import {
    fetchMedicationNames,
    fetchMedicationDetails,
    searchMedications,
    checkMedicationExists,
    fetchMedicationInstruction,
    createDietarySupplement,
  } from '../api/medicationApi';
  
  export const getMedicationNames = async (isDietarySupplement, navigation) => {
    try {
      return await fetchMedicationNames(isDietarySupplement, navigation);
    } catch (err) {
      console.error('Error fetching medication names:', err);
      throw new Error('Не удалось загрузить список медикаментов');
    }
  };
  
  export const getMedicationDetails = async (name, navigation) => {
    try {
      return await fetchMedicationDetails(name, navigation);
    } catch (err) {
      console.error('Error fetching medication details:', err);
      throw new Error('Не удалось загрузить информацию о медикаменте');
    }
  };
  
  export const findMedications = async (prefix, navigation) => {
    try {
      const data = await searchMedications(prefix, navigation);
      return data.names;
    } catch (err) {
      console.error('Error searching medications:', err);
      throw new Error('Не удалось выполнить поиск медикаментов');
    }
  };
  
  export const doesMedicationExist = async (name, navigation) => {
    try {
      return await checkMedicationExists(name, navigation);
    } catch (err) {
      console.error('Error checking medication existence:', err);
      throw new Error('Не удалось проверить существование медикамента');
    }
  };
  
  export const getMedicationInstruction = async (name, navigation) => {
    try {
      return await fetchMedicationInstruction(name, navigation);
    } catch (err) {
      console.error('Error fetching medication instruction:', err);
      throw new Error('Не удалось загрузить инструкцию');
    }
  };
  
  export const addDietarySupplement = async (supplement, navigation) => {
    try {
      return await createDietarySupplement(supplement, navigation);
    } catch (err) {
      console.error('Error creating dietary supplement:', err);
      throw new Error('Не удалось создать БАД');
    }
  };
  