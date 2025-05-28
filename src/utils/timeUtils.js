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

  // Вычисляем дни, часы и минуты
  const totalMinutes = Math.floor(absDiffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (24 * 60));
  const remainingMinutesAfterDays = totalMinutes % (24 * 60);
  const hours = Math.floor(remainingMinutesAfterDays / 60);
  const minutes = remainingMinutesAfterDays % 60;

  let textParts = [];

  if (days > 0) {
    textParts.push(`${days} д.`);
  }
  if (hours > 0) {
    textParts.push(`${hours} ч.`);
  }
  if (minutes > 0) {
    textParts.push(`${minutes} мин.`);
  }

  let text = '';
  if (overdue) {
    text = textParts.length > 0 ? `Просрочено на ${textParts.join(' ')}` : 'Только что просрочено';
  } else {
    text = textParts.length > 0 ? `Через ${textParts.join(' ')}` : 'Сейчас';
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