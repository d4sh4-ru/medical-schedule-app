/**
 * Маппит код ошибки бэкенда на пользовательское сообщение и действие.
 * @param {string} code - Код ошибки (например, "INVALID_CREDENTIALS").
 * @param {string} defaultMessage - Сообщение от сервера.
 * @returns {Object} - Объект с code, message, httpStatus, и action.
 */
export const mapError = (code, defaultMessage) => {
  const errorMap = {
    // Ошибки пользовательских аккаунтов
    INVALID_CREDENTIALS: {
      message: 'Неверный email или пароль.',
      httpStatus: 401,
    },
    UNAUTHORIZED: {
      message: 'Токен недействителен или отсутствует.',
      httpStatus: 401,
    },
    USER_NOT_FOUND: {
      message: 'Пользователь с таким email не найден.',
      httpStatus: 404,
    },
    USER_ALREADY_EXISTS: {
      message: 'Пользователь с таким email уже существует.',
      httpStatus: 409,
    },
    INVALID_ROLE: {
      message: 'Указана недопустимая роль.',
      httpStatus: 401,
    },
    ROLE_NOT_FOUND: {
      message: 'Указанная роль не найдена.',
      httpStatus: 404,
    },
    RELATION_NOT_FOUND: {
      message: 'Связь между пользователями не найдена.',
      httpStatus: 404,
    },
    RELATION_ALREADY_DELETED: {
      message: 'Связь уже удалена.',
      httpStatus: 409,
    },
    RELATION_ALREADY_EXISTS: {
      message: 'Связь между пользователями уже существует.',
      httpStatus: 409,
    },

    // Ошибки лекарственных препаратов
    INVALID_MEDICATION_ID: {
      message: 'Недействительный ID препарата.',
      httpStatus: 400,
    },
    INVALID_MEDICATION_TRADE_NAME: {
      message: 'Недействительное торговое название препарата.',
      httpStatus: 400,
    },
    MEDICATION_NOT_FOUND: {
      message: 'Препарат не найден.',
      httpStatus: 404,
    },
    MEDICATION_INSTALLATION_NOT_FOUND: {
      message: 'Инструкция к препарату не найдена.',
      httpStatus: 404,
    },
    MEDICATION_ALREADY_EXISTS: {
      message: 'Препарат с таким названием уже существует.',
      httpStatus: 409,
    },

    // Ошибки плана приёма лекарств
    INVALID_PLAN_ID: {
      message: 'Недействительный ID плана.',
      httpStatus: 400,
    },
    PLAN_NOT_FOUND: {
      message: 'План приёма лекарств не найден.',
      httpStatus: 404,
    },
    FORBIDDEN_FIELD_UPDATE: {
      message: 'Можно обновить только ID препарата и дату окончания.',
      httpStatus: 400,
    },
    END_DATE_NOT_LATER: {
      message: 'Новая дата окончания должна быть позже текущей.',
      httpStatus: 400,
    },
    PLAN_DATE_COLLISION: {
      message: 'У вас уже есть приём данного препарата на выбранные даты.',
      httpStatus: 400,
    },
    MISSING_UNIFORM_FIELDS: {
      message: 'Отсутствуют обязательные поля.',
      httpStatus: 400,
    },
    PAST_DATE: {
      message: 'План или напоминания не могут быть в прошлом.',
      httpStatus: 400,
    },

    // Ошибки остатков медикаментов
    INVALID_RESTOCK_ID: {
      message: 'Недействительный ID остатка.',
      httpStatus: 400,
    },
    RESTOCK_NOT_FOUND: {
      message: 'У вас нет запасов данного препарата.',
      httpStatus: 404,
      action: {
        message: 'Хотите создать остаток?',
        navigateTo: 'StockForm',
      },
    },
    INVALID_RESTOCK_QUANTITY: {
      message: 'У вас не осталось запасов препарата.',
      httpStatus: 400,
      action: {
        message: 'Хотите купить?',
        navigateTo: 'StockForm',
      },
    },
    DUPLICATE_RESTOCK: {
      message: 'Остаток для этого препарата уже существует.',
      httpStatus: 400,
    },
    INSUFFICIENT_RESTOCK: {
      message: 'Недостаточное количество препарата.',
      httpStatus: 400,
    },

    // Ошибки уведомлений
    INVALID_NOTIFICATION_ID: {
      message: 'Недействительный ID уведомления.',
      httpStatus: 400,
    },
    NOTIFICATION_NOT_FOUND: {
      message: 'Уведомление не найдено.',
      httpStatus: 404,
    },
    DUPLICATE_NOTIFICATION: {
      message: 'Уведомление уже существует.',
      httpStatus: 409,
    },
    INVALID_NOTIFICATION_STATUS: {
      message: 'Недействительный статус уведомления.',
      httpStatus: 400,
    },

    // Общие ошибки
    NOT_FOUND: {
      message: 'Ресурс не найден.',
      httpStatus: 404,
    },
    INVALID_INPUT: {
      message: 'Недействительные входные данные.',
      httpStatus: 400,
    },
    INVALID_REQUEST: {
      message: 'Недействительный запрос.',
      httpStatus: 400,
    },
    INVALID_DATE: {
      message: 'Недействительная дата.',
      httpStatus: 400,
    },
    DATABASE_ERROR: {
      message: 'Ошибка базы данных. Попробуйте позже.',
      httpStatus: 500,
    },
    INTERNAL_ERROR: {
      message: 'Внутренняя ошибка сервера. Попробуйте позже.',
      httpStatus: 500,
    },
  };

  return errorMap[code] || {
    code,
    message: defaultMessage || 'Произошла неизвестная ошибка.',
    httpStatus: 500,
    action: null,
  };
};