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
    startDate: new Date(),
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
    { label: "Через неделю", value: "7" },
  ];

  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      tabletCount,
      tabletDosage,
      interval,
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
          setInterval(data.interval?.toString() || "1");
          setTimes(data.administrationTimes || [new Date()]);
          setDateRange({ startDate: data.startDate, endDate: data.endDate });
          const newMarkedDates = {};
          let currentDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);
          while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split("T")[0];
            newMarkedDates[dateString] = {
              color: "#007AFF33",
              textColor: "#000",
              startingDay: currentDate.getTime() === data.startDate.getTime(),
              endingDay: currentDate.getTime() === endDate.getTime(),
            };
            currentDate.setDate(currentDate.getDate() + 1);
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
    const selectedDate = new Date(day.dateString);
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
      if (selectedDate >= dateRange.startDate) {
        const newMarkedDates = {};
        let currentDate = new Date(dateRange.startDate);
        while (currentDate <= selectedDate) {
          const dateString = currentDate.toISOString().split("T")[0];
          newMarkedDates[dateString] = {
            color: "#007AFF33",
            textColor: "#000",
            startingDay: currentDate.getTime() === dateRange.startDate.getTime(),
            endingDay: currentDate.getTime() === selectedDate.getTime(),
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setDateRange({ ...dateRange, endDate: selectedDate });
        setMarkedDates(newMarkedDates);
      } else {
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
          Дозировка одной таблетки (мг)
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