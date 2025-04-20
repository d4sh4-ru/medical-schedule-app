import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import DatePicker from 'react-native-date-picker';
import { useTheme } from '../../utils/ThemeProvider';
import { MedicationContext } from '../../utils/MedicationContext';
import { createGlobalStyles } from '../../styles/globalStyles';
import { useRoute, useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

export default function ScheduleFormScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const { addMedication, updateMedication } = useContext(MedicationContext);
  const route = useRoute();
  const navigation = useNavigation();
  const medication = route.params?.medication;

  const isEditing = !!medication;

  const [name, setName] = useState(isEditing ? medication.name : '');
  const [tabletCount, setTabletCount] = useState(
    isEditing ? medication.tabletCount.toString() : '1'
  );
  const [tabletDosage, setTabletDosage] = useState(
    isEditing ? medication.tabletDosage.toString() : '100'
  );
  const [times, setTimes] = useState(
    isEditing ? medication.times.map((time) => new Date(time)) : [new Date()]
  );
  const [dateRange, setDateRange] = useState({
    startDate: isEditing && medication.startDate ? new Date(medication.startDate) : new Date(),
    endDate: isEditing && medication.endDate ? new Date(medication.endDate) : null,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDosagePicker, setShowDosagePicker] = useState(false);
  const [showCustomDosageModal, setShowCustomDosageModal] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [customDosage, setCustomDosage] = useState('');

  const dosageOptions = [
    { label: '10 мг', value: '10' },
    { label: '20 мг', value: '20' },
    { label: '50 мг', value: '50' },
    { label: '100 мг', value: '100' },
    { label: '200 мг', value: '200' },
    { label: '400 мг', value: '400' },
    { label: '500 мг', value: '500' },
    { label: '1000 мг', value: '1000' },
    { label: 'Своя дозировка', value: 'custom' },
  ];

  // Обработка выбора диапазона дат
  const handleDateRangeSelect = (day) => {
    const selectedDate = new Date(day.dateString);
    if (!dateRange.startDate || (dateRange.startDate && dateRange.endDate)) {
      setDateRange({ startDate: selectedDate, endDate: null });
      setMarkedDates({
        [day.dateString]: { startingDay: true, color: theme.colors.accent, textColor: '#ffffff' },
      });
    } else if (dateRange.startDate && !dateRange.endDate) {
      if (selectedDate >= dateRange.startDate) {
        const newMarkedDates = {};
        let currentDate = new Date(dateRange.startDate);
        while (currentDate <= selectedDate) {
          const dateString = currentDate.toISOString().split('T')[0];
          newMarkedDates[dateString] = {
            color: theme.colors.accent + '33',
            textColor: theme.colors.text,
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
          [day.dateString]: { startingDay: true, color: theme.colors.accent, textColor: '#ffffff' },
        });
      }
    }
  };

  // Пересчёт количества таблеток
  const handleDosageChange = (newDosage) => {
    if (newDosage === 'custom') {
      setShowDosagePicker(false);
      setShowCustomDosageModal(true);
      return;
    }
    const parsedDosage = parseInt(newDosage);
    if (isNaN(parsedDosage) || parsedDosage <= 0) {
      Alert.alert('Ошибка', 'Введите корректную дозировку');
      return;
    }
    const currentTotalDose = parseInt(tabletCount) * parseInt(tabletDosage);
    const newTabletCount = Math.ceil(currentTotalDose / parsedDosage);
    setTabletDosage(parsedDosage.toString());
    setTabletCount(newTabletCount.toString());
    setShowDosagePicker(false);
    setShowCustomDosageModal(false);
    setCustomDosage('');
  };

  // Подтверждение кастомной дозировки
  const handleCustomDosageSubmit = () => {
    const parsedDosage = parseInt(customDosage);
    if (isNaN(parsedDosage) || parsedDosage <= 0) {
      Alert.alert('Ошибка', 'Введите корректную дозировку');
      return;
    }
    handleDosageChange(customDosage);
  };

  // Добавление нового времени
  const addTime = () => {
    if (times.length >= 9) {
      Alert.alert('Ошибка', 'Максимальное количество приёмов в сутки — 9');
      return;
    }
    setTimes([...times, new Date()]);
  };

  // Изменение времени
  const handleTimeConfirm = (selectedTime) => {
    try {
      const newTimes = [...times];
      newTimes[currentTimeIndex] = selectedTime;
      setTimes(newTimes);
      setShowTimePicker(false);
    } catch (error) {
      console.error('DatePicker error:', error);
      Alert.alert('Ошибка', 'Не удалось выбрать время. Попробуйте снова.');
    }
  };

  // Отмена выбора времени
  const handleTimeCancel = () => {
    setShowTimePicker(false);
  };

  // Удаление времени
  const removeTime = (index) => {
    if (times.length > 1) {
      setTimes(times.filter((_, i) => i !== index));
    }
  };

  // Форматирование времени
  const formatTime = (time) => {
    return time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Форматирование периода
  const formatDateRange = () => {
    if (!dateRange.startDate) return 'Выберите период';
    if (!dateRange.endDate) return dateRange.startDate.toLocaleDateString('ru-RU');
    return `${dateRange.startDate.toLocaleDateString('ru-RU')} - ${dateRange.endDate.toLocaleDateString('ru-RU')}`;
  };

  // Подтверждение
  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название препарата');
      return;
    }
    if (!dateRange.startDate) {
      Alert.alert('Ошибка', 'Выберите дату начала');
      return;
    }
    const medicationData = {
      name,
      tabletCount: parseInt(tabletCount),
      tabletDosage: parseInt(tabletDosage),
      times,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      completed: isEditing ? medication.completed : false,
    };
    if (isEditing) {
      updateMedication(medication.id, medicationData);
      Alert.alert('Успех', 'Препарат обновлён');
    } else {
      addMedication(medicationData);
      Alert.alert('Успех', 'Препарат добавлен');
    }
    navigation.goBack();
  };

  // Кастомный Picker для дозировки
  const CustomPicker = ({ value, options, onSelect }) => {
    return (
      <View>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDosagePicker(true)}
        >
          <Text style={{ color: theme.colors.text }}>{value} мг</Text>
        </TouchableOpacity>
        <Modal
          visible={showDosagePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDosagePicker(false)}
        >
          <View style={[styles.modalContainer, { justifyContent: 'center', padding: 16 }]}>
            <View style={[styles.modalContent, { maxHeight: '60%', borderRadius: 12, padding: 16 }]}>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => onSelect(item.value)}
                  >
                    <Text style={{ color: theme.colors.text, fontSize: 16 }}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={[styles.markButton, { marginBottom: 16 }]}
                onPress={() => setShowDosagePicker(false)}
              >
                <Text style={styles.markButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          visible={showCustomDosageModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCustomDosageModal(false)}
        >
          <View style={[styles.modalContainer, { justifyContent: 'center', padding: 16 }]}>
            <View style={[styles.modalContent, { borderRadius: 12, padding: 16 }]}>
              <Text style={[styles.bodyText, { marginBottom: 8 }]}>Введите дозировку (мг)</Text>
              <TextInput
                style={styles.input}
                value={customDosage}
                onChangeText={(text) => setCustomDosage(text)}
                keyboardType="numeric"
                placeholder="Введите дозировку"
                placeholderTextColor={theme.colors.text + '66'}
                autoFocus={true}
              />
              <TouchableOpacity
                style={[styles.markButton, { marginTop: 8 }]}
                onPress={handleCustomDosageSubmit}
              >
                <Text style={styles.markButtonText}>Применить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.markButton, { marginTop: 8, marginBottom: 16 }]}
                onPress={() => {
                  setShowCustomDosageModal(false);
                  setCustomDosage('');
                }}
              >
                <Text style={styles.markButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  // Компонент для времени
  const TimeItem = ({ time, index }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignSelf: 'flex-start',
      }}
    >
      <TouchableOpacity
        style={{
          paddingVertical: 8,
          paddingHorizontal: 12,
        }}
        onPress={() => {
          setCurrentTimeIndex(index);
          setShowTimePicker(true);
        }}
      >
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>{formatTime(time)}</Text>
      </TouchableOpacity>
      {times.length > 1 && (
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => removeTime(index)}
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 6l12 12M18 6L6 18"
              stroke={theme.colors.error}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
      )}
    </View>
  );

  // Рендеринг сетки 3x3
  const renderTimes = () => {
    const rows = [];
    for (let row = 0; row < 3; row++) {
      const columns = [];
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        if (index < times.length) {
          columns.push(
            <View key={index} style={{ flex: 1, marginRight: col < 2 ? 8 : 0 }}>
              <TimeItem time={times[index]} index={index} />
            </View>
          );
        } else {
          columns.push(<View key={index} style={{ flex: 1, marginRight: col < 2 ? 8 : 0 }} />);
        }
      }
      rows.push(
        <View key={row} style={{ flexDirection: 'row', marginBottom: 4 }}>
          {columns}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.secondary }}>
      <ScrollView style={[styles.container, { paddingBottom: 80 }]}>
        <Text style={styles.title}>{isEditing ? 'Редактирование приёма' : 'Добавление приёма'}</Text>
        <Text style={styles.bodyText}>Название препарата</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Введите название"
          placeholderTextColor={theme.colors.text + '66'}
        />
        <Text style={styles.bodyText}>Количество таблеток</Text>
        <TextInput
          style={styles.input}
          value={tabletCount}
          onChangeText={setTabletCount}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor={theme.colors.text + '66'}
        />
        <Text style={styles.bodyText}>Дозировка одной таблетки (мг)</Text>
        <CustomPicker
          value={tabletDosage}
          options={dosageOptions}
          onSelect={handleDosageChange}
        />
        <Text style={styles.bodyText}>Период приёма</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDateRangePicker(true)}
        >
          <Text style={{ color: theme.colors.text }}>{formatDateRange()}</Text>
        </TouchableOpacity>
        <Modal
          visible={showDateRangePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDateRangePicker(false)}
        >
          <View style={[styles.modalContainer, { justifyContent: 'center', padding: 16 }]}>
            <View style={[styles.modalContent, { maxHeight: '50%', borderRadius: 12, padding: 16 }]}>
              <Calendar
                current={dateRange.startDate?.toISOString().split('T')[0]}
                markingType={'period'}
                markedDates={markedDates}
                onDayPress={handleDateRangeSelect}
                theme={{
                  calendarBackground: theme.colors.background,
                  textSectionTitleColor: theme.colors.text,
                  dayTextColor: theme.colors.text,
                  todayTextColor: theme.colors.primary,
                  selectedDayBackgroundColor: theme.colors.accent,
                  selectedDayTextColor: '#ffffff',
                  arrowColor: theme.colors.primary,
                  monthTextColor: theme.colors.text,
                }}
              />
              <TouchableOpacity
                style={[styles.markButton, { marginBottom: 16 }]}
                onPress={() => setShowDateRangePicker(false)}
              >
                <Text style={styles.markButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Text style={styles.bodyText}>Время приёма</Text>
        <View style={{ marginVertical: 4 }}>
          {renderTimes()}
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 20,
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 8,
            alignSelf: 'flex-start',
          }}
          onPress={addTime}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 5v14M5 12h14"
              stroke={theme.colors.background}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
        {showTimePicker && (
          <DatePicker
            date={times[currentTimeIndex]}
            mode="time"
            locale="ru-RU"
            onDateChange={handleTimeConfirm}
            confirmText="Подтвердить"
            cancelText="Отмена"
            onCancel={handleTimeCancel}
          />
        )}
      </ScrollView>
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.secondary,
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <TouchableOpacity
          style={[styles.markButton, { marginVertical: 0 }]}
          onPress={handleSubmit}
        >
          <Text style={styles.markButtonText}>Подтвердить</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}