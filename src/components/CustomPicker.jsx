import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
  Alert, // Добавляем Alert для лучшего отображения ошибок
} from 'react-native';
import styles from '../constants/globalStyles';

const CustomPicker = ({ value, options, onSelect, unit = '' }) => { // Добавляем пропс `unit`
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState(''); // Переименовал в customValue для универсальности

  // Находим label, соответствующий текущему value
  // Если value === 'custom', то отображаем 'Своя дозировка' или 'Свой интервал'
  // Иначе, находим label из options
  const displayValue = options.find(option => option.value === value)?.label || value;

  useEffect(() => {
    LayoutAnimation.configureNext(
      Platform.OS === 'android'
        ? LayoutAnimation.Presets.linear
        : LayoutAnimation.Presets.easeInEaseOut
    );
  }, [isOpen, showCustomInput]);

  const handleSelect = (newValue) => {
    if (newValue === 'custom') {
      setShowCustomInput(true);
      // Если текущее значение уже было кастомным, предзаполняем поле
      if (value !== 'custom') { // Проверяем, чтобы не сбрасывать, если уже кастомное
         setCustomValue('');
      } else {
        // Если 'value' уже 'custom', то устанавливаем текущее значение в 'customValue'
        // Например, если дозировка была 333 мг, и мы снова выбираем "Своя дозировка"
        const currentNumericalValue = parseInt(value);
        if (!isNaN(currentNumericalValue) && currentNumericalValue > 0) {
            setCustomValue(value);
        } else {
            setCustomValue(''); // Сбрасываем, если не числовое
        }
      }
    } else {
      onSelect(newValue);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomValue('');
    }
  };

  const handleCustomValueSubmit = () => {
    const parsedValue = parseInt(customValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
      Alert.alert('Ошибка', 'Введите корректное значение'); // Используем Alert
      return;
    }
    onSelect(customValue); // Отправляем числовое значение в родительский компонент
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomValue('');
  };

  const handleCustomValueCancel = () => {
    setShowCustomInput(false);
    setCustomValue('');
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { // Если открываем, сбрасываем состояние кастомного ввода
      setShowCustomInput(false);
      setCustomValue('');
    }
  };

  return (
    <View style={styles.customPicker.container}>
      <TouchableOpacity
        style={styles.customPicker.triggerButton}
        onPress={toggleDropdown}
      >
        {/* Отображаем label, найденный по value, и добавляем unit, если он передан */}
        <Text style={styles.customPicker.triggerText}>
          {displayValue}
          {unit && displayValue !== 'Своя дозировка' && displayValue !== 'Свой интервал' ? ` ${unit}` : ''}
        </Text>
      </TouchableOpacity>
      {isOpen && (
        <ScrollView style={styles.customPicker.dropdown}>
          {!showCustomInput ? (
            options.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.customPicker.dropdownItem}
                onPress={() => handleSelect(item.value)}
              >
                <Text style={styles.customPicker.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.customPicker.customInputContainer}>
              <TextInput
                style={styles.customPicker.customInput}
                value={customValue}
                onChangeText={setCustomValue}
                keyboardType="numeric"
                placeholder={`Введите значение (${unit || 'ед.'})`} // Уточняем placeholder
                placeholderTextColor="#666"
                autoFocus
              />
              <View style={styles.customPicker.customInputButtons}>
                <TouchableOpacity
                  style={styles.customPicker.customInputButton}
                  onPress={handleCustomValueSubmit}
                >
                  <Text style={styles.customPicker.customInputButtonText}>Применить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.customPicker.customInputButton}
                  onPress={handleCustomValueCancel}
                >
                  <Text style={styles.customPicker.customInputButtonText}>Отмена</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default CustomPicker;