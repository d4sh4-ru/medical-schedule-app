import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';
import { fetchWithAuth } from '../../utils/api';

export default function StockFormScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const [medicationTradeName, setMedicationTradeName] = useState('');
  const [remainingQuantity, setRemainingQuantity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const currentDate = new Date().toISOString();
  const textInputRef = useRef(null);

  // Локальные стили для автодополнения
  const localStyles = StyleSheet.create({
    autocompleteContainer: {
      position: 'relative',
      width: '100%',
      zIndex: 1000,
    },
    input: {
      ...styles.input,
      borderRadius: 8,
      borderWidth: 1,
      borderBottomWidth: 1, // Убираем нижнюю границу для seamless соединения
      borderColor: theme.colors.border,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    suggestionContainer: {
      position: 'absolute',
      top: 48, // Высота поля (примерно 48px, включая padding)
      marginTop: -1, // Отрицательный margin для устранения зазора
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderTopWidth: 0, // Убираем верхнюю границу для соединения
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      maxHeight: 150,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      zIndex: 1000,
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    suggestionText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    loadingContainer: {
      position: 'absolute',
      top: 48,
      marginTop: -1, // Устраняем зазор
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
      elevation: 5,
      zIndex: 1000,
    },
  });

  // Дебаунсинг для запроса автодополнения
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Запрос автодополнения
  const fetchSuggestions = useCallback(
    debounce(async (prefix) => {
      if (!prefix.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        setIsFetchingSuggestions(true);
        const response = await fetchWithAuth(
          `http://cloud-ru-test.netbird.cloud:8080/api/medications/search?prefix=${encodeURIComponent(prefix)}`,
          { method: 'GET' },
          navigation
        );
        const data = await response.json();
        setSuggestions(data.names || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300),
    []
  );

  // Обработка ввода названия
  const handleNameChange = (text) => {
    setMedicationTradeName(text);
    fetchSuggestions(text);
  };

  // Выбор варианта из списка
  const handleSelectSuggestion = (name) => {
    setMedicationTradeName(name);
    setSuggestions([]);
    textInputRef.current?.focus();
  };

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
        'http://cloud-ru-test.netbird.cloud:8080/api/schedule/restock',
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
      <View style={localStyles.autocompleteContainer}>
        <TextInput
          ref={textInputRef}
          style={localStyles.input}
          placeholder="Название препарата"
          placeholderTextColor={theme.colors.text + '80'}
          value={medicationTradeName}
          onChangeText={handleNameChange}
        />
        {isFetchingSuggestions && (
          <View style={localStyles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        {suggestions.length > 0 && !isFetchingSuggestions && (
          <FlatList
            style={localStyles.suggestionContainer}
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={localStyles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <Text style={localStyles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
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