/**
 * Вычисляет время до времени targetTimeISO
 * @param {*} targetTimeISO Время относительно, которого отсчитывается
 * @returns 
 */
export function getTimeRemaining(targetTimeISO) {
    const now = new Date();
    const targetTime = new Date(targetTimeISO);
    const diffInMs = targetTime - now;
    const overdue = diffInMs < 0;
  
    const absDiffInMs = Math.abs(diffInMs);
    const minutes = Math.floor((absDiffInMs / 1000 / 60) % 60);
    const hours = Math.floor((absDiffInMs / 1000 / 60 / 60));
  
    const text = overdue
      ? `Просрочено на ${hours > 0 ? `${hours}ч ` : ''}${minutes}м`
      : `Через ${hours > 0 ? `${hours}ч ` : ''}${minutes}м`;
  
    return { text, overdue };
  }
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