import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import Svg from "react-native-svg";
import styles from "../constants/globalStyles";
import { formatTime, formatDate } from "../utils/dateUtils";
import { Ionicons } from "@expo/vector-icons";

const ScheduleModal = ({
  visible,
  onClose,
  scheduleDetails,
  onEdit,
  onDelete,
}) => {
  const renderTimeItem = ({ item }) => (
    <View style={styles.scheduleScreen.timeItem}>
      <Ionicons name="time-outline" size={24} color={"#007AFF"} />
      <Text style={styles.scheduleScreen.timeText}>{item}</Text>
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.scheduleScreen.modalContainer}>
        <View style={styles.scheduleScreen.modalContent}>
          {scheduleDetails ? (
            <>
              <Text style={styles.scheduleScreen.modalTitle}>
                {scheduleDetails.medicationTradeName}
              </Text>
              <Text style={styles.scheduleScreen.modalText}>
                Дозировка: {scheduleDetails.singleDosageTablets} табл. x{" "}
                {scheduleDetails.singleDosage}
              </Text>
              {scheduleDetails.administrationTimes && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.scheduleScreen.modalText}>
                    Время приёма:
                  </Text>
                  <FlatList
                    data={
                      scheduleDetails.administrationTimes
                        ? scheduleDetails.administrationTimes.split(",")
                        : []
                    }
                    renderItem={renderTimeItem}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ maxHeight: 150 }}
                  />
                </View>
              )}
              <View style={styles.scheduleScreen.dateContainer}>
                <Ionicons name="calendar-outline" size={24} color={"#007AFF"} />
                <View style={{ marginLeft: 2 }}>
                  <Text style={styles.scheduleScreen.dateText}>
                    Начало: {formatDate(scheduleDetails.startDate)}
                  </Text>
                  <Text style={styles.scheduleScreen.dateText}>
                    Конец: {formatDate(scheduleDetails.endDate)}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.scheduleScreen.modalButtonContainer,
                  { paddingBottom: 10, marginTop: 20 },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.scheduleScreen.modalButton,
                    { backgroundColor: "#007AFF", flex: 1, marginRight: 10 },
                  ]}
                  onPress={onEdit}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Ionicons
                        name="create-outline"
                        size={24}
                        color="#ffffff"
                      />
                    </Svg>
                    <Text style={styles.scheduleScreen.modalButtonText}>
                      Редактировать
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.scheduleScreen.modalButton,
                    { backgroundColor: "#d32f2f", flex: 1, marginLeft: 10 },
                  ]}
                  onPress={onDelete}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <Ionicons
                        name="trash-outline"
                        size={24}
                        color="#ffffff"
                      />
                    </Svg>
                    <Text style={styles.scheduleScreen.modalButtonText}>
                      Удалить
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.scheduleScreen.modalButton,
                  { backgroundColor: "#888", minHeight: 48, marginBottom: 20 },
                ]}
                onPress={onClose}
              >
                <Text style={[styles.scheduleScreen.modalButtonText, {color: '#fff'}]}>
                  Закрыть
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.scheduleScreen.modalText}>
              Загрузка данных...
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ScheduleModal;
