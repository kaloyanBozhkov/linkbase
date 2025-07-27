import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { user } from "@linkbase/prisma";

const USER_ID_KEY = "linkbase_user_id_27-07-2025.6";
interface SessionUserStore {
  userId: string | null;
  isInitializing: boolean;
  isInitialLoading: boolean;
  // Actions
  saveUserId: (id: string) => Promise<void>;
  clearUserId: () => Promise<void>;
  getStoredUserId: () => Promise<string | null>;
  initializeUserId: (onInitialized: () => Promise<user["id"]>) => Promise<void>;
}

export const useSessionUserStore = create<SessionUserStore>((set, get) => ({
  userId: null,
  isInitializing: false,
  isInitialLoading: true,
  getStoredUserId: async (): Promise<string | null> => {
    try {
      const storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
      return storedUserId;
    } catch (error) {
      console.error("Error retrieving userId from AsyncStorage:", error);
      return null;
    }
  },
  saveUserId: async (id: string) => {
    try {
      await AsyncStorage.setItem(USER_ID_KEY, id);
      set({ userId: id });
    } catch (error) {
      console.error("Error saving userId to AsyncStorage:", error);
    }
  },
  clearUserId: async () => {
    try {
      await AsyncStorage.removeItem(USER_ID_KEY);
      set({ userId: null });
    } catch (error) {
      console.error("Error clearing userId from AsyncStorage:", error);
    }
  },
  initializeUserId: async (onInitialized: () => Promise<user["id"]>) => {
    try {
      set({ isInitializing: true });
      const storedUserId = await get().getStoredUserId();
      console.log("storedUserId", storedUserId);
      if (storedUserId) {
        set({
          userId: storedUserId,
          isInitializing: false,
          isInitialLoading: false,
        });
        return;
      }

      const userId = await onInitialized();
      if (!userId) return;
      set({ userId, isInitializing: false, isInitialLoading: false });
      await get().saveUserId(userId);
    } catch (error) {
      console.error("Error initializing userId from AsyncStorage:", error);
    }
  },
}));
