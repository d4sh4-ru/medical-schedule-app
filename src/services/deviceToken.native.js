import messaging from "@react-native-firebase/messaging";

export const getDeviceToken = async () => {
  await messaging().registerDeviceForRemoteMessages();
  return await messaging().getToken();
};
