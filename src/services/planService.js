import {
    createPlanRequest,
    createCustomPlanRequest,
    fetchPlansRequest,
    fetchPlanRequest,
    deletePlanRequest,
    updatePlanRequest
  } from '../api/planApi';
  
  export const createPlan = async (plan, navigation) => {
    try {
      return await createPlanRequest(plan, navigation);
    } catch (err) {
      console.error('Error creating plan:', err);
      throw new Error('Не удалось создать план');
    }
  };
  
  export const createCustomPlan = async (customPlan, navigation) => {
    try {
      return await createCustomPlanRequest(customPlan, navigation);
    } catch (err) {
      console.error('Error creating custom plan:', err);
      throw new Error('Не удалось создать кастомный план');
    }
  };
  
  export const getPlans = async (navigation) => {
    try {
      return await fetchPlansRequest(navigation);
    } catch (err) {
      console.error('Error fetching plans:', err);
      throw new Error('Не удалось загрузить планы');
    }
  };
  
  export const getPlan = async (id, navigation) => {
    try {
      return await fetchPlanRequest(id, navigation);
    } catch (err) {
      console.error('Error fetching plan:', err);
      throw new Error('Не удалось загрузить план');
    }
  };
  
  export const removePlan = async (id, navigation) => {
    try {
      await deletePlanRequest(id, navigation);
    } catch (err) {
      console.error('Error deleting plan:', err);
      throw new Error('Не удалось удалить план');
    }
  };
  
  export const updatePlan = async (id, updatedPlan, navigation) => {
    try {
      return await updatePlanRequest(id, updatedPlan, navigation);
    } catch (err) {
      console.error('Error updating plan:', err);
      throw new Error('Не удалось обновить план');
    }
  };
  