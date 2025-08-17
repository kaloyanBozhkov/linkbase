import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_ENABLED_KEY = "linkbase_notif_enabled";
const NOTIF_TIME_KEY = "linkbase_notif_time";

interface NotificationSettingsStore {
  enabled: boolean;
  time: string;
  isInitializing: boolean;
  // Actions
  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (time: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  clearSettings: () => Promise<void>;
}

export const useNotificationSettingsStore = create<NotificationSettingsStore>((set, get) => ({
  enabled: false,
  time: "22:00",
  isInitializing: true,
  
  loadSettings: async () => {
    try {
      const storedEnabled = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      const storedTime = await AsyncStorage.getItem(NOTIF_TIME_KEY);
      
      set({
        enabled: storedEnabled === "1",
        time: storedTime || "22:00",
        isInitializing: false,
      });
    } catch (error) {
      console.error("Error loading notification settings:", error);
      set({ isInitializing: false });
    }
  },

  setEnabled: async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(NOTIF_ENABLED_KEY, enabled ? "1" : "0");
      set({ enabled });
    } catch (error) {
      console.error("Error saving notification enabled state:", error);
    }
  },

  setTime: async (time: string) => {
    try {
      await AsyncStorage.setItem(NOTIF_TIME_KEY, time);
      set({ time });
    } catch (error) {
      console.error("Error saving notification time:", error);
    }
  },

  clearSettings: async () => {
    try {
      await AsyncStorage.removeItem(NOTIF_ENABLED_KEY);
      await AsyncStorage.removeItem(NOTIF_TIME_KEY);
      set({ enabled: false, time: "22:00" });
    } catch (error) {
      console.error("Error clearing notification settings:", error);
    }
  },
})); 