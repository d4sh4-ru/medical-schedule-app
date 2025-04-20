// screens/EditMeScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';

export default function EditMeScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Редактирование профиля</Text>
      <Text style={styles.bodyText}>Экран в разработке</Text>
    </View>
  );
}