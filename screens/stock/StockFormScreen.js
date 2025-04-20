import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MedicationContext } from '../../utils/MedicationContext';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';

export default function StockFormScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const { addStock } = useContext(MedicationContext);

  const [name, setName] = useState('');
  const [tabletDosage, setTabletDosage] = useState('');
  const [tabletCount, setTabletCount] = useState('');

  const handleSubmit = () => {
    if (!name || !tabletDosage || !tabletCount) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    if (isNaN(tabletDosage) || isNaN(tabletCount) || parseInt(tabletDosage) <= 0 || parseInt(tabletCount) < 0) {
      Alert.alert('Ошибка', 'Введите корректные значения для дозировки и количества');
      return;
    }

    addStock({
      id: Date.now().toString(),
      name,
      tabletDosage: parseInt(tabletDosage),
      tabletCount: parseInt(tabletCount),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добавить запас</Text>
      <TextInput
        style={styles.input}
        placeholder="Название препарата"
        placeholderTextColor={theme.colors.text + '80'}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Дозировка (мг)"
        placeholderTextColor={theme.colors.text + '80'}
        value={tabletDosage}
        onChangeText={setTabletDosage}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Количество таблеток"
        placeholderTextColor={theme.colors.text + '80'}
        value={tabletCount}
        onChangeText={setTabletCount}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.markButton} onPress={handleSubmit}>
        <Text style={styles.markButtonText}>Сохранить</Text>
      </TouchableOpacity>
    </View>
  );
}