import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import log from "../utils/coloredLog";
import styles from "../constants/globalStyles";

const ErrorModal = ({
  visible,
  onClose,
  error, // Может быть строкой (одна ошибка) или массивом строк (несколько ошибок)
  secondaryButtonText, // Текст для второй кнопки (если передан, кнопка отображается)
  onSecondaryAction, // Действие для второй кнопки (например, навигация или повторная попытка)
}) => {
  // Функция для рендеринга отдельной ошибки в списке
  const renderErrorItem = ({ item }) => (
    <View style={styles.scheduleScreen.timeItem}>
      <Ionicons name="warning-outline" size={24} color={"#d32f2f"} />
      <Text
        style={[
          styles.scheduleScreen.modalText,
          { color: "#d32f2f", marginLeft: 8 },
        ]}
      >
        {item}
      </Text>
    </View>
  );

  // Определяем, является ли error строкой или массивом
  const isErrorArray = Array.isArray(error);
  const errorData = isErrorArray ? error : [error];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.scheduleScreen.modalContainer}>
        <View style={[styles.scheduleScreen.modalContent]}>
          <View style={{ flexDirection: "row" }}>
            <Ionicons name="warning-outline" size={24} color={"#d32f2f"} />
            <Text style={[styles.scheduleScreen.modalTitle, {paddingLeft: 10}]}>Ошибка</Text> 
          </View>
          {error && errorData.length > 0 ? (
            <>
              {isErrorArray ? (
                <FlatList
                  data={errorData}
                  renderItem={renderErrorItem}
                  keyExtractor={(item, index) => index.toString()}
                  style={{ maxHeight: 200, marginBottom: 20 }}
                />
              ) : (
                <View style={styles.scheduleScreen.timeItem}>
                  <Text
                    style={[
                      styles.scheduleScreen.modalText,
                      { color: "#d32f2f" },
                    ]}
                  >
                    {error}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.scheduleScreen.modalButtonContainer,
                  { paddingBottom: 10, marginTop: 20 },
                ]}
              >
                {secondaryButtonText && onSecondaryAction && (
                  <TouchableOpacity
                    style={[
                      styles.scheduleScreen.modalButton,
                      {
                        backgroundColor: "#007AFF",
                        minHeight: 48,
                        marginRight: 10,
                        flex: 1,
                      },
                    ]}
                    onPress={onSecondaryAction}
                  >
                    <Text
                      style={[
                        styles.scheduleScreen.modalButtonText,
                        { color: "#fff" },
                      ]}
                    >
                      {secondaryButtonText}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.scheduleScreen.modalButton,
                    {
                      backgroundColor: "#666",
                      minHeight: 48,
                      flex: secondaryButtonText ? 1 : undefined, // Если есть вторая кнопка, делим пространство
                      marginLeft: secondaryButtonText ? 10 : 0, // Отступ только если есть вторая кнопка
                    },
                  ]}
                  onPress={onClose}
                >
                  <Text
                    style={[
                      styles.scheduleScreen.modalButtonText,
                      { color: "#fff" },
                    ]}
                  >
                    Закрыть
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text style={styles.scheduleScreen.modalText}>
                Неизвестная ошибка. Пожалуйста, попробуйте снова.
              </Text>
              <TouchableOpacity
                style={[
                  styles.scheduleScreen.modalButton,
                  { backgroundColor: "#666", minHeight: 48, marginTop: 20 },
                ]}
                onPress={onClose}
              >
                <Text
                  style={[
                    styles.scheduleScreen.modalButtonText,
                    { color: "#fff" },
                  ]}
                >
                  Закрыть
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ErrorModal;
