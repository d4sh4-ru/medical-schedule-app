import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MedicationContext } from '../../utils/MedicationContext';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';
import Svg, { Path } from 'react-native-svg';
import { FAB } from 'react-native-elements';
import NavBar from '../../components/NavBar';

export default function StockScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const { stocks, updateStock, deleteStock } = useContext(MedicationContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newTabletCount, setNewTabletCount] = useState('');
  const textInputRef = useRef(null);

  // Открытие модального окна для редактирования с автофокусом
  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setNewTabletCount(stock.tabletCount.toString());
    setModalVisible(true);
  };

  // Автоматическое открытие клавиатуры и управление её состоянием
  useEffect(() => {
    if (modalVisible && textInputRef.current) {
      textInputRef.current.focus();
    }

    // Слушатель для предотвращения скрытия клавиатуры
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (modalVisible && textInputRef.current) {
        textInputRef.current.focus(); // Сразу открываем клавиатуру снова
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [modalVisible]);

  // Сохранение изменений количества таблеток
  const handleSaveEdit = () => {
    if (!newTabletCount || isNaN(newTabletCount) || parseInt(newTabletCount) < 0) {
      Alert.alert('Ошибка', 'Введите корректное количество таблеток');
      return;
    }
    updateStock(selectedStock.id, { ...selectedStock, tabletCount: parseInt(newTabletCount) });
    Keyboard.dismiss();
    setModalVisible(false);
    setNewTabletCount('');
    setSelectedStock(null);
  };

  // Закрытие модального окна с закрытием клавиатуры
  const handleCancel = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setNewTabletCount('');
    setSelectedStock(null);
  };

  // Удаление запаса
  const handleDelete = (id) => {
    Alert.alert(
      'Подтверждение',
      'Вы уверены, что хотите удалить этот запас?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => deleteStock(id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: 100 }]}>
      <ScrollView style={{ flex: 1 }}>
        {stocks.length > 0 ? (
          stocks.map((stock) => (
            <View key={stock.id} style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{stock.name}</Text>
                <Text style={styles.cardText}>
                  Дозировка: {stock.tabletDosage} мг
                </Text>
                <Text style={styles.cardText}>
                  Количество: {stock.tabletCount} табл.
                </Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(stock)}>
                  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                      fill={theme.colors.primary}
                    />
                  </Svg>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(stock.id)}>
                  <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                      fill={theme.colors.error}
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.bodyText, { textAlign: 'center', marginTop: 20 }]}>
            Нет запасов препаратов
          </Text>
        )}
      </ScrollView>

      {/* Модальное окно для редактирования количества таблеток */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalContainer}>
              <SafeAreaView
                style={[
                  styles.modalContent,
                  {
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    paddingVertical: 8,
                  },
                ]}
              >
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <Text
                    style={[
                      styles.title,
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border,
                      },
                    ]}
                  >
                    Редактировать количество
                  </Text>
                  <View
                    style={[
                      styles.modalItem,
                      { paddingHorizontal: 12, paddingVertical: 8 },
                    ]}
                  >
                    <TextInput
                      ref={textInputRef}
                      style={[styles.input, { padding: 8 }]}
                      value={newTabletCount}
                      onChangeText={setNewTabletCount}
                      keyboardType="numeric"
                      placeholder="Количество таблеток"
                      placeholderTextColor={theme.colors.text + '80'}
                      autoFocus={true}
                      returnKeyType="none" // Убираем кнопку "Готово" на iOS
                    />
                  </View>
                  <View
                    style={[
                      styles.modalItem,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        borderBottomWidth: 0,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        marginTop: 8,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        styles.markButton,
                        {
                          backgroundColor: theme.colors.error,
                          flex: 1,
                          marginRight: 8,
                          paddingVertical: 6,
                        },
                      ]}
                      onPress={handleCancel}
                    >
                      <Text style={[styles.markButtonText, { fontSize: 13 }]}>
                        Отмена
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.markButton,
                        { flex: 1, paddingVertical: 6 },
                      ]}
                      onPress={handleSaveEdit}
                    >
                      <Text style={[styles.markButtonText, { fontSize: 13 }]}>
                        Подтвердить
                      </Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <FAB
        title="+"
        placement="right"
        color={theme.colors.primary}
        onPress={() => navigation.navigate('StockForm')}
        buttonStyle={{ borderRadius: 50, width: 60, height: 60 }}
        titleStyle={{ fontSize: 24 }}
        containerStyle={{
          position: 'absolute',
          bottom: 55,
          right: 10,
        }}
      />
      <NavBar />
    </View>
  );
}