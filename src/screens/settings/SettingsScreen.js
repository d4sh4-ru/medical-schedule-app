import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Rect } from 'react-native-svg';
import styles from '../../constants/globalStyles';
import Header from '../../components/Header';
import { fetchLinkedUsers, fetchMe } from '../../api/userApi';
import { clearLogout } from '../../services/userService';

// Простая хэш-функция для генерации идентикана
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Конвертация в 32-битное целое
  }
  return Math.abs(hash);
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [me, setMe] = useState(null);

  // Инициализация при монтировании
  useEffect(() => {
    const loadLinkedUsers = async () => {
      setIsLoading(true);
      const { data, error } = await fetchLinkedUsers(navigation);
      setLinkedUsers(data || []);
      const me = await fetchMe(navigation);
      setMe(me);
      setError(error);
      setIsLoading(false);
    };

    loadLinkedUsers();
  }, [navigation]);

  // Функция выхода из профиля
  const handleLogout = async () => {
    await clearLogout();
    navigation.replace('Login');
  };

  // Генерация SVG-идентикона
  const generateIdenticon = (name) => {
    const seed = name && name.trim() !== '' ? name : 'default';
    const hash = simpleHash(seed);
    const size = 100; // Размер SVG (50x50 пикселей)
    const gridSize = 5; // Сетка 5x5
    const squareSize = size / gridSize; // Размер одного квадрата
    const colors = [
      '#E63946', // Насыщенный красный
      '#1D3557', // Темно-синий
      '#457B9D', // Средний синий
      '#A8DADC', // Светло-голубой/бирюзовый
      '#F4A261', // Насыщенный оранжевый
      '#2A9D8F', // Темная бирюза
      '#E76F51', // Кораллово-красный
      '#8D4004', // Темно-коричневый
    ];

    // Генерация массива квадратов
    const squares = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const index = x * gridSize + y;
        const shouldDraw = (hash >> index) & 1;
        if (shouldDraw) {
          const color = colors[(hash >> (index % colors.length)) % colors.length];
          squares.push(
            <Rect
              key={`${x}-${y}`}
              x={x * squareSize}
              y={y * squareSize}
              width={squareSize}
              height={squareSize}
              fill={color}
            />
          );
        }
      }
    }

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x="0" y="0" width={size} height={size} fill="#f0f0f0" />
        {squares}
      </Svg>
    );
  };

  return (
    <SafeAreaView style={styles.settingsScreen.container}>
      <Header
        title="Настройки"
        onLeftPress={() => navigation.navigate('Home')}
        leftIconName="close"
      />
      <View style={styles.settingsScreen.settingsContainer}>
        <View style={[styles.settingsScreen.cardPersonalInfo, {flexDirection: "row"}]}>
          <View>
            {generateIdenticon(me?.firstName)}
          </View>
          <View style={{paddingLeft:16, flexDirection: "column"}}>
            <Text style={styles.settingsScreen.personalNameText}>{me?.firstName}</Text>
            <Text style={styles.settingsScreen.personalDetailText}>{me?.lastName}</Text>
            {me?.middleName && (
              <Text style={styles.settingsScreen.personalDetailText}>{me?.middleName}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.common.card}
          onPress={() => navigation.navigate('RelateUsers')}
        >
          <Text style={styles.common.text}>Связанные пользователи</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.common.card}
          onPress={() => navigation.navigate('UpdatePassword')}
        >
          <Text style={styles.common.text}>Обновить пароль</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.common.card}
          onPress={() => navigation.navigate('EditMe')}
        >
          <Text style={styles.common.text}>Редактировать персональную информацию</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.common.card} onPress={handleLogout}>
          <Text style={[styles.common.text, { color: '#d32f2f' }]}>Выйти из профиля</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}