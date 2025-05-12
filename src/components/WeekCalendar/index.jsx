import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isSameDate } from '../../utils/dateUtils';
import styles from '../../constants/globalStyles';

const { width } = Dimensions.get('window');

const WeekCalendar = ({ weeks, selectedDate, onSelectDay, onWeekChange }) => {
  const flatListRef = useRef(null);

  const handlePrevWeek = () => {
    const currentIndex = weeks.findIndex(week =>
      week.some(day => isSameDate(day.date, selectedDate))
    );
    const targetIndex = Math.max(0, currentIndex - 1);
    flatListRef.current.scrollToIndex({ index: targetIndex, animated: true });
    if (onWeekChange && targetIndex !== currentIndex) {
      const newSelectedDate = weeks[targetIndex][0].date;
      onWeekChange(newSelectedDate);
    }
  };

  const handleNextWeek = () => {
    const currentIndex = weeks.findIndex(week =>
      week.some(day => isSameDate(day.date, selectedDate))
    );
    const targetIndex = Math.min(weeks.length - 1, currentIndex + 1);
    flatListRef.current.scrollToIndex({ index: targetIndex, animated: true });
    if (onWeekChange && targetIndex !== currentIndex) {
      const newSelectedDate = weeks[targetIndex][0].date;
      onWeekChange(newSelectedDate);
    }
  };

  const renderWeek = ({ item: week }) => (
    <View style={styles.weekCalendar.weekDaysContainer}>
      {week.map((day, index) => (
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
            {day.label}
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
      ))}
    </View>
  );

  const getItemLayout = (data, index) => ({
    length: width - 32,
    offset: (width - 32) * index,
    index,
  });

  const onScrollToIndexFailed = (info) => {
    console.warn('Scroll to index failed:', info);
    flatListRef.current.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
  };

  return (
    <View style={styles.weekCalendar.container}>
      <View style={styles.weekCalendar.controls}>
        <TouchableOpacity onPress={handlePrevWeek}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.weekCalendar.weekLabel}>
          {selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={handleNextWeek}>
          <Ionicons name="chevron-forward" size={24} color="#000" />
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
        initialScrollIndex={3}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />
    </View>
  );
};

export default WeekCalendar;