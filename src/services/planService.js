import {
  createPlanRequest,
  createCustomPlanRequest,
  fetchPlansRequest,
  fetchPlanRequest,
  deletePlanRequest,
  updatePlanRequest,
} from "../api/planApi";
import { formatDateForApi, formatTimesForApi } from '../utils/scheduleUtils';

export const createPlan = async (plan, navigation) => {
  try {
    return await createPlanRequest(plan, navigation);
  } catch (err) {
    console.error("Error creating plan:", err);
    throw new Error("Не удалось создать план");
  }
};

export const createCustomPlan = async (customPlan, navigation) => {
  try {
    return await createCustomPlanRequest(customPlan, navigation);
  } catch (err) {
    console.error("Error creating custom plan:", err);
    throw new Error("Не удалось создать кастомный план");
  }
};

export const getPlans = async (navigation) => {
  try {
    return await fetchPlansRequest(navigation);
  } catch (err) {
    console.error("Error fetching plans:", err);
    throw new Error("Не удалось загрузить планы");
  }
};

export const getPlan = async (id, navigation) => {
  try {
    return await fetchPlanRequest(id, navigation);
  } catch (err) {
    console.error("Error fetching plan:", err);
    throw new Error("Не удалось загрузить план");
  }
};

export const removePlan = async (id, navigation) => {
  try {
    await deletePlanRequest(id, navigation);
  } catch (err) {
    console.error("Error deleting plan:", err);
    throw new Error("Не удалось удалить план");
  }
};

export const updatePlan = async (id, updatedPlan, navigation) => {
  try {
    return await updatePlanRequest(id, updatedPlan, navigation);
  } catch (err) {
    console.error("Error updating plan:", err);
    throw new Error("Не удалось обновить план");
  }
};

export const newUniformPlan = async (
  planData,
  isEditing,
  scheduleId,
  navigation
) => {
  try {
    const {
      medicationTradeName,
      startDate,
      endDate,
      singleDosage,
      singleDosageTablets,
      administrationTimes,
    } = planData;

    // Валидация входных данных
    if (!medicationTradeName || !medicationTradeName.trim()) {
      throw new Error("Название препарата обязательно");
    }
    if (!startDate || !(startDate instanceof Date)) {
      throw new Error("Дата начала некорректна");
    }
    if (!endDate || !(endDate instanceof Date)) {
      throw new Error("Дата окончания некорректна");
    }
    if (!singleDosage || isNaN(parseInt(singleDosage))) {
      throw new Error("Дозировка некорректна");
    }
    if (!singleDosageTablets || isNaN(parseInt(singleDosageTablets))) {
      throw new Error("Количество таблеток некорректно");
    }
    if (
      !administrationTimes ||
      !Array.isArray(administrationTimes) ||
      administrationTimes.length === 0
    ) {
      throw new Error("Время приёма обязательно");
    }

    // Форматирование данных для API
    const formattedPlan = {
      medicationTradeName: medicationTradeName.trim(),
      type: "uniform",
      singleDosage: `${parseInt(singleDosage)} мг`,
      singleDosageTablets: parseInt(singleDosageTablets),
      interval: 1,
      administrationTimes: formatTimesForApi(administrationTimes),
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    };

    let result;
    if (isEditing) {
      // Редактирование существующего плана
      console.log("Updating plan:", { id: scheduleId, plan: formattedPlan });
      result = await updatePlanRequest(scheduleId, formattedPlan, navigation);
    } else {
      // Создание нового плана
      console.log("Creating new plan:", formattedPlan);
      result = await createPlanRequest(formattedPlan, navigation);
    }

    return {
      success: true,
      message: isEditing ? "План успешно обновлён" : "План успешно создан",
    };
  } catch (err) {
    console.error("Error in newUniformPlan:", err);
    throw new Error(err.message || "Не удалось сохранить план");
  }
};
