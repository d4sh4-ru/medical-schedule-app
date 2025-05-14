import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  Platform,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation } from "@react-navigation/native";
import styles from "../../constants/globalStyles";
import AutocompleteInput from "../../components/AutocompleteInput";
import CustomPicker from "../../components/CustomPicker";
import TimeGrid from "../../components/TimeGrid";
import DateRangePicker from "../../components/DateRangePicker";
import ConfirmButton from "../../components/ConfirmButton";
import {
  formatTime,
  formatDateRange,
} from "../../utils/scheduleUtils";
import { getPlan, newUniformPlan } from "../../services/planService";
import { searchMedications } from "../../api/medicationApi";
import Header from "../../components/Header";

export default function ScheduleFormScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const scheduleId = route.params?.scheduleId;
  const isEditing = !!scheduleId;

  const [name, setName] = useState("");
  const [tabletCount, setTabletCount] = useState("1");
  const [tabletDosage, setTabletDosage] = useState("100");
  const [times, setTimes] = useState([new Date()]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: null,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [tempTime, setTempTime] = useState(null);

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

  useEffect(() => {
    if (isEditing) {
      const loadSchedule = async () => {
        try {
          const data = await getPlan(scheduleId, navigation);
          setName(data.medicationTradeName);
          setTabletCount(data.singleDosageTablets);
          setTabletDosage(data.singleDosage);
          setTimes(data.administrationTimes);
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
            startingDay:
              currentDate.getTime() === dateRange.startDate.getTime(),
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
  };

  const addTime = () => {
    if (times.length >= 9) {
      Alert.alert("Ошибка", "Максимальное количество приёмов в сутки — 9");
      return;
    }
    const newTime = new Date();
    setTimes([...times, newTime]);
  };

  const removeTime = (index) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    console.log(
      "handleTimeChange event:",
      event,
      "selectedTime:",
      selectedTime
    );
    if (Platform.OS === "android") {
      if (event.type === "set" && selectedTime) {
        // Android: кнопка "ОК"
        const newTimes = [...times];
        newTimes[currentTimeIndex] = selectedTime;
        setTimes(newTimes);
        setShowTimePicker(false);
        setTempTime(null);
      } else if (event.type === "dismissed") {
        // Android: кнопка "Отмена"
        setShowTimePicker(false);
        setTempTime(null);
      }
    } else {
      // iOS
      if (selectedTime) {
        setTempTime(selectedTime);
      }
    }
  };

  const openTimePicker = (index) => {
    console.log("Opening time picker for index:", index, "times:", times);
    if (times[index]) {
      setCurrentTimeIndex(index);
      setTempTime(new Date(times[index])); // Копия времени
      setShowTimePicker(true);
    } else {
      console.error("Invalid time at index:", index);
      Alert.alert("Ошибка", "Невозможно открыть выбор времени");
    }
  };

  const handleTimeConfirm = () => {
    if (tempTime) {
      const newTimes = [...times];
      newTimes[currentTimeIndex] = tempTime;
      setTimes(newTimes);
    }
    setShowTimePicker(false);
    setTempTime(null);
  };

  const handleTimeCancel = () => {
    setShowTimePicker(false);
    setTempTime(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Ошибка", "Введите название препарата");
      return;
    }
    if (!dateRange.startDate) {
      Alert.alert("Ошибка", "Выберите дату начала");
      return;
    }
    if (!dateRange.endDate) {
      Alert.alert("Ошибка", "Выберите дату окончания");
      return;
    }
    if (
      !tabletCount ||
      isNaN(parseInt(tabletCount)) ||
      parseInt(tabletCount) <= 0
    ) {
      Alert.alert("Ошибка", "Введите корректное количество таблеток");
      return;
    }
    if (
      !tabletDosage ||
      isNaN(parseInt(tabletDosage)) ||
      parseInt(tabletDosage) <= 0
    ) {
      Alert.alert("Ошибка", "Введите корректную дозировку");
      return;
    }

    try {
      const result = await newUniformPlan(
        {
          medicationTradeName: name,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          singleDosage: tabletDosage,
          singleDosageTablets: tabletCount,
          administrationTimes: times,
        },
        isEditing,
        scheduleId,
        navigation
      );
      Alert.alert("Успех", result.message);
      navigation.goBack();
    } catch (err) {
      Alert.alert("Ошибка", err.message);
    }
  };

  return (
    <SafeAreaView style={styles.scheduleFormScreen.container}>
      <Header
        title={isEditing ? "Редактирование приёма" : "Добавление приёма"}
        leftIconName="close-outline"
        onLeftPress={() => navigation.goBack()}
      />
      <View style={styles.scheduleFormScreen.contentContainer}>
        <Text style={styles.scheduleFormScreen.label}>Название препарата</Text>
        <AutocompleteInput
          value={name}
          onChangeText={setName}
          placeholder="Название препарата"
          navigation={navigation}
          style={styles.common.input}
          fetchData={searchMedications}
        />
        <Text style={styles.scheduleFormScreen.label}>Количество таблеток</Text>
        <TextInput
          style={styles.common.input}
          value={tabletCount}
          onChangeText={setTabletCount}
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
          onSelectTime={(index) => {
            setCurrentTimeIndex(index);
            setTempTime(times[index]);
            setShowTimePicker(true);
          }}
          onRemoveTime={removeTime}
          onAddTime={addTime}
          formatTime={formatTime}
        />

        {/* Модальное или не очень окно для выбора времени приёма */}
        {Platform.OS === "ios" ? (
          <Modal
            visible={showTimePicker}
            transparent
            animationType="slide"
            onRequestClose={handleTimeCancel}
          >
            <View style={styles.scheduleFormScreen.modalContainer}>
              <View style={[styles.scheduleFormScreen.modalContent, { alignItems: 'center' }]}>
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

        <ConfirmButton onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
}
