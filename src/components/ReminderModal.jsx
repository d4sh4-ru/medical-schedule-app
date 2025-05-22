import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import styles from "../constants/globalStyles";
import CustomPicker from "./CustomPicker";

export default function ReminderModal({ onAddReminder, onEditReminder, selectedDate }) {
  const [showModal, setShowModal] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminder, setReminder] = useState({
    id: null,
    scheduledAt: selectedDate,
    singleDosage: "100",
    singleDosageTablets: "1",
  });

  const dosageOptions = [
    { label: "10 мг", value: "10" },
    { label: "20 мг", value: "20" },
    { label: "50 мг", value: "50" },
    { label: "100 мг", value: "100" },
    { label: "200 мг", value: "200" },
    { label: "400 мг", value: "400" },
    { label: "500 мг", value: "500" },
    { label: "1000 мг", value: "1000" },
    { label: "Своя дозировка", value: "custom" },
  ];

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && selectedTime) {
        setReminder({ ...reminder, scheduledAt: selectedTime });
        setShowTimePicker(false);
      } else if (event.type === "dismissed") {
        setShowTimePicker(false);
      }
    } else {
      if (selectedTime) {
        setReminder({ ...reminder, scheduledAt: selectedTime });
      }
    }
  };

  const handleSubmit = () => {
    if (
      !reminder.singleDosage ||
      isNaN(parseInt(reminder.singleDosage)) ||
      parseInt(reminder.singleDosage) <= 0
    ) {
      Alert.alert("Ошибка", "Введите корректную дозировку");
      return;
    }
    if (
      !reminder.singleDosageTablets ||
      isNaN(parseInt(reminder.singleDosageTablets)) ||
      parseInt(reminder.singleDosageTablets) <= 0
    ) {
      Alert.alert("Ошибка", "Введите корректное количество таблеток");
      return;
    }

    if (reminder.id) {
      onEditReminder(reminder);
    } else {
      onAddReminder({ ...reminder, id: Date.now() });
    }
    setShowModal(false);
    setReminder({
      id: null,
      scheduledAt: selectedDate,
      singleDosage: "100",
      singleDosageTablets: "1",
    });
  };

  return (
    <>
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 0, // Выше кнопки "Подтвердить"
          right: 0,
          backgroundColor: "#007AFF",
          borderRadius: 30,
          width: 60,
          height: 60,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 20, // Поверх списка напоминаний
          elevation: 5, // Тень для Android
          shadowColor: "#000", // Тень для iOS
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
        onPress={() => setShowModal(true)}
      >
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "600" }}>+</Text>
      </TouchableOpacity>
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.scheduleFormScreen.modalContainer}>
          <View style={styles.scheduleFormScreen.modalContent}>
            <Text style={styles.scheduleFormScreen.title}>
              {reminder.id ? "Редактировать напоминание" : "Добавить напоминание"}
            </Text>
            <Text style={styles.scheduleFormScreen.label}>Время приёма</Text>
            <TouchableOpacity
              style={styles.dateRangePicker.triggerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateRangePicker.triggerText}>
                {reminder.scheduledAt.toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={reminder.scheduledAt}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "clock"}
                onChange={handleTimeChange}
                locale="ru-RU"
                is24Hour
                textColor="black"
              />
            )}
            <Text style={styles.scheduleFormScreen.label}>Количество таблеток</Text>
            <TextInput
              style={styles.common.input}
              value={reminder.singleDosageTablets}
              onChangeText={(text) =>
                setReminder({ ...reminder, singleDosageTablets: text })
              }
              keyboardType="numeric"
              placeholder="1"
              placeholderTextColor="#666"
            />
            <Text style={styles.scheduleFormScreen.label}>
              Дозировка одной таблетки (мг)
            </Text>
            <CustomPicker
              value={reminder.singleDosage}
              options={dosageOptions}
              onSelect={(value) =>
                setReminder({ ...reminder, singleDosage: value })
              }
            />
            <View style={[styles.scheduleFormScreen.modalButtonContainer, {flexDirection: 'row', justifyContent: 'center', marginTop: 16}]}>
              <TouchableOpacity
                style={[styles.common.button, { backgroundColor: "#d32f2f", marginHorizontal: 10, flex: 1, }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.scheduleFormScreen.modalButtonText, {color: '#fff'}]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.common.button, { backgroundColor: "#007AFF", marginHorizontal: 10, flex: 1, }]}
                onPress={handleSubmit}
              >
                <Text style={[styles.scheduleFormScreen.modalButtonText, {color: '#fff'}]}>
                  {reminder.id ? "Сохранить" : "Добавить"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}