import React, { useState, useCallback, useRef } from 'react';
import {
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  LayoutAnimation, // Добавлено для анимации
} from 'react-native';
import { fetchWithAuth } from '../api/fetchWithAuth';

// TODO: Добавить ещё два метода для загрузки
// 1. Все возможные количества таблеток в пачке для препарата
// 2. Все возможные дозировки одной таблетки для препарата 

const AutocompleteInput = ({
  value,
  onChangeText,
  placeholder,
  theme,
  navigation,
  style,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [inputLayout, setInputLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const textInputRef = useRef(null);

  // Измеряем размеры и позицию TextInput
  const handleInputLayout = (event) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setInputLayout({ width, height, x, y });
  };

  // Анимация появления/исчезновения меню
  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [suggestions, isFetchingSuggestions]);

  // Локальные стили
  const localStyles = StyleSheet.create({
    container: {
      position: 'relative', // Добавлено для корректного позиционирования дочерних элементов
    },
    input: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    suggestionContainer: {
      position: 'absolute',
      left: 0,
      right: 0, // Автоматически подстраивается под ширину контейнера
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderTopWidth: 0,
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
    [navigation]
  );

  // Обработка ввода
  const handleTextChange = (text) => {
    onChangeText(text);
    fetchSuggestions(text);
  };

  // Выбор варианта
  const handleSelectSuggestion = (selectedName) => {
    onChangeText(selectedName);
    setSuggestions([]);
    textInputRef.current?.focus();
  };

  return (
    <View style={localStyles.container}>
      <TextInput
        ref={textInputRef}
        style={[localStyles.input, style]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text + '80'}
        value={value}
        onChangeText={handleTextChange}
        onLayout={handleInputLayout}
      />
      {isFetchingSuggestions && (
        <View
          style={[
            localStyles.loadingContainer,
            {
              top: inputLayout.height, // Привязка к нижнему краю TextInput
              width: inputLayout.width, // Уточнение ширины
            },
          ]}
        >
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}
      {suggestions.length > 0 && !isFetchingSuggestions && (
        <ScrollView
          style={[
            localStyles.suggestionContainer,
            {
              top: inputLayout.height, // Привязка к нижнему краю TextInput
              width: inputLayout.width, // Уточнение ширины
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={localStyles.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={localStyles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default AutocompleteInput;