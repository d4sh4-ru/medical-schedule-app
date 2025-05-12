import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { register } from '../../api/auth';
import { useTheme } from '../../theme/ThemeProvider';
import { createGlobalStyles } from '../../constants/globalStyles';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [displayPhoneNumber, setDisplayPhoneNumber] = useState('');
  const [rawPhoneNumber, setRawPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isRelative, setIsRelative] = useState(false);
  const [errors, setErrors] = useState({
    email: false,
    firstName: false,
    lastName: false,
    middleName: false,
    phoneNumber: false,
    password: false,
  });
  const [touched, setTouched] = useState({
    email: false,
    firstName: false,
    lastName: false,
    middleName: false,
    phoneNumber: false,
    password: false,
  });

  // Регулярные выражения для валидации
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+7[0-9]{10}$/;

  // Форматирование номера телефона
  const formatPhoneNumber = (text) => {
    let cleaned = text.replace(/[^+\d]/g, '');
    if (!cleaned) {
      return { display: '', raw: '' };
    }
    if (cleaned.startsWith('+7')) {
      cleaned = '7' + cleaned.slice(2);
    } else if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    } else if (cleaned.startsWith('9')) {
      cleaned = '7' + cleaned;
    }
    if (cleaned.length > 11) cleaned = cleaned.slice(0, 11);
    let raw = cleaned.length > 0 ? '+7' + cleaned.slice(1) : '';
    let display = '+7';
    if (cleaned.length > 1) display += ' (' + cleaned.slice(1, 4);
    if (cleaned.length >= 4) display += ') ' + cleaned.slice(4, 7);
    if (cleaned.length >= 7) display += '-' + cleaned.slice(7, 9);
    if (cleaned.length >= 9) display += '-' + cleaned.slice(9, 11);
    return { display, raw };
  };

  const handlePhoneChange = (text) => {
    const { display, raw } = formatPhoneNumber(text);
    setDisplayPhoneNumber(display);
    setRawPhoneNumber(raw);
    if (touched.phoneNumber || errors.phoneNumber) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: validateField('phoneNumber', raw),
      }));
    }
  };

  const capitalizeFirstLetter = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        if (!value) return 'Email обязателен';
        if (!emailRegex.test(value)) return 'Введите корректный email';
        return false;
      case 'firstName':
        if (!value) return 'Имя обязательно';
        if (!/^[А-Я]/.test(value)) return 'Имя должно начинаться с заглавной русской буквы';
        if (!/^[А-Я][а-я]*$/.test(value)) return 'Имя должно содержать только русские буквы';
        if (value.length < 3) return 'Имя должно содержать минимум 3 буквы';
        return false;
      case 'lastName':
        if (!value) return 'Фамилия обязательна';
        if (!/^[А-Я]/.test(value)) return 'Фамилия должна начинаться с заглавной русской буквы';
        if (!/^[А-Я][а-я]*$/.test(value)) return 'Фамилия должна содержать только русские буквы';
        if (value.length < 3) return 'Фамилия должна содержать минимум 3 буквы';
        return false;
      case 'middleName':
        if (!value) return false;
        if (!/^[А-Я]/.test(value)) return 'Отчество должно начинаться с заглавной русской буквы';
        if (!/^[А-Я][а-я]*$/.test(value)) return 'Отчество должно содержать только русские буквы';
        if (value.length < 3) return 'Отчество должно содержать минимум 3 буквы';
        return false;
      case 'phoneNumber':
        if (!value) return false;
        if (!value.startsWith('+7')) return 'Номер должен начинаться с +7';
        if (value.length !== 12) return 'Номер должен содержать 10 цифр после +7';
        if (!phoneRegex.test(value)) return 'Введите корректный номер телефона';
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
      firstName: validateField('firstName', firstName),
      lastName: validateField('lastName', lastName),
      middleName: validateField('middleName', middleName),
      phoneNumber: validateField('phoneNumber', rawPhoneNumber),
      password: validateField('password', password),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleRegister = async () => {
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      middleName: true,
      phoneNumber: true,
      password: true,
    });
    if (!validateFields()) return;
    try {
      const role = isRelative ? 'Relative' : 'Patient';
      await register(email, password, firstName, lastName, role, middleName || undefined, rawPhoneNumber || undefined);
      alert('Регистрация успешна!');
      navigation.navigate('Login');
    } catch (error) {
      alert('Ошибка: ' + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.containerCenter}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titleCenter}>Регистрация</Text>
          <View>
            <TextInput
              style={[styles.input, errors.email && touched.email && styles.inputError]}
              placeholder="Email*"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (touched.email || errors.email) {
                  setErrors((prev) => ({ ...prev, email: validateField('email', text) }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, email: true }));
                setErrors((prev) => ({ ...prev, email: validateField('email', email) }));
              }}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
            {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          <View>
            <TextInput
              style={[styles.input, errors.firstName && touched.firstName && styles.inputError]}
              placeholder="Имя*"
              value={firstName}
              onChangeText={(text) => {
                const capitalized = capitalizeFirstLetter(text);
                setFirstName(capitalized);
                if (touched.firstName || errors.firstName) {
                  setErrors((prev) => ({
                    ...prev,
                    firstName: validateField('firstName', capitalized),
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, firstName: true }));
                setErrors((prev) => ({ ...prev, firstName: validateField('firstName', firstName) }));
              }}
              placeholderTextColor="#999"
            />
            {errors.firstName && touched.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>
          <View>
            <TextInput
              style={[styles.input, errors.lastName && touched.lastName && styles.inputError]}
              placeholder="Фамилия*"
              value={lastName}
              onChangeText={(text) => {
                const capitalized = capitalizeFirstLetter(text);
                setLastName(capitalized);
                if (touched.lastName || errors.lastName) {
                  setErrors((prev) => ({
                    ...prev,
                    lastName: validateField('lastName', capitalized),
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, lastName: true }));
                setErrors((prev) => ({ ...prev, lastName: validateField('lastName', lastName) }));
              }}
              placeholderTextColor="#999"
            />
            {errors.lastName && touched.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>
          <View>
            <TextInput
              style={[styles.input, errors.middleName && touched.middleName && styles.inputError]}
              placeholder="Отчество"
              value={middleName}
              onChangeText={(text) => {
                const capitalized = capitalizeFirstLetter(text);
                setMiddleName(capitalized);
                if (touched.middleName || errors.middleName) {
                  setErrors((prev) => ({
                    ...prev,
                    middleName: validateField('middleName', capitalized),
                  }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, middleName: true }));
                setErrors((prev) => ({ ...prev, middleName: validateField('middleName', middleName) }));
              }}
              placeholderTextColor="#999"
            />
            {errors.middleName && touched.middleName && (
              <Text style={styles.errorText}>{errors.middleName}</Text>
            )}
          </View>
          <View>
            <TextInput
              style={[styles.input, errors.phoneNumber && touched.phoneNumber && styles.inputError]}
              placeholder="+7 (XXX) XXX-XX-XX"
              value={displayPhoneNumber}
              onChangeText={handlePhoneChange}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, phoneNumber: true }));
                setErrors((prev) => ({
                  ...prev,
                  phoneNumber: validateField('phoneNumber', rawPhoneNumber),
                }));
              }}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            {errors.phoneNumber && touched.phoneNumber && (
              <Text style={styles.errorText}>{errors.phoneNumber}</Text>
            )}
          </View>
          <View>
            <TextInput
              style={[styles.input, errors.password && touched.password && styles.inputError]}
              placeholder="Пароль*"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (touched.password || errors.password) {
                  setErrors((prev) => ({ ...prev, password: validateField('password', text) }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, password: true }));
                setErrors((prev) => ({ ...prev, password: validateField('password', password) }));
              }}
              secureTextEntry
              placeholderTextColor="#999"
            />
            {errors.password && touched.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>
          <View style={styles.switchContainer}>
            <Switch
              value={isRelative}
              onValueChange={setIsRelative}
              trackColor={{ false: '#999', true: theme.colors.primary }}
              thumbColor={isRelative ? '#fff' : '#fff'}
              ios_backgroundColor="#999"
            />
            <Text style={styles.switchLabel}>
              Я буду отслеживать приём лекарств другого пользователя
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Подтвердить</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}