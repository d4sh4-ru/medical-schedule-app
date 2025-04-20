// screens/schedule/ScheduleScreen.js
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { MedicationContext } from '../../utils/MedicationContext';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';
import Svg, { Path } from 'react-native-svg';
import { FAB } from 'react-native-elements';
import NavBar from '../../components/NavBar';

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const { medications, deleteMedication } = useContext(MedicationContext);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Форматирование времени
  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Фильтрация приёмов по дате
  const filteredMedications = medications.filter((med) =>
    med.times.some((time) => new Date(time).toISOString().split('T')[0] === selectedDate)
  );

  // Отметки на календаре
  const markedDates = medications.reduce((acc, med) => {
    med.times.forEach((time) => {
      const date = new Date(time).toISOString().split('T')[0];
      acc[date] = { marked: true, dotColor: theme.colors.primary };
    });
    return acc;
  }, {});

  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: theme.colors.accent,
  };

  // Удаление приёма
  const handleDelete = (id) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этот приём?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => deleteMedication(id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: 100 }]}>
      <Text style={styles.title}>Расписание</Text>
      <Calendar
        style={styles.calendar}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          calendarBackground: theme.colors.background,
          textSectionTitleColor: theme.colors.text,
          dayTextColor: theme.colors.text,
          todayTextColor: theme.colors.primary,
          selectedDayBackgroundColor: theme.colors.accent,
          selectedDayTextColor: '#ffffff',
          arrowColor: theme.colors.primary,
          monthTextColor: theme.colors.text,
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        {filteredMedications.length > 0 ? (
          filteredMedications.map((med) => (
            <View
              key={med.id}
              style={styles.card}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{med.name}</Text>
                <Text style={styles.cardText}>
                  Дозировка: {med.tabletCount} табл. x {med.tabletDosage} мг
                </Text>
                <Text style={styles.cardText}>
                  Время: {med.times.map(formatTime).join(', ')}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ScheduleForm', { medication: med })}
                >
                  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      fill={theme.colors.primary}
                    />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(med.id)}>
                  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      fill={theme.colors.error}
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 20 }]}>
            Нет приёмов на эту дату
          </Text>
        )}
      </ScrollView>
      <FAB
        title="+"
        placement="right"
        color={theme.colors.primary}
        onPress={() => navigation.navigate('ScheduleForm')}
        buttonStyle={{ borderRadius: 50, width: 60, height: 60 }}
        titleStyle={{ fontSize: 24 }}
        containerStyle={{
          position: 'absolute',
          bottom: 55,
          right: 10,
        }}
      />
      <NavBar />
    </View>
  );
}