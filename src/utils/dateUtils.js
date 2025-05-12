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
  
  const getMonday = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - ((day + 6) % 7);
    return new Date(date.setDate(diff));
  };
  
  const getWeekDayLetter = (date) => {
    const weekdays = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
    const jsDay = date.getDay();
    const mappedIndex = (jsDay + 6) % 7;
    return weekdays[mappedIndex];
  };
  
  export const isSameDate = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
  
  export const getTodayFormatted = (date = new Date()) => {
    const months = [
      'января', 'февраля', 'марта', 'апреля',
      'мая', 'июня', 'июля', 'августа',
      'сентября', 'октября', 'ноября', 'декабря'
    ];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };