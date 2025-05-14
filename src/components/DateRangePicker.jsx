import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styles from '../constants/globalStyles';

const DateRangePicker = ({ dateRange, markedDates, onSelect, formatDateRange }) => {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.dateRangePicker.triggerButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateRangePicker.triggerText}>{formatDateRange(dateRange)}</Text>
      </TouchableOpacity>
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.scheduleFormScreen.modalContainer}>
          <View style={styles.scheduleFormScreen.modalContent}>
            <Calendar
              current={dateRange.startDate?.toISOString().split('T')[0]}
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={onSelect}
              theme={{
                calendarBackground: '#fff',
                textSectionTitleColor: '#000',
                dayTextColor: '#000',
                todayTextColor: '#007AFF',
                selectedDayBackgroundColor: '#007AFF',
                selectedDayTextColor: '#fff',
                arrowColor: '#007AFF',
                monthTextColor: '#000',
              }}
            />
            <TouchableOpacity
              style={styles.common.button}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.common.buttonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DateRangePicker;