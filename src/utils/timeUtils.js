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
  