import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isSameDate } from '../utils/dateUtils';
import styles from '../constants/globalStyles';
import log from '../utils/coloredLog';

const { width } = Dimensions.get('window');

// Маппинг для сокращённых дней недели
const shortWeekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const WeekCalendar = ({ weeks, selectedDate, onSelectDay, onWeekChange }) => {
  const flatListRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Вычисляем начальный индекс недели
  useEffect(() => {
    const initialIndex = weeks.findIndex(week =>
      week.some(day => isSameDate(day.date, selectedDate))
    );
    if (initialIndex !== -1 && initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
      flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      log.green('[WeekCalendar] Initial scroll to index:', initialIndex);
    }
  }, [weeks, selectedDate]);

  const handlePrevWeek = () => {
    if (isScrolling) {
      log.warn('[WeekCalendar] Scroll in progress, ignoring prev week');
      return;
    }
    setIsScrolling(true);
    const targetIndex = Math.max(0, currentIndex - 1);
    if (targetIndex !== currentIndex) {
      flatListRef.current.scrollToIndex({ index: targetIndex, animated: true });
      log.green('[WeekCalendar] Scrolling to prev week:', targetIndex);
    } else {
      setIsScrolling(false);
    }
  };

  const handleNextWeek = () => {
    if (isScrolling) {
      log.warn('[WeekCalendar] Scroll in progress, ignoring next week');
      return;
    }
    setIsScrolling(true);
    const targetIndex = Math.min(weeks.length - 1, currentIndex + 1);
    if (targetIndex !== currentIndex) {
      flatListRef.current.scrollToIndex({ index: targetIndex, animated: true });
      log.green('[WeekCalendar] Scrolling to next week:', targetIndex);
    } else {
      setIsScrolling(false);
    }
  };

  // Обработка завершения прокрутки
  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / (width - 32));
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      if (onWeekChange && weeks[newIndex]) {
        const newSelectedDate = weeks[newIndex][0].date;
        onWeekChange(newSelectedDate);
        log.green('[WeekCalendar] Scroll ended, week changed:', {
          newIndex,
          newSelectedDate: newSelectedDate.toISOString(),
        });
      }
    }
    setIsScrolling(false);
  };

  const renderWeek = ({ item: week }) => (
    <View style={styles.weekCalendar.weekDaysContainer}>
      {week.map((day, index) => {
        const dayIndex = day.date.getDay();
        const shortLabel = shortWeekdays[dayIndex === 0 ? 6 : dayIndex - 1];

        return (
          <TouchableOpacity
            key={index}
            style={styles.weekCalendar.dayContainer}
            onPress={() => onSelectDay(day.date)}
          >
            <Text
              style={[
                styles.weekCalendar.dayLabel,
                isSameDate(day.date, selectedDate) && styles.weekCalendar.selectedDayLabel,
              ]}
            >
              {shortLabel}
            </Text>
            <View
              style={[
                styles.weekCalendar.dayNumberContainer,
                isSameDate(day.date, selectedDate) && styles.weekCalendar.selectedDayContainer,
              ]}
            >
              <Text
                style={[
                  styles.weekCalendar.dayNumber,
                  isSameDate(day.date, selectedDate) && styles.weekCalendar.selectedDay,
                ]}
              >
                {day.date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const getItemLayout = (data, index) => ({
    length: width - 32,
    offset: (width - 32) * index,
    index,
  });

  const onScrollToIndexFailed = (info) => {
    log.warn('[WeekCalendar] Scroll to index failed:', info);
    flatListRef.current.scrollToOffset({
      offset: info.averageItemLength * info.index,
      animated: true,
    });
    setIsScrolling(false);
  };

  return (
    <View style={styles.weekCalendar.container}>
      <View style={styles.weekCalendar.controls}>
        <TouchableOpacity onPress={handlePrevWeek} disabled={isScrolling}>
          <Ionicons name="chevron-back" size={24} color={isScrolling ? '#ccc' : '#000'} />
        </TouchableOpacity>
        <Text style={styles.weekCalendar.weekLabel}>
          {selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={handleNextWeek} disabled={isScrolling}>
          <Ionicons name="chevron-forward" size={24} color={isScrolling ? '#ccc' : '#000'} />
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={weeks}
        renderItem={renderWeek}
        keyExtractor={(item, index) => `week-${index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onMomentumScrollEnd={handleScrollEnd}
      />
    </View>
  );
};

export default WeekCalendar;