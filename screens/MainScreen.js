// screens/MainScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../utils/ThemeProvider';
import { createGlobalStyles } from '../styles/globalStyles';
import NavBar from '../components/NavBar';

// Временные данные для приёмов
const mockMedications = [
  { id: '1', name: 'Ибупрофен', time: new Date(2025, 3, 18, 10, 0), dose: '400 мг', completed: false },
  { id: '2', name: 'Парацетамол', time: new Date(2025, 3, 18, 12, 30), dose: '500 мг', completed: false },
  { id: '3', name: 'Аспирин', time: new Date(2025, 3, 18, 8, 0), dose: '100 мг', completed: false },
  { id: '4', name: 'Витамин C', time: new Date(2025, 3, 18, 18, 0), dose: '1000 мг', completed: false },
  { id: '5', name: 'Лоратадин', time: new Date(2025, 3, 19, 9, 0), dose: '10 мг', completed: false },
];

export default function MainScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const [medications, setMedications] = useState(mockMedications);

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
    return medications.filter((med) => {
      const medDate = new Date(med.time);
      return (
        medDate.getFullYear() === today.getFullYear() &&
        medDate.getMonth() === today.getMonth() &&
        medDate.getDate() === today.getDate()
      );
    });
  };

  // Обновление таймеров каждую минуту
  useEffect(() => {
    const interval = setInterval(() => {
      setMedications([...medications]);
    }, 60000);
    return () => clearInterval(interval);
  }, [medications]);

  // Отметка приёма
  const markAsTaken = (id) => {
    setMedications(
      medications.map((med) =>
        med.id === id ? { ...med, completed: true } : med
      )
    );
  };

  // Рендеринг карточки приёма
  const renderMedication = ({ item }) => {
    const { overdue, text } = getTimeRemaining(item.time);
    if (item.completed) {
      return (
        <View style={[styles.card, styles.cardCompleted]}>
          <View>
            <Text style={styles.bodyText}>{item.name} - {item.dose}</Text>
            <Text style={styles.captionText}>Принято</Text>
          </View>
          <TouchableOpacity
            style={[styles.markButton, styles.markButtonCompleted]}
            disabled
          >
            <Text style={styles.markButtonText}>✔</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={[styles.card, overdue && styles.cardOverdue]}>
        <View>
          <Text style={styles.bodyText}>{item.name} - {item.dose}</Text>
          <Text style={overdue ? styles.overdueText : styles.captionText}>
            {text}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.markButton}
          onPress={() => markAsTaken(item.id)}
        >
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