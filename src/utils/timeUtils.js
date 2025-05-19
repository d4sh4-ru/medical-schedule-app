/**
 * Вычисляет оставшееся время до или после указанной даты и возвращает форматированную строку
 * @param {Date|string} sentAt - Время уведомления
 * @returns {{ text: string, overdue: boolean }} - Текст времени и флаг просрочки
 */
export const getTimeRemaining = (sentAt) => {
  const now = new Date();
  const sentTime = new Date(sentAt);
  const diffMs = sentTime - now; // Разница в миллисекундах
  const overdue = diffMs < 0; // Просрочено, если время в прошлом
  const absDiffMs = Math.abs(diffMs);

  // Вычисляем дни и часы
  const totalHours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  // Функция для правильного склонения слов
  const pluralize = (number, one, few, many) => {
    if (number % 10 === 1 && number % 100 !== 11) return one;
    if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) return few;
    return many;
  };

  let text = '';
  if (overdue) {
    // Формат для просроченных: "Просрочено на X день и Y часов" или "Просрочено на Y часов"
    if (days > 0) {
      text = `Просрочено на ${days} ${pluralize(days, 'день', 'дня', 'дней')} и ${hours} ${pluralize(
        hours,
        'час',
        'часа',
        'часов'
      )}`;
    } else {
      text = `Просрочено на ${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`;
    }
  } else {
    // Формат для будущих: "Через X день и Y часов" или "Через Y часов"
    if (days > 0) {
      text = `Через ${days} ${pluralize(days, 'день', 'дня', 'дней')} и ${hours} ${pluralize(
        hours,
        'час',
        'часа',
        'часов'
      )}`;
    } else {
      text = `Через ${hours} ${pluralize(hours, 'час', 'часа', 'часов')}`;
    }
  }

  // Убираем "и 0 часов" или "0 часов" для чистоты
  if (hours === 0 && days > 0) {
    text = text.replace(` и 0 ${pluralize(0, 'час', 'часа', 'часов')}`, '');
  }
  if (hours === 0 && days === 0) {
    text = overdue ? 'Только что просрочено' : 'Сейчас';
  }

  return { text, overdue };
};

// TODO: Объединить с dateUtils  
export function getFormattedDate(targetTimeISO) {
    const targetTime = new Date(targetTimeISO);
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return targetTime.toLocaleDateString('ru-RU', options); // Например: "15 апреля 2025"
}

export function getFormattedTime(targetTimeISO) {
    const targetTime = new Date(targetTimeISO);

    const hours = targetTime.getHours().toString().padStart(2, '0');
    const minutes = targetTime.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`; // Например: "14:30"
}