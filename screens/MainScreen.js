// screens/MainScreen.js
import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../utils/ThemeProvider';
import { MedicationContext } from '../utils/MedicationContext';
import { createGlobalStyles } from '../styles/globalStyles';
import NavBar from '../components/NavBar';

export default function MainScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const { medications, markAsTaken } = useContext(MedicationContext);

  // Функция для вычисления оставшегося времени
  const getTimeRemaining = (medTime) => {
    const now = new Date();
    const diffMs = medTime - now;
    if (diffMs < 0) return { overdue: true, text: 'Просрочено' };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { overdue: false, text: `${hours} ч ${minutes} мин` };
  };

  // Фильтрация приёмов на сегодня
  const getTodayMedications = () => {
    const today = new Date();
    return medications
      .filter((med) =>
        med.times.some(
          (time) =>
            time.getFullYear() === today.getFullYear() &&
            time.getMonth() === today.getMonth() &&
            time.getDate() === today.getDate()
        )
      )
      .map((med) => ({
        ...med,
        times: med.times.filter(
          (time) =>
            time.getFullYear() === today.getFullYear() &&
            time.getMonth() === today.getMonth() &&
            time.getDate() === today.getDate()
        ),
      }))
      .sort((a, b) => a.times[0] - b.times[0]);
  };

  // Обновление каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {}, 60000);
    return () => clearInterval(interval);
  }, [medications]);

  // Рендеринг карточки приёма
  const renderMedication = ({ item }) => {
    const { overdue, text } = getTimeRemaining(item.times[0]);
    if (item.completed) {
      return (
        <View style={[styles.card, styles.cardCompleted]}>
          <View>
            <Text style={styles.bodyText}>
              {item.name} - {item.tabletCount} табл. ({item.tabletDosage} мг)
            </Text>
            <Text style={styles.captionText}>Принято</Text>
          </View>
          <TouchableOpacity style={[styles.markButton, styles.markButtonCompleted]} disabled>
            <Text style={styles.markButtonText}>✔</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={[styles.card, overdue && styles.cardOverdue]}>
        <View>
          <Text style={styles.bodyText}>
            {item.name} - {item.tabletCount} табл. ({item.tabletDosage} мг)
          </Text>
          <Text style={overdue ? styles.overdueText : styles.captionText}>{text}</Text>
        </View>
        <TouchableOpacity style={styles.markButton} onPress={() => markAsTaken(item.id)}>
          <Text style={styles.markButtonText}>Отметить</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Сегодня</Text>
      <FlatList
        data={getTodayMedications()}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.bodyText}>Нет приёмов на сегодня</Text>}
      />
      <NavBar />
    </View>
  );
}