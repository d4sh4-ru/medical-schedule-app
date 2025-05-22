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
 * Генерирует массив объектов, представляющих месяцы от текущего до текущего + 6 месяцев.
 * Каждый день помечается как активный (в пределах от сегодня до сегодня + 6 месяцев) или неактивный.
 * @returns {Array} Массив объектов, представляющих месяцы.
 */
export function generateMonths() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Сбрасываем время для точных сравнений
  const endDate = new Date(today);
  endDate.setMonth(today.getMonth() + 6); // Сегодня + 6 месяцев
  endDate.setHours(0, 0, 0, 0);

  const months = [];
  const startYear = today.getFullYear();
  const startMonth = today.getMonth();
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();

  // Определяем количество месяцев для генерации
  let monthCount = 0;
  for (let year = startYear; year <= endYear; year++) {
    const start = year === startYear ? startMonth : 0;
    const end = year === endYear ? endMonth + 1 : 12;
    monthCount += end - start;
  }

  for (let i = 0; i < monthCount; i++) {
    const month = (startMonth + i) % 12;
    const year = startYear + Math.floor((startMonth + i) / 12);
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDay.getDay(); // 0 (вс) - 6 (сб)
    const days = [];

    // Пустые дни до начала месяца (понедельник - первый день недели)
    const offset = startingDay === 0 ? 6 : startingDay - 1;
    for (let j = 0; j < offset; j++) {
      days.push(null);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isActive =
        currentDate >= today && currentDate <= endDate;
      days.push({ date: currentDate, isActive });
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

  // Форматирование времени
 export const formatTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) {
      return 'Неверное время';
    }
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  // Форматирование даты
 export const formatDate = (date) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Неверная дата';
    }
    return parsedDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };