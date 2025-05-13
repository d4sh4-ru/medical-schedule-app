import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../services/userService';
import { useTheme } from '../theme/ThemeProvider';
import { createGlobalStyles } from '../constants/globalStyles';


/**
 * Компонент для защиты маршрутов. Проверяет, авторизован ли пользователь.
 * Если нет — перенаправляет на экран входа.
 * 
 * @param {React.ReactNode} children - Дочерние компоненты, которые будут отображаться, если пользователь авторизован.
 * @returns {React.ReactNode} Дочерние компоненты, если пользователь авторизован, или ничего, если не авторизован.
 */
export default function ProtectedRoute({ children }) {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (token) {
        setIsAuthenticated(true);
      } else {
        navigation.replace('Login');
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [navigation]);

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return isAuthenticated ? children : null;
}