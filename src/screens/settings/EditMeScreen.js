// screens/EditMeScreen.js
import React from 'react';
import { View, Text } from 'react-native';
import styles from '../../constants/globalStyles';

export default function EditMeScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Редактирование профиля</Text>
      <Text style={styles.bodyText}>Экран в разработке</Text>
    </View>
  );
}