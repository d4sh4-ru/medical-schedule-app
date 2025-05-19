import * as Notifications from "expo-notifications";

export const getDeviceToken = async () => {
  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
};
