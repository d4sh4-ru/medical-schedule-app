import config from '../config/config';
import { fetchWithAuth } from './fetchWithAuth';

console.log('Importing fetchWithAuth:', typeof fetchWithAuth);

const NOTIFICATION_API_URL = `${config.API_URL}/plan/notifications`;

/**
 * Получает уведомления за текущий день.
 * @param {Object} navigation - Объект навигации для обработки переходов или ошибок.
 * @returns {Promise<Object>} Промис, возвращающий JSON-объект с уведомлениями за текущий день.
 * @throws {Error} Если запрос не удался или произошла ошибка аутентификации.
 */
export const fetchTodayNotifications = async (navigation) => {
    const response = await fetchWithAuth(`${NOTIFICATION_API_URL}/today`, { method: 'GET' }, navigation);
    return response.json();
};

/**
 * Получает уведомления за указанный день.
 * @param {number} day - День месяца (1-31).
 * @param {number} month - Месяц (1-12).
 * @param {number} year - Год (например, 2025).
 * @param {Object} navigation - Объект навигации для обработки переходов или ошибок.
 * @returns {Promise<Object>} Промис, возвращающий JSON-объект с уведомлениями за указанный день.
 * @throws {Error} Если запрос не удался или произошла ошибка аутентификации.
 */
export const fetchDayNotifications = async (day, month, year, navigation) => {
    const response = await fetchWithAuth(
        `${NOTIFICATION_API_URL}/day/${day}/${month}/${year}`,
        { method: 'GET' },
        navigation
    );
    return response.json();
};

/**
 * Получает список дней с уведомлениями за указанный месяц и год.
 * @param {number} month - Месяц (1-12).
 * @param {number} year - Год (например, 2025).
 * @param {Object} navigation - Объект навигации для обработки переходов или ошибок.
 * @returns {Promise<Object>} Промис, возвращающий JSON-объект с днями, содержащими уведомления.
 * @throws {Error} Если запрос не удался или произошла ошибка аутентификации.
 */
export const fetchMonthNotificationDays = async (month, year, navigation) => {
    const response = await fetchWithAuth(
        `${NOTIFICATION_API_URL}/month/${month}/${year}`,
        { method: 'GET' },
        navigation
    );
    return response.json();
};

/**
 * Подтверждает уведомление по его идентификатору.
 * @param {number} id - Идентификатор уведомления.
 * @param {Object} navigation - Объект навигации для обработки переходов или ошибок.
 * @returns {Promise<Object>} Промис, возвращающий JSON-объект с результатом подтверждения.
 * @throws {Error} Если запрос не удался или произошла ошибка аутентификации.
 */
export const confirmNotification = async (id, navigation) => {
    const response = await fetchWithAuth(
        `${NOTIFICATION_API_URL}/${id}/confirm`,
        { method: 'PATCH' },
        navigation
    );
    return response.json();
};