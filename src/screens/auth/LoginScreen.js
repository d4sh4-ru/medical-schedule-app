import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { loginUser } from '../../services/userService';
import { useTheme } from '../../theme/ThemeProvider';
import { createGlobalStyles } from '../../constants/globalStyles';

export default function LoginScreen({ navigation }) {
  const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Неверный логин или пароль',
    USER_NOT_FOUND: 'Пользователь не найден',
    SERVER_ERROR: 'Ошибка сервера, попробуйте позже',
    NETWORK_ERROR: 'Проблемы с интернет-соединением',
  };  

  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);

  // Отключаем шапку
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Регулярное выражение для валидации email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        if (!value) return 'Email обязателен';
        if (!emailRegex.test(value)) return 'Введите корректный email (например, example@domain.com)';
        return false;
      case 'password':
        if (!value) return 'Пароль обязателен';
        if (value.length <= 8) return 'Пароль должен быть длиннее 8 символов';
        return false;
      default:
        return false;
    }
  };

  const validateFields = () => {
    const newErrors = {
      email: validateField('email', email),
      password: validateField('password', password),
    };
    setErrors(newErrors);

    return !Object.values(newErrors).some(error => error);
  };

  const handleLogin = async () => {
    // Помечаем все поля как посещённые
    setTouched({
      email: true,
      password: true,
    });

    if (!validateFields()) {
      return;
    }

    try {
      await loginUser({ email, password });
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
    
      const code = error?.response?.data?.code || error?.code;
      const defaultMessage = 'Произошла ошибка. Попробуйте ещё раз.';
      const message = ERROR_MESSAGES[code] || defaultMessage;
    
      const newErrors = {
        email: '',
        password: message,
      };
      setErrors(newErrors);
    }    
  };

  return (
    <View style={styles.containerCenter}>
      <Text style={styles.titleCenter}>Вход</Text>
      <View>
        <TextInput
          style={[styles.input, errors.email && touched.email && styles.inputError]}
          placeholder="Email"
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (touched.email || errors.email) {
              setErrors(prev => ({ ...prev, email: validateField('email', text) }));
            }
          }}
          onBlur={() => {
            setTouched(prev => ({ ...prev, email: true }));
            setErrors(prev => ({ ...prev, email: validateField('email', email) }));
          }}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
        {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      <View>
        <TextInput
          style={[styles.input, errors.password && touched.password && styles.inputError]}
          placeholder="Пароль"
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (touched.password || errors.password) {
              setErrors(prev => ({ ...prev, password: validateField('password', text) }));
            }
          }}
          onBlur={() => {
            setTouched(prev => ({ ...prev, password: true }));
            setErrors(prev => ({ ...prev, password: validateField('password', password) }));
          }}
          secureTextEntry
          placeholderTextColor="#999"
        />
        {errors.password && touched.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Подтвердить</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => alert('Восстановление пароля пока не реализовано')}>
        <Text style={styles.link}>Забыл пароль? Восстановить</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Нет учетной записи? Зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );
}