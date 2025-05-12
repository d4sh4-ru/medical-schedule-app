import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { createGlobalStyles } from '../../constants/globalStyles';
import Svg, { Path } from 'react-native-svg';
import { FAB } from 'react-native-elements';
import NavBar from '../../components/NavBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getStocks,
  modifyStock,
  removeStock
} from '../../services/stockService';


export default function StockScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastFetchDate, setLastFetchDate] = useState(new Date().toDateString());
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const textInputRef = useRef(null);

  // Загрузка остатков
  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      setIsRetrying(true);
      const data = await getStocks(navigation);
      setStocks(data);
      setLastFetchDate(new Date().toDateString());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };
  

  // Инициализация при монтировании
  useEffect(() => {
    (async () => {
      try {
        const cached = await AsyncStorage.getItem('stocks');
        if (cached) {
          setStocks(JSON.parse(cached));
          setIsLoading(false);
        }
        await fetchStocks();
      } catch (err) {
        console.error('Error loading stocks:', err);
        setError('Ошибка загрузки остатков');
        setIsLoading(false);
      }
    })();
  }, []);

  // Перезапрос остатков при возврате на экран
  useFocusEffect(
    React.useCallback(() => {
      fetchStocks();
    }, [])
  );

  // Открытие модального окна для редактирования
  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setNewQuantity(stock.remainingQuantity.toString());
    setModalVisible(true);
  };

  // Автофокус и управление клавиатурой
  useEffect(() => {
    if (modalVisible && textInputRef.current) {
      textInputRef.current.focus();
    }

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      if (modalVisible && textInputRef.current) {
        textInputRef.current.focus();
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [modalVisible]);

  // Сохранение изменений
  const handleSaveEdit = async () => {
    if (!newQuantity || isNaN(newQuantity) || parseInt(newQuantity) < 0) {
      Alert.alert('Ошибка', 'Введите корректное количество');
      return;
    }
  
    try {
      const updatedStocks = await modifyStock(
        selectedStock.id,
        {
          ...selectedStock,
          RemainingQuantity: parseInt(newQuantity),
        },
        stocks,
        navigation
      );
      setStocks(updatedStocks);
      setError(null);
      Keyboard.dismiss();
      setModalVisible(false);
      setNewQuantity('');
      setSelectedStock(null);
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err.message);
    }
  };  

  // Закрытие модального окна
  const handleCancel = () => {
    Keyboard.dismiss();
    setModalVisible(false);
    setNewQuantity('');
    setSelectedStock(null);
  };

  // Удаление остатка
  const handleDelete = async (id) => {
    Alert.alert('Подтверждение', 'Вы уверены, что хотите удалить этот остаток?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedStocks = await removeStock(id, stocks, navigation);
            setStocks(updatedStocks);
            setError(null);
          } catch (err) {
            console.error('Error deleting stock:', err);
            setError(err.message);
          }
        },
      },
    ]);
  };  

  return (
    <View style={[styles.container, { paddingBottom: 100 }]}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error && stocks.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.bodyText}>{error}</Text>
          <TouchableOpacity style={styles.markButton} onPress={fetchStocks} disabled={isRetrying}>
            {isRetrying ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.markButtonText}>Повторить</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {stocks.length > 0 ? (
            stocks.map((stock) => (
              <View key={stock.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{stock.medicationTradeName}</Text>
                  <Text style={styles.cardText}>
                    Количество: {stock.remainingQuantity} табл.
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
              Нет остатков препаратов
            </Text>
          )}
        </ScrollView>
      )}

      {/* Модальное окно для редактирования количества */}
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
                style={[styles.modalContent, { borderTopLeftRadius: 12, borderTopRightRadius: 12, paddingVertical: 8 }]}
              >
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
                  <Text
                    style={[styles.title, { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
                  >
                    Редактировать количество
                  </Text>
                  <View style={[styles.modalItem, { paddingHorizontal: 12, paddingVertical: 8 }]}>
                    <TextInput
                      ref={textInputRef}
                      style={[styles.input, { padding: 8 }]}
                      value={newQuantity}
                      onChangeText={setNewQuantity}
                      keyboardType="numeric"
                      placeholder="Количество таблеток"
                      placeholderTextColor={theme.colors.text + '80'}
                      autoFocus={true}
                      returnKeyType="none"
                    />
                  </View>
                  <View
                    style={[styles.modalItem, { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 0, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 }]}
                  >
                    <TouchableOpacity
                      style={[styles.markButton, { backgroundColor: theme.colors.error, flex: 1, marginRight: 8, paddingVertical: 6 }]}
                      onPress={handleCancel}
                    >
                      <Text style={[styles.markButtonText, { fontSize: 13 }]}>Отмена</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.markButton, { flex: 1, paddingVertical: 6 }]}
                      onPress={handleSaveEdit}
                    >
                      <Text style={[styles.markButtonText, { fontSize: 13 }]}>Подтвердить</Text>
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
        onPress={() => navigation.navigate('StockForm', { fetchStocks })}
        buttonStyle={{ borderRadius: 50, width: 60, height: 60 }}
        titleStyle={{ fontSize: 24 }}
        containerStyle={{ position: 'absolute', bottom: 55, right: 10 }}
      />
      <NavBar />
    </View>
  );
}