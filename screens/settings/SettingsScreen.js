import React from 'react';
import { View, Text, TouchableOpacity, Switch, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';
import { lightTheme, darkTheme } from '../../utils/theme';
import NavBar from '../../components/NavBar';
import { removeToken } from '../../utils/auth';

// Временные данные для связанных пользователей
const mockLinkedUsers = [
  { id: '1', name: 'Доктор Иванов', role: 'Врач' },
  { id: '2', name: 'Анна Петрова', role: 'Родственник' },
];

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const route = useRoute();
  const isDarkTheme = theme === darkTheme;

  // Функция выхода из профиля
  const handleLogout = async () => {
    await removeToken();
    navigation.replace('Login');
  };

  // Рендеринг связанного пользователя
  const renderLinkedUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.bodyText}>{item.name}</Text>
      <Text style={styles.captionText}>{item.role}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.settingsCard}>
        <Text style={styles.bodyText}>Связанные пользователи</Text>
        <FlatList
          data={mockLinkedUsers}
          renderItem={renderLinkedUser}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.captionText}>Нет связанных пользователей</Text>}
        />
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