import React, { useState, useRef } from "react";
import { SafeAreaView, Modal, View, Text, TouchableOpacity } from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../../components/Header";
import AutocompleteInput from "../../components/AutocompleteInput";
import globalStyles from "../../constants/globalStyles";
import UniformModeForm from "../../components/UniformModeForm";
import CustomModeForm from "../../components/CustomModeForm";
import ConfirmButton from "../../components/ConfirmButton";
import Toast from "../../components/Toast"; // Импорт компонента Toast
import { searchMedications } from "../../api/medicationApi";
import { newUniformPlan, createCustomPlan } from "../../services/planService";

// Компонент экрана формы расписания
export default function ScheduleFormScreen() {
  const styles = globalStyles;
  const route = useRoute();
  const navigation = useNavigation();
  const scheduleId = route.params?.scheduleId;
  const isEditing = !!scheduleId;

  const [mode, setMode] = useState("uniform"); // "uniform" или "custom"
  const [showModeChangeAlert, setShowModeChangeAlert] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [toast, setToast] = useState(null); // Состояние для тоста

  const uniformFormRef = useRef(null);
  const customFormRef = useRef(null);

  // Проверка наличия несохраненных изменений в форме
  const hasFormChanges = () => {
    if (mode === "uniform") {
      const formData = uniformFormRef.current?.getFormData();
      if (!formData) return false;
      const { tabletCount, tabletDosage, interval, times, dateRange } = formData;
      return (
        tabletCount !== "1" ||
        tabletDosage !== "100" ||
        interval !== "1" ||
        times.length > 1 ||
        times[0].getTime() !== new Date().setHours(0, 0, 0, 0) ||
        dateRange.startDate.getTime() !== new Date().setHours(0, 0, 0, 0) ||
        dateRange.endDate !== null
      );
    } else {
      const formData = customFormRef.current?.getFormData();
      return formData && formData.length > 0;
    }
  };

  // Обработчик смены режима
  const handleModeChange = (newMode) => {
    const targetMode = newMode === 0 ? "uniform" : "custom";
    if (hasUnsavedChanges && hasFormChanges()) {
      setShowModeChangeAlert(true);
      return;
    }
    setMode(targetMode);
    setHasUnsavedChanges(false);
  };

  // Подтверждение смены режима
  const confirmModeChange = () => {
    setMode(showModeChangeAlert ? "custom" : "uniform");
    setShowModeChangeAlert(false);
    setHasUnsavedChanges(false);
    // Не сбрасываем medicationName, чтобы сохранить название лекарства
  };

  // Закрытие формы с проверкой несохраненных изменений
  const handleClose = () => {
    if (hasUnsavedChanges && hasFormChanges()) {
      setToast({
        message: "Есть несохраненные изменения. Закрыть без сохранения?",
        type: "error",
        buttons: [
          { text: "Отмена", onPress: () => setToast(null) },
          {
            text: "Закрыть",
            onPress: () => {
              setToast(null);
              navigation.goBack();
            },
          },
        ],
      });
    } else {
      navigation.goBack();
    }
  };

  // Обработка отправки формы
  const handleSubmit = async () => {
    if (!medicationName.trim()) {
      setToast({ message: "Введите название препарата", type: "error" });
      setTimeout(() => setToast(null), 3500);
      return;
    }

    if (mode === "uniform") {
      const formData = uniformFormRef.current?.getFormData();
      if (!formData) {
        setToast({ message: "Заполните все поля формы", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }
      const { tabletCount, tabletDosage, interval, times, dateRange } = formData;
      if (!dateRange.startDate) {
        setToast({ message: "Выберите дату начала", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }
      if (!dateRange.endDate) {
        setToast({ message: "Выберите дату окончания", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }
      if (
        !tabletCount ||
        isNaN(parseInt(tabletCount)) ||
        parseInt(tabletCount) <= 0
      ) {
        setToast({ message: "Введите корректное количество таблеток", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }
      if (
        !tabletDosage ||
        isNaN(parseInt(tabletDosage)) ||
        parseInt(tabletDosage) <= 0
      ) {
        setToast({ message: "Введите корректную дозировку", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }
      if (
        !interval ||
        isNaN(parseInt(interval)) ||
        parseInt(interval) <= 0
      ) {
        setToast({ message: "Введите корректный интервал", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }

      try {
        await newUniformPlan(
          {
            medicationTradeName: medicationName,
            type: "uniform",
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            singleDosage: tabletDosage,
            singleDosageTablets: parseInt(tabletCount),
            interval: parseInt(interval),
            administrationTimes: times,
          },
          isEditing,
          scheduleId,
          navigation
        );
        navigation.navigate("Schedule", { showToast: { message: "Приём успешно добавлен", type: "success" } });
      } catch (err) {
        setToast({ message: err.message, type: "error" });
        setTimeout(() => setToast(null), 3500);
      }
    } else {
      const formData = customFormRef.current?.getFormData();
      if (!formData || formData.length === 0) {
        setToast({ message: "Добавьте хотя бы одно напоминание", type: "error" });
        setTimeout(() => setToast(null), 3500);
        return;
      }

      try {
        await createCustomPlan(
          {
            medicationTradeName: medicationName,
            type: "custom",
            reminders: formData.map((r) => ({
              scheduledAt: r.scheduledAt,
              singleDosage: r.singleDosage + ' мг',
              singleDosageTablets: r.singleDosageTablets,
            })),
          },
          navigation
        );
        navigation.navigate("Schedule", { showToast: { message: "Приём успешно добавлен", type: "success" } });
      } catch (err) {
        setToast({ message: err.message, type: "error" });
        setTimeout(() => setToast(null), 3500);
      }
    }
  };

  return (
    <SafeAreaView style={styles.scheduleFormScreen.container}>
      <Header
        title={isEditing ? "Редактирование приёма" : "Добавление приёма"}
        leftIconName="close-outline"
        onLeftPress={handleClose}
      />
      <View style={styles.scheduleFormScreen.contentContainer}>
        <Text style={styles.scheduleFormScreen.label}>Название препарата</Text>
        <AutocompleteInput
          value={medicationName}
          onChangeText={setMedicationName}
          placeholder="Название препарата"
          navigation={navigation}
          style={styles.common.input}
          fetchData={searchMedications}
        />
        <SegmentedControl
          values={["Равномерный", "Индивидуальный"]}
          selectedIndex={mode === "uniform" ? 0 : 1}
          onChange={(event) =>
            handleModeChange(event.nativeEvent.selectedSegmentIndex)
          }
          style={{ marginHorizontal: 32 }}
          tintColor="#007AFF"
          backgroundColor="#F0F0F0"
          appearance="light"
          fontStyle={{ color: "gray" }}
          activeFontStyle={{ color: "white" }}
        />
        {mode === "uniform" ? (
          <UniformModeForm
            ref={uniformFormRef}
            scheduleId={scheduleId}
            isEditing={isEditing}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        ) : (
          <CustomModeForm
            ref={customFormRef}
            scheduleId={scheduleId}
            isEditing={isEditing}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        )}
        <ConfirmButton onPress={handleSubmit} />
      </View>

      {showModeChangeAlert && (
        <Modal visible transparent animationType="fade">
          <View style={styles.scheduleFormScreen.modalContainer}>
            <View style={styles.scheduleFormScreen.modalContent}>
              <Text style={styles.scheduleFormScreen.modalText}>
                Переключение режима приведет к потере всех введенных данных формы. Продолжить?
              </Text>
              <View style={styles.scheduleFormScreen.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.scheduleFormScreen.modalButton, { backgroundColor: "#d32f2f" }]}
                  onPress={() => setShowModeChangeAlert(false)}
                >
                  <Text style={styles.scheduleFormScreen.modalButtonText}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.scheduleFormScreen.modalButton, { backgroundColor: "#007AFF" }]}
                  onPress={confirmModeChange}
                >
                  <Text style={styles.scheduleFormScreen.modalButtonText}>
                    Продолжить
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {/* Рендеринг тоста */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={3000}
          onDismiss={() => setToast(null)}
        />
      )}
    </SafeAreaView>
  );
}