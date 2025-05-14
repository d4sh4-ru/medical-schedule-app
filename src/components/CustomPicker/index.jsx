import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
} from 'react-native';
import styles from '../../constants/globalStyles';

const CustomPicker = ({ value, options, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDosage, setCustomDosage] = useState('');

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
    } else {
      onSelect(newValue);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomDosage('');
    }
  };

  const handleCustomDosageSubmit = () => {
    const parsedDosage = parseInt(customDosage);
    if (isNaN(parsedDosage) || parsedDosage <= 0) {
      alert('Ошибка: Введите корректную дозировку');
      return;
    }
    onSelect(customDosage);
    setIsOpen(false);
    setShowCustomInput(false);
    setCustomDosage('');
  };

  const handleCustomDosageCancel = () => {
    setShowCustomInput(false);
    setCustomDosage('');
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowCustomInput(false);
      setCustomDosage('');
    }
  };

  return (
    <View style={styles.customPicker.container}>
      <TouchableOpacity
        style={styles.customPicker.triggerButton}
        onPress={toggleDropdown}
      >
        <Text style={styles.customPicker.triggerText}>{value} мг</Text>
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
                value={customDosage}
                onChangeText={setCustomDosage}
                keyboardType="numeric"
                placeholder="Введите дозировку (мг)"
                placeholderTextColor="#666"
                autoFocus
              />
              <View style={styles.customPicker.customInputButtons}>
                <TouchableOpacity
                  style={styles.customPicker.customInputButton}
                  onPress={handleCustomDosageSubmit}
                >
                  <Text style={styles.customPicker.customInputButtonText}>Применить</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.customPicker.customInputButton}
                  onPress={handleCustomDosageCancel}
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