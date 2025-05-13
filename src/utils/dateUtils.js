/**
 * Возвращает массив объектов, представляющих дни недели для календаря.
 * @param {Date} [currentDate=new Date()] - Текущая дата.
 * @returns {Array} Массив объектов, представляющих дни недели.
 */
export const getWeekDaysForCalendar = (currentDate = new Date()) => {
    const days = [];
    const startOfWeek = getMonday(currentDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      days.push({
        label: getWeekDayLetter(date),
        date,
      });
    }

    return days;
};

/**
 * Возвращает дату понедельника текущей недели.
 * @param {Date} date - Текущая дата.
 * @returns {Date} Дата понедельника текущей недели.
 */
const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - ((day + 6) % 7);
    return new Date(date.setDate(diff));
};

/**
 * Возвращает букву дня недели.
 * @param {Date} date - Текущая дата.
 * @returns {String} Буква дня недели.
 */
const getWeekDayLetter = (date) => {
    const weekdays = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
    const jsDay = date.getDay();
    const mappedIndex = (jsDay + 6) % 7;
    return weekdays[mappedIndex];
};

/**
 * Проверяет, являются ли две даты одинаковыми.
 * @param {Date} a - Первая дата.
 * @param {Date} b - Вторая дата.
 * @returns {Boolean} true, если даты одинаковые, иначе false.
 */
export const isSameDate = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

/**
 * Возвращает отформатированную строку текущей даты.
 * @param {Date} [date=new Date()] - Текущая дата.
 * @returns {String} Отформатированная строка текущей даты.
 */
export const getTodayFormatted = (date = new Date()) => {
    const months = [
      'января', 'февраля', 'марта', 'апреля',
      'мая', 'июня', 'июля', 'августа',
      'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
};

/**
 * Генерирует массив объектов, представляющих месяцы указанного года.
 * @param {number} year - Год, для которого генерируются месяцы.
 * @returns {Array} Массив объектов, представляющих месяцы.
 */
export function generateMonths(year) {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const startingDay = firstDay.getDay(); // 0 (вс) - 6 (сб)
      const days = [];
  
      // Пустые дни до начала месяца (понедельник - первый день недели)
      const offset = startingDay === 0 ? 6 : startingDay - 1;
      for (let i = 0; i < offset; i++) {
        days.push(null);
      }
  
      // Дни месяца
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
  
      // Заполнить до конца последней недели
      const totalDays = offset + daysInMonth;
      const rowsNeeded = Math.ceil(totalDays / 7); // 5 или 6 строк
      const targetLength = rowsNeeded * 7; // 35 или 42 ячейки
      while (days.length < targetLength) {
        days.push(null);
      }
  
      months.push({
        month: firstDay.toLocaleString('ru-RU', { month: 'long', year: 'numeric' }),
        days,
      });
    }
    return months;
  }