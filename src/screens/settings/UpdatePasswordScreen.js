// screens/UpdatePasswordScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { createGlobalStyles } from '../../constants/globalStyles';

export default function UpdatePasswordScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Обновление пароля</Text>
      <Text style={styles.bodyText}>Экран в разработке</Text>
    </View>
  );
}