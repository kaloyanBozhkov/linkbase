import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore: expo-store-review is a native module provided by Expo
import * as StoreReview from "expo-store-review";

const RATE_APP_KEY = "rateAppPrompt";
const RATED_VALUE = "sent";
const ENABLED_VALUE = "must-send";

export const enableRateApp = async () => {
  const flag = await AsyncStorage.getItem(RATE_APP_KEY);
  if (flag === RATED_VALUE) return false; // Already rated
  if (flag !== ENABLED_VALUE) {
    await AsyncStorage.setItem(RATE_APP_KEY, ENABLED_VALUE);
    return true;
  }
  return false;
};

export const rateApp = async () => {
  const flag = await AsyncStorage.getItem(RATE_APP_KEY);
  if (flag === RATED_VALUE) return false; // Already rated
  if (flag === ENABLED_VALUE) {
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
    }
    await AsyncStorage.setItem(RATE_APP_KEY, RATED_VALUE);
    return true;
  }
  return false;
};
