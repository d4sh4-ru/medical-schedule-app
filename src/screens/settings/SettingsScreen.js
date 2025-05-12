// components/SettingsScreen/index.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { createGlobalStyles } from '../../constants/globalStyles';
import { lightTheme, darkTheme } from '../../theme/theme';
import NavBar from '../../components/NavBar';
import { fetchLinkedUsers } from '../../api/userApi';
import { clearLogout } from '../../services/userService';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const isDarkTheme = theme === darkTheme;
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Инициализация при монтировании
  useEffect(() => {
    const loadLinkedUsers = async () => {
      setIsLoading(true);
      const { data, error } = await fetchLinkedUsers(navigation);
      setLinkedUsers(data);
      setError(error);
      setIsLoading(false);
    };
    
    loadLinkedUsers();
  }, []);

  // Функция выхода из профиля
  const handleLogout = async () => {
    await clearLogout();
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
