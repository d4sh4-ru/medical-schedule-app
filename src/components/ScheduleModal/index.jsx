import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import styles from '../../constants/globalStyles';
import { formatTime, formatDate } from '../../utils/dateUtils';

const ScheduleModal = ({
  visible,
  onClose,
  scheduleDetails,
  onEdit,
  onDelete,
  theme,
}) => {
  const renderTimeItem = ({ item }) => (
    <View style={styles.scheduleScreen.timeItem}>
      <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={theme.colors.primary} strokeWidth="2" />
        <Path d="M12 6v6l4 2" stroke={theme.colors.primary} strokeWidth="2" />
      </Svg>
      <Text style={styles.scheduleScreen.timeText}>{formatTime(item)}</Text>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.scheduleScreen.modalContainer}>
        <View style={[styles.scheduleScreen.modalContent, { backgroundColor: theme.colors.background }]}>
          {scheduleDetails ? (
            <>
              <Text style={[styles.scheduleScreen.modalTitle, { color: theme.colors.text }]}>
                {scheduleDetails.medicationTradeName}
              </Text>
              <Text style={[styles.scheduleScreen.modalText, { color: theme.colors.text }]}>
                Дозировка: {scheduleDetails.singleDosageTablets} табл. x{' '}
                {scheduleDetails.singleDosage}
              </Text>
              <View style={{ marginBottom: 8 }}>
                <Text style={[styles.scheduleScreen.modalText, { color: theme.colors.text }]}>
                  Время приёма:
                </Text>
                <FlatList
                  data={scheduleDetails.administrationTimes.split(',')}
                  renderItem={renderTimeItem}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
              <View style={styles.scheduleScreen.dateContainer}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v2H7v-2zm6 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
                    fill={theme.colors.primary}
                  />
                </Svg>
                <View style={{ marginLeft: 8 }}>
                  <Text style={[styles.scheduleScreen.dateText, { color: theme.colors.text }]}>
                    Начало: {formatDate(scheduleDetails.startDate)}
                  </Text>
                  <Text style={[styles.scheduleScreen.dateText, { color: theme.colors.text }]}>
                    Конец: {formatDate(scheduleDetails.endDate)}
                  </Text>
                </View>
              </View>
              <View style={styles.scheduleScreen.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.scheduleScreen.modalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={onEdit}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                        fill="#ffffff"
                      />
                    </Svg>
                    <Text style={styles.scheduleScreen.modalButtonText}>
                      Редактировать
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scheduleScreen.modalButton, { backgroundColor: theme.colors.error }]}
                  onPress={onDelete}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                        fill="#ffffff"
                      />
                    </Svg>
                    <Text style={styles.scheduleScreen.modalButtonText}>
                      Удалить
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.scheduleScreen.modalButton, { backgroundColor: '#000000', marginTop: 10 }]}
                onPress={onClose}
              >
                <Text style={styles.scheduleScreen.modalButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={[styles.scheduleScreen.modalText, { color: theme.colors.text }]}>
              Загрузка данных...
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ScheduleModal;