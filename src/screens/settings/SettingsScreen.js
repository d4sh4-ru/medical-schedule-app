import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import styles from '../../constants/globalStyles';
import Header from '../../components/Header';
import NavBar from '../../components/NavBar';
import { fetchLinkedUsers } from '../../api/userApi';
import { clearLogout } from '../../services/userService';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const isDarkTheme = theme === theme.darkTheme;
  const [linkedUsers, setLinkedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Инициализация при монтировании
  useEffect(() => {
    const loadLinkedUsers = async () => {
      setIsLoading(true);
      const { data, error } = await fetchLinkedUsers(navigation);
      setLinkedUsers(data || []);
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

  // Рендеринг связанного пользователя
  const renderLinkedUser = ({ item }) => (
    <View style={styles.common.card}>
      <Text style={styles.common.text}>
        {item.userInfo.firstName} {item.userInfo.lastName}
      </Text>
    </View>
  );

  return (
    <View style={[styles.settingsScreen.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Настройки"
        onLeftPress={() => navigation.navigate('Home')}
        leftIconName="close" // Крестик
      />
      <View style={styles.settingsScreen.settingsContainer}>
        <View style={styles.common.card}>
          <Text style={styles.common.text}>Связанные пользователи</Text>
          {isLoading ? (
            <Text style={styles.common.loadingText}>Загрузка...</Text>
          ) : error && linkedUsers.length === 0 ? (
            <Text style={styles.common.errorText}>{error}</Text>
          ) : (
            <FlatList
              data={linkedUsers}
              renderItem={renderLinkedUser}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={
                <Text style={styles.common.emptyText}>Нет связанных пользователей</Text>
              }
            />
          )}
        </View>
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
        <View
          style={[
            styles.common.card,
            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
          ]}
        >
          <Text style={styles.common.text}>Тёмная тема</Text>
          <Switch
            value={isDarkTheme}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.switchTrackOff, true: theme.colors.switchTrackOn }}
            thumbColor={isDarkTheme ? theme.colors.switchThumbOn : theme.colors.switchThumbOff}
          />
        </View>
        <TouchableOpacity style={styles.common.card} onPress={handleLogout}>
          <Text style={[styles.common.text, { color: theme.colors.error }]}>Выйти из профиля</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}