import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';
import { fetchWithAuth } from '../../utils/api';
import AutocompleteInput from '../../components/AutocompleteInput';

export default function StockFormScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const [medicationTradeName, setMedicationTradeName] = useState('');
  const [remainingQuantity, setRemainingQuantity] = useState('');
  const currentDate = new Date().toISOString();

  // Создание остатка
  const handleSubmit = async () => {
    if (!medicationTradeName || !remainingQuantity) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    if (isNaN(remainingQuantity) || parseInt(remainingQuantity) < 0) {
      Alert.alert('Ошибка', 'Введите корректное количество таблеток');
      return;
    }

    try {
      await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/plan/restock',
        {
          method: 'POST',
          body: JSON.stringify({
            medicationTradeName,
            requestDate: currentDate,
            restockDate: currentDate,
            RemainingQuantity: parseInt(remainingQuantity),
          }),
        },
        navigation
      );
      navigation.goBack();
    } catch (err) {
      console.error('Error adding stock:', err);
      Alert.alert('Ошибка', 'Не удалось добавить остаток');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добавить остаток</Text>
      <AutocompleteInput
        value={medicationTradeName}
        onChangeText={setMedicationTradeName}
        placeholder="Название препарата"
        theme={theme}
        navigation={navigation}
        style={styles.input}
      />
      <TextInput
        style={styles.input}
        placeholder="Количество таблеток"
        placeholderTextColor={theme.colors.text + '80'}
        value={remainingQuantity}
        onChangeText={setRemainingQuantity}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.markButton} onPress={handleSubmit}>
        <Text style={styles.markButtonText}>Сохранить</Text>
      </TouchableOpacity>
    </View>
  );
}