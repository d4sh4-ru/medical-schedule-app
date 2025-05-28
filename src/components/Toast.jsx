import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import globalStyles from '../constants/globalStyles'; // Путь к вашим стилям

// Компонент Toast для отображения уведомлений
const Toast = ({ message, type = 'info', duration = 3000, onDismiss }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current; // Анимация прозрачности
  const translateYAnim = useRef(new Animated.Value(50)).current; // Анимация смещения по Y

  // Запуск анимации появления и автозакрытия
  useEffect(() => {
    // Параллельная анимация: появление и подъем
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Таймер для автозакрытия
    const timer = setTimeout(() => {
      dismissToast();
    }, duration);

    return () => clearTimeout(timer); // Очистка таймера при размонтировании
  }, []);

  // Функция закрытия тоста с анимацией
  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onDismiss) onDismiss(); // Вызов коллбэка после завершения анимации
    });
  };

  // Определение стилей тоста в зависимости от типа
  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return [
          styles.toastContainer,
          {
            backgroundColor: globalStyles.common.cardCompleted.backgroundColor,
            borderColor: globalStyles.common.cardCompleted.borderColor,
          },
        ];
      case 'error':
        return [
          styles.toastContainer,
          {
            backgroundColor: globalStyles.common.cardOverdue.backgroundColor,
            borderColor: globalStyles.common.cardOverdue.borderColor,
          },
        ];
      default:
        return [
          styles.toastContainer,
          {
            backgroundColor: globalStyles.common.card.backgroundColor,
            borderColor: globalStyles.common.card.borderColor,
          },
        ];
    }
  };

  // Определение стилей текста в зависимости от типа
  const getTextStyle = () => {
    switch (type) {
      case 'error':
        return [styles.toastText, globalStyles.common.errorText];
      default:
        return [styles.toastText, globalStyles.common.text];
    }
  };

  return (
    <TouchableOpacity onPress={dismissToast} activeOpacity={0.8}>
      <Animated.View
        style={[
          getToastStyle(),
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <Text style={getTextStyle()}>{message}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Локальные стили для тоста
const styles = {
  toastContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  toastText: {
    textAlign: 'center',
  },
};

export default Toast;