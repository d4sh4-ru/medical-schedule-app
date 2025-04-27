import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getToken } from './auth';
import { useTheme } from './ThemeProvider';
import { createGlobalStyles } from '../styles/globalStyles';

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