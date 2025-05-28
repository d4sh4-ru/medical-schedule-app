export const formatTime = (time) => {
  return time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateRange = (dateRange) => {
  if (!dateRange.startDate) return 'Выберите период';
  if (!dateRange.endDate) return dateRange.startDate.toLocaleDateString('ru-RU');
  return `${dateRange.startDate.toLocaleDateString('ru-RU')} - ${dateRange.endDate.toLocaleDateString('ru-RU')}`;
};

export const formatDateForApi = (date) => {
  if (!date) return null;
  return `${date.toISOString().split('T')[0]}T00:00:00Z`;
};

export const formatTimesForApi = (timesArray) => {
  return timesArray
    .map((time) => time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
    .join(',');
};