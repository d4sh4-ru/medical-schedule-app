import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import { View, Text, FlatList, Animated, Dimensions, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import styles from "../constants/globalStyles";
import { generateMonths } from "../utils/dateUtils";
import { getPlan } from "../services/planService";
import ReminderModal from "./ReminderModal";
import { Ionicons } from "@expo/vector-icons";
import log from "../utils/coloredLog";

const CustomModeForm = (
  { scheduleId, isEditing, setHasUnsavedChanges },
  ref
) => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reminders, setReminders] = useState([]);
  const [bottomSheetAnim] = useState(new Animated.Value(0)); // Начальная позиция (скрыто)
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false); // Управление видимостью
  const flatListRef = useRef(null); // Ссылка на FlatList календаря
  const [calendarHeight, setCalendarHeight] = useState(0); // Высота календаря

  const months = generateMonths();

  useImperativeHandle(ref, () => ({
    getFormData: () => reminders,
  }));

  useEffect(() => {
    if (isEditing) {
      const loadSchedule = async () => {
        try {
          const data = await getPlan(scheduleId, navigation);
          setReminders(data.reminders || []);
        } catch (err) {
          Alert.alert("Ошибка", err.message);
        }
      };
      loadSchedule();
    }
  }, [isEditing, scheduleId, navigation]);

  // Измеряем высоту календаря
  const onLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setCalendarHeight(height);
  };

  const renderMonth = ({ item: month }) => {
    const weeks = [];
    for (let i = 0; i < month.days.length; i += 7) {
      weeks.push(month.days.slice(i, i + 7));
    }

    return (
      <View style={styles.calendarScreen.monthContainer}>
        <Text style={styles.calendarScreen.monthLabel}>{month.month}</Text>
        <View style={styles.calendarScreen.weekdaysContainer}>
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day, index) => (
            <Text key={index} style={styles.calendarScreen.weekdayLabel}>
              {day}
            </Text>
          ))}
        </View>
        <View style={styles.calendarScreen.daysContainer}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.calendarScreen.weekContainer}>
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <View
                      key={`${weekIndex}-${dayIndex}`}
                      style={styles.calendarScreen.emptyDay}
                    />
                  );
                }
                const isToday = day.date.toDateString() === new Date().toDateString();
                const hasReminders = reminders.some(
                  (r) => r.scheduledAt.toDateString() === day.date.toDateString()
                );
                return (
                  <TouchableOpacity
                    key={`${weekIndex}-${dayIndex}`}
                    style={[
                      styles.calendarScreen.dayContainer,
                      isToday && styles.calendarScreen.todayDayNumber,
                      hasReminders && styles.calendarScreen.selectedDayContainer,
                      !day.isActive && styles.calendarScreen.disabledDayContainer,
                    ]}
                    onPress={() => {
                      if (day.isActive) {
                        log.magenta("Вызван день", day.date);
                        setSelectedDate(day.date);
                        setIsBottomSheetVisible(true);
                        Animated.timing(bottomSheetAnim, {
                          toValue: 1, // Показываем меню
                          duration: 300,
                          useNativeDriver: true,
                        }).start();
                      }
                    }}
                    disabled={!day.isActive}
                  >
                    <Text
                      style={[
                        styles.calendarScreen.dayNumber,
                        isToday && styles.calendarScreen.todayDayNumber,
                        hasReminders && styles.calendarScreen.selectedDayNumber,
                        !day.isActive && styles.calendarScreen.disabledDayNumber,
                      ]}
                    >
                      {day.date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const handleAddReminder = (reminder) => {
    setReminders([
      ...reminders,
      {
        id: reminders.length + 1,
        scheduledAt: reminder.scheduledAt,
        singleDosage: reminder.singleDosage,
        singleDosageTablets: parseInt(reminder.singleDosageTablets),
      },
    ]);
    setHasUnsavedChanges(true);
  };

  const handleEditReminder = (updatedReminder) => {
    setReminders(
      reminders.map((r) =>
        r.id === updatedReminder.id ? updatedReminder : r
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleDeleteReminder = (id) => {
    setReminders(reminders.filter((r) => r.id !== id));
    setHasUnsavedChanges(true);
  };

  const closeBottomSheet = () => {
    Animated.timing(bottomSheetAnim, {
      toValue: 0, // Скрываем меню
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsBottomSheetVisible(false));
  };

  const renderBottomSheet = () => {
    if (!isBottomSheetVisible) return null;

    const translateY = bottomSheetAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [calendarHeight * 1.2, 0], // Скрываем за границей календаря на 20%
    });

    const dayReminders = reminders.filter(
      (r) => r.scheduledAt.toDateString() === selectedDate.toDateString()
    );

    return (
      <Animated.View
        style={[
          styles.stockScreen.modalContainer,
          {
            transform: [{ translateY }],
            height: calendarHeight, // Высота равна высоте календаря
            position: "absolute",
            top: 0, // Начинается с верхней части календаря
            left: 0,
            right: 0,
            zIndex: 10, // Поверх календаря
            backgroundColor: "#fff", // Непрозрачный фон
          },
        ]}
      >
        <View style={[styles.stockScreen.modalContent, { flex: 1 }]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8 }}>
            <Text style={styles.stockScreen.modalTitle}>
              {selectedDate.toLocaleDateString("ru-RU", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
            <TouchableOpacity onPress={closeBottomSheet}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, position: "relative" }}>
            <FlatList
              data={dayReminders}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.common.card}>
                  <View>
                    <Text style={styles.common.text}>
                      {item.scheduledAt.toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <Text style={styles.common.captionText}>
                      {item.singleDosageTablets} табл., {item.singleDosage} мг
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={styles.timeItem.deleteButton}
                      onPress={() => handleEditReminder(item)}
                    >
                      <Ionicons name="pencil" size={24} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.timeItem.deleteButton}
                      onPress={() => handleDeleteReminder(item.id)}
                    >
                      <Ionicons name="trash" size={24} color="#d32f2f" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <Text style={[styles.common.emptyText, { textAlign: "center", marginTop: 16 }]}>
                  Нет напоминаний
                </Text>
              }
            />
            <ReminderModal
              onAddReminder={handleAddReminder}
              onEditReminder={handleEditReminder}
              selectedDate={selectedDate}
            />
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <FlatList
        ref={flatListRef}
        data={months}
        renderItem={renderMonth}
        keyExtractor={(item) => item.month}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={0}
        getItemLayout={(data, index) => ({
          length: 350,
          offset: 350 * index,
          index,
        })}
      />
      {renderBottomSheet()}
    </View>
  );
};

export default forwardRef(CustomModeForm);