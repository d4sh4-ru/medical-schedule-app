import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';
import { lightTheme, darkTheme } from '../../utils/theme';
import NavBar from '../../components/NavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { removeToken } from '../../utils/auth';
import { fetchWithAuth } from '../../utils/api';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const isDarkTheme = theme === darkTheme;
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка связанных пользователей
  const fetchLinkedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/me/related-users',
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      setLinkedUsers(data);
      await AsyncStorage.setItem('linkedUsers', JSON.stringify(data));
      setError(null);
    } catch (err) {
      console.error('Error fetching linked users:', err);
      setError('Не удалось загрузить связанных пользователей');
      const cached = await AsyncStorage.getItem('linkedUsers');
      if (cached) {
        setLinkedUsers(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('linkedUsers');
        if (cached) {
          setLinkedUsers(JSON.parse(cached));
          setIsLoading(false);
        }
        await fetchLinkedUsers();
      } catch (err) {
        console.error('Error loading linked users:', err);
        setError('Ошибка загрузки связанных пользователей');
        setIsLoading(false);
      }
    })();
  }, []);

  // Функция выхода из профиля
  const handleLogout = async () => {
    await removeToken();
    await AsyncStorage.removeItem('notifications');
    await AsyncStorage.removeItem('stocks');
    await AsyncStorage.removeItem('linkedUsers');
    navigation.replace('Login');
  };

  // Рендеринг связанного пользователя
  const renderLinkedUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.bodyText}>
        {item.userInfo.firstName} {item.userInfo.lastName}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.settingsCard}>
        <Text style={styles.bodyText}>Связанные пользователи</Text>
        {isLoading ? (
          <Text style={styles.captionText}>Загрузка...</Text>
        ) : error && linkedUsers.length === 0 ? (
          <Text style={styles.captionText}>{error}</Text>
        ) : (
          <FlatList
            data={linkedUsers}
            renderItem={renderLinkedUser}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={<Text style={styles.captionText}>Нет связанных пользователей</Text>}
          />
        )}
      </View>
      <TouchableOpacity
        style={styles.settingsCard}
        onPress={() => navigation.navigate('UpdatePassword')}
      >
        <Text style={styles.bodyText}>Обновить пароль</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingsCard}
        onPress={() => navigation.navigate('EditMe')}
      >
        <Text style={styles.bodyText}>Редактировать персональную информацию</Text>
      </TouchableOpacity>
      <View style={[styles.settingsCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <Text style={styles.bodyText}>Тёмная тема</Text>
        <Switch
          value={isDarkTheme}
          onValueChange={toggleTheme}
          trackColor={styles.switch.trackColor}
          thumbColor={styles.switch.thumbColor}
        />
      </View>
      <TouchableOpacity
        style={styles.settingsCard}
        onPress={handleLogout}
      >
        <Text style={[styles.bodyText, { color: theme.colors.error }]}>Выйти из профиля</Text>
      </TouchableOpacity>
      <NavBar />
    </View>
  );
}