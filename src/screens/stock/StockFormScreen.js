import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../../constants/globalStyles';
import AutocompleteInput from '../../components/AutocompleteInput';
import { createStock } from '../../services/stockService';
import { searchMedications } from '../../api/medicationApi';
import Header from '../../components/Header';
import ErrorModal from '../../components/ErrorModal';

export default function StockFormScreen({ route }) {
  const navigation = useNavigation();
  const [medicationTradeName, setMedicationTradeName] = useState(route.params?.medicationTradeName || '');
  const [remainingQuantity, setRemainingQuantity] = useState('');
  const [errorModal, setErrorModal] = useState({ visible: false, error: null });
  const currentDate = new Date().toISOString();
  const { fetchStocks } = route.params || {};

  // Создание остатка
  const handleSubmit = async () => {
    if (!medicationTradeName || !remainingQuantity) {
      setErrorModal({ visible: true, error: 'Заполните все поля' });
      return;
    }
    if (isNaN(remainingQuantity) || parseInt(remainingQuantity) < 0) {
      setErrorModal({ visible: true, error: 'Введите корректное количество таблеток' });
      return;
    }

    try {
      const stockData = {
        medicationTradeName,
        requestDate: currentDate,
        restockDate: currentDate,
        remainingQuantity: parseInt(remainingQuantity),
      };
      const response = await createStock(stockData, navigation);
      if (response.error) {
        throw new Error(response.error.message || 'Не удалось добавить остаток');
      }
      navigation.goBack();
      if (fetchStocks) {
        await fetchStocks();
      }
      console.log('Stock created:', stockData);
    } catch (err) {
      console.warn('Error adding stock:', err);
      setErrorModal({ visible: true, error: err.message || 'Не удалось добавить остаток' });
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
      <ErrorModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ ...errorModal, visible: false })}
        error={errorModal.error}
      />
    </SafeAreaView>
  );
}