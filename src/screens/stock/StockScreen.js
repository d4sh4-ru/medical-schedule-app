import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  SafeAreaView,
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
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import styles from '../../constants/globalStyles';
import Svg, { Path } from 'react-native-svg';
import { FAB } from 'react-native-elements';
import NavBar from '../../components/NavBar';
import Header from '../../components/Header';
import log from '../../utils/coloredLog';
import { fetchStocksRequest, updateStockRequest, deleteStockRequest } from '../../api/stockApi';

export default function StockScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  let route = useRoute();
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const textInputRef = useRef(null);

  // Проверка параметров для автоматического редактирования
  useEffect(() => {
    const { stockId, medicationTradeName, editStock } = route.params || {};
    if (editStock && stocks.length > 0) {
      let stock;
      if (stockId) {
        stock = stocks.find((s) => s.id === stockId);
      } else if (medicationTradeName) {
        stock = stocks.find((s) => s.medicationTradeName === medicationTradeName);
      }
      if (stock) {
        setSelectedStock(stock);
        setNewQuantity(stock.remainingQuantity.toString());
        setModalVisible(true);
      } else {
        Alert.alert('Ошибка', `Остаток для "${medicationTradeName}" не найден.`, [
          { text: 'OK', style: 'cancel' },
        ]);
      }
    }
  }, [stocks, route.params]);

  // Показ ошибки с действием
  const showErrorAlert = ({ message, action }) => {
    const buttons = [{ text: 'OK', style: 'cancel' }];
    if (action) {
      buttons.push({
        text: action.message,
        onPress: () => navigation.navigate(action.navigateTo, { fetchStocks }),
      });
    }

    Alert.alert('Ошибка', message, buttons);
  };

  // Загрузка остатков
  const fetchStocks = async () => {
    try {
      setIsLoading(true);
      setIsRetrying(true);
      const { data, error } = await fetchStocksRequest(navigation);
      if (error) {
        setError(error);
        showErrorAlert(error);
      } else {
        setStocks(Array.isArray(data) ? data : []);
        setError(null);
        log.cyan('[StockScreen] Fetched stocks:', data);
      }
    } catch (err) {
      log.error('[StockScreen] Error fetching stocks:', err.message, { code: err.code });
      const errorMessage = err.code ? err.message : 'Не удалось загрузить остатки.';
      setError({ message: errorMessage, action: err.action });
      showErrorAlert({ message: errorMessage, action: err.action });
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    fetchStocks();
  }, []);

  // Перезапрос остатков при возврате на экран
  useFocusEffect(
    useCallback(() => {
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
      const { data, error } = await updateStockRequest(
        selectedStock.id,
        {
          ...selectedStock,
          remainingQuantity: parseInt(newQuantity),
        },
        navigation
      );
      if (error) {
        setError(error);
        showErrorAlert(error);
      } else {
        setStocks((prev) =>
          prev.map((stock) =>
            stock.id === selectedStock.id ? { ...stock, remainingQuantity: parseInt(newQuantity) } : stock
          )
        );
        setError(null);
        log.cyan('[StockScreen] Updated stock:', data);
        Keyboard.dismiss();
        setModalVisible(false);
        setNewQuantity('');
        setSelectedStock(null);
        navigation.setParams({ editStock: false });
      }
    } catch (err) {
      log.error('[StockScreen] Error updating stock:', err.message, { code: err.code });
      const errorMessage = err.code ? err.message : 'Не удалось обновить остаток.';
      setError({ message: errorMessage, action: err.action });
      showErrorAlert({ message: errorMessage, action: err.action });
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
            const { data, error } = await deleteStockRequest(id, navigation);
            if (error) {
              setError(error);
              showErrorAlert(error);
            } else {
              setStocks((prev) => prev.filter((stock) => stock.id !== id));
              setError(null);
              log.cyan('[StockScreen] Deleted stock:', id);
            }
          } catch (err) {
            log.error('[StockScreen] Error deleting stock:', err.message, { code: err.code });
            const errorMessage = err.code ? err.message : 'Не удалось удалить остаток.';
            setError({ message: errorMessage, action: err.action });
            showErrorAlert({ message: errorMessage, action: err.action });
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.stockScreen.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Запасы" />
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={[styles.common.errorText, { color: theme.colors.error }]}>{error.message}</Text>
          <TouchableOpacity
            style={[styles.common.button, { backgroundColor: theme.colors.primary }]}
            onPress={fetchStocks}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.common.buttonText}>Повторить</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.stockScreen.list}
          showsVerticalScrollIndicator={false}
        >
          {stocks.length > 0 ? (
            <>
              <Text style={[styles.common.debugText, { color: theme.colors.textSecondary || '#666' }]}>
                Остатков: {stocks.length}
              </Text>
              {stocks.map((stock) => (
                <View key={stock.id} style={styles.common.card}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.common.text, { color: theme.colors.text }]}>
                      {stock.medicationTradeName}
                    </Text>
                    <Text style={[styles.common.captionText, { color: theme.colors.textSecondary || '#666' }]}>
                      Количество: {stock.remainingQuantity} табл.
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => handleEdit(stock)} style={{ padding: 8 }}>
                      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                          fill={theme.colors.primary}
                        />
                      </Svg>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(stock.id)} style={{ padding: 8 }}>
                      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                          fill={theme.colors.error}
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <Text style={[styles.common.emptyText, { color: theme.colors.textSecondary || '#666' }]}>
              Нет остатков препаратов
            </Text>
          )}
        </ScrollView>
      )}

      {/* Модальное окно для редактирования количества */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.stockScreen.modalContainer}>
              <View style={styles.stockScreen.modalContent}>
                <Text style={styles.stockScreen.modalTitle}>
                  Редактировать количество
                </Text>

                <TextInput
                  ref={textInputRef}
                  style={[styles.common.input]}
                  value={newQuantity}
                  onChangeText={setNewQuantity}
                  keyboardType="numeric"
                  placeholder="Количество таблеток"
                  placeholderTextColor={theme.colors.textSecondary || '#666'}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleSaveEdit}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                  <TouchableOpacity
                    style={[styles.common.button, { backgroundColor: theme.colors.error, flex: 1, marginRight: 8 }]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.common.buttonText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.common.button, { backgroundColor: theme.colors.primary, flex: 1 }]}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.common.buttonText}>Подтвердить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
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
        containerStyle={{ position: 'absolute', bottom: 80, right: 10 }}
      />
      <NavBar />
    </SafeAreaView>
  );
}