import Constants from "expo-constants";

let impl;

if (Constants.appOwnership === "expo") {
  impl = require("./deviceToken.expo");
} else {
  impl = require("./deviceToken.native");
}

export const getDeviceToken = impl.getDeviceToken;
