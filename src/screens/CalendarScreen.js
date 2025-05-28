import React, { useMemo } from 'react';
import { SafeAreaView, StatusBar, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import styles from '../constants/globalStyles';
import { generateMonths } from '../utils/dateUtils';

const CalendarScreen = ({ navigation }) => {
  const today = useMemo(() => new Date(), []);
  const months = useMemo(() => generateMonths(2025), []);

  // Рендеринг одного месяца
  const renderMonth = ({ item: month }) => {
    // Разделить дни на недели (5 или 6 недель по 7 дней)
    const weeks = [];
    for (let i = 0; i < month.days.length; i += 7) {
      weeks.push(month.days.slice(i, i + 7));
    }

    return (
      <View style={styles.calendarScreen.monthContainer}>
        <Text style={styles.calendarScreen.monthLabel}>{month.month}</Text>
        <View style={styles.calendarScreen.weekdaysContainer}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
            <Text key={index} style={styles.calendarScreen.weekdayLabel}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendarScreen.daysContainer}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.calendarScreen.weekContainer}>
              {week.map((day, dayIndex) => {
                const isToday = day && day.toDateString() === today.toDateString();
                return day ? (
                  <TouchableOpacity
                    key={`${weekIndex}-${dayIndex}`}
                    style={styles.calendarScreen.dayContainer}
                    onPress={() => console.log('Selected day:', day)}
                  >
                    <Text
                      style={[
                        styles.calendarScreen.dayNumber,
                        isToday && styles.calendarScreen.todayDayNumber,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    key={`${weekIndex}-${dayIndex}`}
                    style={styles.calendarScreen.emptyDay}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.calendarScreen.container}>
      <StatusBar barStyle="light-content" />
      <Header
        title="Календарь" // Заголовок
        onLeftPress={() => navigation.navigate('Home')}
        leftIconName="close"      
        />
      <FlatList
        data={months}
        renderItem={renderMonth}
        keyExtractor={(item) => item.month}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={4} // Май 2025
        getItemLayout={(data, index) => ({
          length: 350, // Увеличена высота для точности
          offset: 350 * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          console.warn('Scroll to index failed:', info);
        }}
      />
    </SafeAreaView>
  );
};

export default CalendarScreen;