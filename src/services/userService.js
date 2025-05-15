import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi, registerApi } from "../api/auth";
import log from "../utils/coloredLog";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import moment from "moment-timezone";
import { setTimeZone, registerDeviceToken } from "../api/userApi";
import messaging from "@react-native-firebase/messaging"; // для FCM
import Constants from "expo-constants";

// Выполняет вход, сохраняет токен
export const loginUser = async ({ email, password }) => {
  const data = await loginApi(email, password);
  if (!data.token)
    throw { code: "NO_TOKEN", message: "Не удалось получить токен" };
  await saveToken(data.token);
  return data;
};

// Регистрация
export const registerUser = async (userData) => {
  try {
    const data = await registerApi(userData);
    if (data.token) {
      await saveToken(data.token);
    }
    return data;
  } catch (error) {
    const errorResponse = error.response?.data || error;
    throw {
      code: errorResponse.code || "REGISTER_ERROR",
      message: errorResponse.message || "Ошибка регистрации",
    };
  }
};

// Сохранение токена
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem("jwt_token", token);
  } catch (error) {
    console.error("Ошибка сохранения токена:", error);
  }
};

// Получение токена
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem("jwt_token");
  } catch (error) {
    console.error("Ошибка получения токена:", error);
    return null;
  }
};

// Удаление токена
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("jwt_token");
  } catch (error) {
    console.error("Ошибка удаления токена:", error);
  }
};

// Очистка всех данных при выходе
export const clearLogout = async () => {
  try {
    await AsyncStorage.clear();
    console.log("AsyncStorage очищен");
  } catch (error) {
    console.error("Ошибка при очистке AsyncStorage:", error);
  }
};

export const syncDeviceInfo = async (navigation = null) => {
  try {
    const timeZone = moment.tz.guess();
    const cachedTimeZone = await AsyncStorage.getItem("timeZone");
    log.yellow("[Device Sync] Timezone:", timeZone);

    if (cachedTimeZone !== timeZone) {
      const { data: timeZoneData, error: timeZoneError } = await setTimeZone(timeZone, navigation);
      if (!timeZoneError) {
        await AsyncStorage.setItem("timeZone", timeZone);
      }
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const permissionResponse = await Notifications.requestPermissionsAsync();
      status = permissionResponse.status;
    }

    if (status !== "granted") {
      if (status === "denied" && navigation) {
        Alert.alert("Уведомления отключены", "...", [{ text: "Открыть настройки", onPress: () => Linking.openSettings() }]);
      }
      return;
    }

    const isExpoGo = Constants.appOwnership === "expo";
    log.yellow("[Device Sync] platform expo?:", isExpoGo);

    let deviceToken;
    if (isExpoGo) {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      deviceToken = tokenData.data;
    } else {
      await messaging().registerDeviceForRemoteMessages();
      deviceToken = await messaging().getToken();
    }

    log.yellow("[Device Sync] Device Token:", deviceToken);

    const cachedFcmToken = await AsyncStorage.getItem("fcmToken");
    if (cachedFcmToken !== deviceToken) {
      const deviceInfo = {
        deviceToken,
        deviceType: Device.osName || "web",
        appVersion: "unknown",
        platform: isExpoGo ? "expo" : "native",
      };

      const { data: tokenRegisterData, error: tokenRegisterError } =
        await registerDeviceToken(deviceInfo, navigation);

      if (!tokenRegisterError) {
        await AsyncStorage.setItem("fcmToken", deviceToken);
      }
    }
  } catch (error) {
    console.error("[Device Sync] Error:", error);
    if (navigation) {
      Alert.alert("Ошибка синхронизации", "Не удалось синхронизировать данные устройства", [{ text: "OK" }]);
    }
  }
};