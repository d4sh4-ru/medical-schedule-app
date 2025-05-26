import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Platform,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import styles from "../constants/globalStyles";
import CustomPicker from "./CustomPicker";
import TimeGrid from "./TimeGrid";
import DateRangePicker from "./DateRangePicker";
import { formatTime, formatDateRange } from "../utils/scheduleUtils";
import { getPlan } from "../services/planService";

// Вспомогательная функция для создания даты без учета времени, в UTC
// Это гарантирует, что день будет тем же, независимо от часового пояса пользователя.
const createDateWithoutTime = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Используем setUTCFullYear, setUTCMonth, setUTCDate для работы с UTC
  const date = new Date();
  date.setUTCFullYear(year, month - 1, day); // month - 1, так как месяцы в JS с 0 по 11
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const UniformModeForm = (
  { scheduleId, isEditing, setHasUnsavedChanges },
  ref
) => {
  const navigation = useNavigation();
  const [tabletCount, setTabletCount] = useState("1");
  const [tabletDosage, setTabletDosage] = useState("100");
  const [interval, setInterval] = useState("1");
  const [times, setTimes] = useState([new Date()]);
  const [dateRange, setDateRange] = useState({
    // Инициализируем startDate как дату без времени
    startDate: createDateWithoutTime(new Date().toISOString().split('T')[0]),
    endDate: null,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [tempTime, setTempTime] = useState(null);

  const scrollViewRef = useRef(null);

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

  const intervalOptions = [
    { label: "Каждый день", value: "1" },
    { label: "Через день", value: "2" },
    { label: "Через 2 дня", value: "3" },
    { label: "Через 3 дня", value: "4" }, // Добавлен новый интервал
    { label: "Через 4 дня", value: "5" }, // Добавлен новый интервал
    { label: "Через 5 дней", value: "6" }, // Добавлен новый интервал
    { label: "Через неделю", value: "7" },
  ];

  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      tabletCount,
      tabletDosage,
      interval, // Теперь interval будет числовым значением
      times,
      dateRange,
    }),
  }));

  useEffect(() => {
    if (isEditing) {
      const loadSchedule = async () => {
        try {
          const data = await getPlan(scheduleId, navigation);
          setTabletCount(data.singleDosageTablets?.toString() || "1");
          setTabletDosage(data.singleDosage?.toString() || "100");
          // Убедитесь, что interval устанавливается как string из числа
          setInterval(data.interval?.toString() || "1");
          setTimes(
            data.administrationTimes
              ? data.administrationTimes.map((timeStr) => new Date(timeStr))
              : [new Date()]
          );
          setDateRange({
            // Убедитесь, что даты из getPlan также обрабатываются как "даты без времени"
            startDate: data.startDate ? createDateWithoutTime(data.startDate.toISOString().split('T')[0]) : createDateWithoutTime(new Date().toISOString().split('T')[0]),
            endDate: data.endDate ? createDateWithoutTime(data.endDate.toISOString().split('T')[0]) : null,
          });

          const newMarkedDates = {};
          if (data.startDate && data.endDate) {
            // Используем createDateWithoutTime для итерации
            let currentDate = createDateWithoutTime(data.startDate.toISOString().split('T')[0]);
            const endDate = createDateWithoutTime(data.endDate.toISOString().split('T')[0]);

            while (currentDate.getTime() <= endDate.getTime()) {
              const dateString = currentDate.toISOString().split("T")[0];
              newMarkedDates[dateString] = {
                color: "#007AFF33",
                textColor: "#000",
                startingDay: currentDate.getTime() === createDateWithoutTime(data.startDate.toISOString().split('T')[0]).getTime(),
                endingDay: currentDate.getTime() === createDateWithoutTime(data.endDate.toISOString().split('T')[0]).getTime(),
              };
              // Прибавляем один день в UTC
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }
          setMarkedDates(newMarkedDates);
        } catch (err) {
          Alert.alert("Ошибка", err.message);
        }
      };
      loadSchedule();
    }
  }, [isEditing, scheduleId, navigation]);

  const handleDateRangeSelect = (day) => {
    // Используем createDateWithoutTime для создания выбранной даты
    const selectedDate = createDateWithoutTime(day.dateString);

    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      setDateRange({ startDate: selectedDate, endDate: null });
      setMarkedDates({
        [day.dateString]: {
          startingDay: true,
          color: "#007AFF",
          textColor: "#fff",
        },
      });
    } else if (dateRange.startDate && !dateRange.endDate) {
      const currentStartDate = createDateWithoutTime(dateRange.startDate.toISOString().split('T')[0]);

      if (selectedDate.getTime() >= currentStartDate.getTime()) {
        const newMarkedDates = {};
        let currentDate = new Date(currentStartDate); // Создаем копию для итерации
        currentDate.setUTCHours(0,0,0,0); // Убедимся, что это UTC

        while (currentDate.getTime() <= selectedDate.getTime()) {
          const dateString = currentDate.toISOString().split("T")[0];
          newMarkedDates[dateString] = {
            color: "#007AFF33",
            textColor: "#000",
            startingDay: currentDate.getTime() === currentStartDate.getTime(),
            endingDay: currentDate.getTime() === selectedDate.getTime(),
          };
          currentDate.setUTCDate(currentDate.getUTCDate() + 1); // Прибавляем день в UTC
        }
        setDateRange({ ...dateRange, endDate: selectedDate });
        setMarkedDates(newMarkedDates);
      } else {
        // Если выбранная дата раньше начальной, то делаем ее новой начальной
        setDateRange({ startDate: selectedDate, endDate: null });
        setMarkedDates({
          [day.dateString]: {
            startingDay: true,
            color: "#007AFF",
            textColor: "#fff",
          },
        });
      }
    }
    setHasUnsavedChanges(true);
  };

  const handleDosageChange = (newDosage) => {
    // Если выбрали "Своя дозировка", можно открыть поле для ввода
    if (newDosage === "custom") {
      Alert.prompt(
        "Своя дозировка",
        "Введите желаемую дозировку в мг:",
        [
          {
            text: "Отмена",
            style: "cancel",
          },
          {
            text: "ОК",
            onPress: (customValue) => {
              const parsedDosage = parseInt(customValue);
              if (!isNaN(parsedDosage) && parsedDosage > 0) {
                const currentTotalDose = parseInt(tabletCount) * parseInt(tabletDosage);
                const newTabletCount = Math.ceil(currentTotalDose / parsedDosage);
                setTabletDosage(parsedDosage.toString());
                setTabletCount(newTabletCount.toString());
                setHasUnsavedChanges(true);
              } else {
                Alert.alert("Ошибка", "Введите корректную дозировку.");
              }
            },
          },
        ],
        "plain-text",
        tabletDosage
      );
    } else {
      const parsedDosage = parseInt(newDosage);
      if (isNaN(parsedDosage) || parsedDosage <= 0) {
        Alert.alert("Ошибка", "Введите корректную дозировку");
        return;
      }
      const currentTotalDose = parseInt(tabletCount) * parseInt(tabletDosage);
      const newTabletCount = Math.ceil(currentTotalDose / parsedDosage);
      setTabletDosage(parsedDosage.toString());
      setTabletCount(newTabletCount.toString());
      setHasUnsavedChanges(true);
    }
  };

  const addTime = () => {
    if (times.length >= 9) {
      Alert.alert("Ошибка", "Максимальное количество приёмов в сутки — 9");
      return;
    }
    const newTime = new Date();
    setTimes([...times, newTime]);
    setHasUnsavedChanges(true);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const removeTime = (index) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
      setHasUnsavedChanges(true);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && selectedTime) {
        const newTimes = [...times];
        newTimes[currentTimeIndex] = selectedTime;
        setTimes(newTimes);
        setShowTimePicker(false);
        setTempTime(null);
        setHasUnsavedChanges(true);
      } else if (event.type === "dismissed") {
        setShowTimePicker(false);
        setTempTime(null);
      }
    } else {
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
  };

  const openTimePicker = (index) => {
    if (times[index]) {
      setCurrentTimeIndex(index);
      setTempTime(new Date(times[index]));
      setShowTimePicker(true);
    } else {
      Alert.alert("Ошибка", "Невозможно открыть выбор времени");
    }
  };

  const handleTimeConfirm = () => {
    if (tempTime) {
      const newTimes = [...times];
      newTimes[currentTimeIndex] = tempTime;
      setTimes(newTimes);
      setHasUnsavedChanges(true);
    }
    setShowTimePicker(false);
    setTempTime(null);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
    setTempTime(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator
        contentContainerStyle={{
          paddingBottom: 16,
        }}
      >
        <Text style={styles.scheduleFormScreen.label}>Количество таблеток</Text>
        <TextInput
          style={styles.common.input}
          value={tabletCount}
          onChangeText={(text) => {
            setTabletCount(text);
            setHasUnsavedChanges(true);
          }}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor="#666"
        />
        <Text style={styles.scheduleFormScreen.label}>
          Дозировка одной таблетки
        </Text>
        <CustomPicker
          value={tabletDosage}
          options={dosageOptions}
          onSelect={handleDosageChange}
        />
        <Text style={styles.scheduleFormScreen.label}>Интервал приёмов</Text>
        <CustomPicker
          value={interval}
          options={intervalOptions}
          onSelect={(value) => {
            setInterval(value);
            setHasUnsavedChanges(true);
          }}
        />
        <Text style={styles.scheduleFormScreen.label}>Период приёма</Text>
        <DateRangePicker
          dateRange={dateRange}
          markedDates={markedDates}
          onSelect={handleDateRangeSelect}
          formatDateRange={formatDateRange}
        />
        <Text style={styles.scheduleFormScreen.label}>Время приёма</Text>
        <TimeGrid
          times={times}
          onSelectTime={openTimePicker}
          onRemoveTime={removeTime}
          onAddTime={addTime}
          formatTime={formatTime}
        />
      </ScrollView>

      {Platform.OS === "ios" ? (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={handleTimeCancel}
        >
          <View style={styles.scheduleFormScreen.modalContainer}>
            <View style={[styles.scheduleFormScreen.modalContent, { alignItems: "center" }]}>
              <DateTimePicker
                value={tempTime || new Date()}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                locale="ru-RU"
                is24Hour
                textColor="black"
              />
              <TouchableOpacity
                style={styles.common.button}
                onPress={handleTimeConfirm}
              >
                <Text style={styles.common.buttonText}>Подтвердить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker &&
        tempTime && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            display="clock"
            onChange={handleTimeChange}
            locale="ru-RU"
            is24Hour
            textColor="black"
          />
        )
      )}
    </View>
  );
};

export default forwardRef(UniformModeForm);