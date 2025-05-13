import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../../constants/globalStyles';
import AutocompleteInput from '../../components/AutocompleteInput';
import { createStock } from '../../services/stockService';
import { searchMedications } from '../../api/medicationApi';
import Header from '../../components/Header';

export default function StockFormScreen({ route }) {
  const navigation = useNavigation();
  const [medicationTradeName, setMedicationTradeName] = useState('');
  const [remainingQuantity, setRemainingQuantity] = useState('');
  const currentDate = new Date().toISOString();
  const { fetchStocks } = route.params || {};

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
      await createStock(
        {
          medicationTradeName,
          requestDate: currentDate,
          restockDate: currentDate,
          remainingQuantity: parseInt(remainingQuantity),
        },
        navigation
      );
      if (fetchStocks) {
        await fetchStocks();
      }
      navigation.goBack();
      console.log('Stock created:', { medicationTradeName, remainingQuantity });
    } catch (err) {
      console.error('Error adding stock:', err);
      Alert.alert('Ошибка', 'Не удалось добавить остаток');
    }
  };

  return (
    <SafeAreaView style={styles.common.container}>
      <Header
        title="Добавить запас"
        leftIconName="close-outline"
        onLeftPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.stockFormScreen.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View>
          <AutocompleteInput
            value={medicationTradeName}
            onChangeText={setMedicationTradeName}
            placeholder="Название препарата"
            navigation={navigation}
            style={[styles.common.input, { marginBottom: 16 }]}
            fetchData={searchMedications}
          />
          <TextInput
            style={[styles.common.input, { marginBottom: 16 }]}
            placeholder="Количество таблеток"
            placeholderTextColor={'#666'}
            value={remainingQuantity}
            onChangeText={setRemainingQuantity}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          <TouchableOpacity
            style={[styles.common.button]}
            onPress={handleSubmit}
          >
            <Text style={styles.common.buttonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}