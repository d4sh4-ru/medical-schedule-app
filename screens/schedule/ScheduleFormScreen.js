import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../utils/ThemeProvider';
import { createGlobalStyles } from '../../styles/globalStyles';
import { useRoute, useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { fetchWithAuth } from '../../utils/api';

export default function ScheduleFormScreen() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const route = useRoute();
  const navigation = useNavigation();
  const scheduleId = route.params?.scheduleId;

  const isEditing = !!scheduleId;

  const [name, setName] = useState('');
  const [tabletCount, setTabletCount] = useState('1');
  const [tabletDosage, setTabletDosage] = useState('100');
  const [times, setTimes] = useState([new Date()]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: null,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDosagePicker, setShowDosagePicker] = useState(false);
  const [showCustomDosageModal, setShowCustomDosageModal] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [markedDates, setMarkedDates] = useState({});
  const [customDosage, setCustomDosage] = useState('');
  const [administrationMethodId, setAdministrationMethodId] = useState(null);
  const [tempTime, setTempTime] = useState(null);

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

  // Загрузка данных для редактирования
  useEffect(() => {
    if (isEditing) {
      fetchScheduleDetails(scheduleId);
    }
  }, [scheduleId]);

  const fetchScheduleDetails = async (scheduleId) => {
    try {
      const response = await fetchWithAuth(
        `http://cloud-ru-test.netbird.cloud:8080/api/schedule/${scheduleId}`,
        { method: 'GET' },
        navigation
      );
      const data = await response.json();
      setName(data.medicationTradeName);
      setTabletCount(data.administrationMethod.singleDosageTablets.toString());
      setTabletDosage(parseInt(data.administrationMethod.singleDosage).toString());
      setTimes(
        data.administrationMethod.administrationTimes.split(',').map((time) => {
          const [hours, minutes] = time.split(':').map(Number);
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return date;
        })
      );
      setDateRange({
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
      setAdministrationMethodId(data.administrationMethod.id);
      // Пометим даты в календаре
      const newMarkedDates = {};
      let currentDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        newMarkedDates[dateString] = {
          color: theme.colors.accent + '33',
          textColor: theme.colors.text,
          startingDay: currentDate.getTime() === new Date(data.startDate).getTime(),
          endingDay: currentDate.getTime() === endDate.getTime(),
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      setMarkedDates(newMarkedDates);
    } catch (err) {
      console.error('Error fetching schedule details:', err);
      Alert.alert('Ошибка', 'Не удалось загрузить данные приёма');
    }
  };

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
    const newTime = new Date();
    setTimes([...times, newTime]);
  };

  // Изменение времени
  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      setTempTime(selectedTime);
    }
    // На iOS событие 'dismissed' может срабатывать при прокрутке спиннера, игнорируем его
    if (event.type === 'dismissed' && Platform.OS === 'ios') {
      return;
    }
    // На Android 'dismissed' срабатывает при отмене, но мы хотим закрывать только по кнопке "Закрыть"
    if (event.type === 'dismissed' && Platform.OS === 'android') {
      return;
    }
  };

  // Подтверждение времени
  const handleTimeConfirm = () => {
    if (tempTime) {
      const newTimes = [...times];
      newTimes[currentTimeIndex] = tempTime;
      setTimes(newTimes);
    }
    setShowTimePicker(false);
    setTempTime(null);
  };

  // Отмена выбора времени
  const handleTimeCancel = () => {
    setShowTimePicker(false);
    setTempTime(null);
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

  // Форматирование даты для API
  const formatDateForApi = (date) => {
    if (!date) return null;
    const offset = '+03:00';
    return `${date.toISOString().split('T')[0]}T00:00:00${offset}`;
  };

  // Форматирование времён для API
  const formatTimesForApi = (timesArray) => {
    return timesArray
      .map((time) => time.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }))
      .join(',');
  };

  // Подтверждение
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название препарата');
      return;
    }
    if (!dateRange.startDate) {
      Alert.alert('Ошибка', 'Выберите дату начала');
      return;
    }
    if (!dateRange.endDate) {
      Alert.alert('Ошибка', 'Выберите дату окончания');
      return;
    }

    const medicationData = {
      medicationTradeName: name,
      startDate: formatDateForApi(dateRange.startDate),
      endDate: formatDateForApi(dateRange.endDate),
      administrationMethod: {
        medicationTradeName: name,
        singleDosage: `${parseInt(tabletDosage)} мг`,
        singleDosageTablets: parseInt(tabletCount),
        interval: 1,
        administrationTimes: formatTimesForApi(times),
      },
    };

    if (isEditing) {
      if (!administrationMethodId) {
        Alert.alert('Ошибка', 'Не удалось определить ID метода приёма');
        return;
      }
      medicationData.id = scheduleId;
      medicationData.administrationMethod.id = administrationMethodId;
      medicationData.administrationMethodID = 0;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const response = await fetchWithAuth(
        'http://cloud-ru-test.netbird.cloud:8080/api/schedule',
        {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(medicationData),
        },
        navigation
      );
      const data = await response.json();
      Alert.alert('Успех', isEditing ? 'Препарат обновлён' : 'Препарат добавлен');
      navigation.goBack();
    } catch (err) {
      console.error('Error submitting schedule:', err);
      Alert.alert('Ошибка', 'Не удалось сохранить данные приёма');
    }
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
          console.log('Opening time picker for index:', index, 'times:', times);
          if (times[index]) {
            setCurrentTimeIndex(index);
            setTempTime(times[index]);
            setShowTimePicker(true);
          } else {
            console.error('Invalid time at index:', index);
            Alert.alert('Ошибка', 'Невозможно открыть выбор времени');
          }
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
      </ScrollView>
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={[styles.modalContainer, { justifyContent: 'center', padding: 16 }]}>
          <View style={[styles.modalContent, { borderRadius: 12, padding: 16, alignItems: 'center', backgroundColor: '#ffffff' }]}>
            {tempTime ? (
              <DateTimePicker
                value={tempTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
                onChange={handleTimeChange}
                locale="ru-RU"
                is24Hour={true}
                textColor="black"
                style={Platform.OS === 'android' ? { color: 'black' } : {}}
              />
            ) : (
              <Text style={styles.bodyText}>Ошибка: время не определено</Text>
            )}
            <TouchableOpacity
              style={[styles.markButton, { marginTop: 16 }]}
              onPress={handleTimeConfirm}
            >
              <Text style={styles.markButtonText}>Подтвердить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.markButton, { marginTop: 8 }]}
              onPress={handleTimeCancel}
            >
              <Text style={styles.markButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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