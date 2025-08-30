import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Based on this can render only new features if already comlete with this old key
const ONBOARDING_KEY = "linkbase_onboarding_27-08-2025.01";

export interface OnboardingState {
  isCompleted: boolean;
  currentStep: number;
  selectedLanguage: string;
  selectedTheme: string;
  hasImportedData: boolean;
  isInitializing: boolean;
  setCompleted: (completed: boolean) => Promise<void>;
  setCurrentStep: (step: number) => Promise<void>;
  setSelectedLanguage: (language: string) => Promise<void>;
  setSelectedTheme: (theme: string) => Promise<void>;
  setHasImportedData: (imported: boolean) => Promise<void>;
  initializeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  isCompleted: false,
  currentStep: 0,
  selectedLanguage: "en",
  selectedTheme: "exoTheme",
  hasImportedData: false,
  isInitializing: true,
  
  initializeOnboarding: async () => {
    try {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (stored) {
        const onboardingData = JSON.parse(stored);
        set({
          isCompleted: onboardingData.isCompleted || false,
          currentStep: onboardingData.currentStep || 0,
          selectedLanguage: onboardingData.selectedLanguage || "en",
          selectedTheme: onboardingData.selectedTheme || "exoTheme",
          hasImportedData: onboardingData.hasImportedData || false,
          isInitializing: false,
        });
      } else {
        set({ 
          isCompleted: false,
          currentStep: 0,
          selectedLanguage: "en",
          selectedTheme: "exoTheme",
          hasImportedData: false,
          isInitializing: false 
        });
      }
    } catch (e) {
      console.error("Error initializing onboarding:", e);
      set({ isInitializing: false });
    }
  },

  setCompleted: async (completed: boolean) => {
    try {
      const currentData = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboardingData = currentData ? JSON.parse(currentData) : {};
      const newData = { ...onboardingData, isCompleted: completed };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newData));
      set({ isCompleted: completed });
    } catch (e) {
      console.error("Error saving onboarding completion:", e);
    }
  },

  setCurrentStep: async (step: number) => {
    try {
      const currentData = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboardingData = currentData ? JSON.parse(currentData) : {};
      const newData = { ...onboardingData, currentStep: step };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newData));
      set({ currentStep: step });
    } catch (e) {
      console.error("Error saving onboarding step:", e);
    }
  },

  setSelectedLanguage: async (language: string) => {
    try {
      const currentData = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboardingData = currentData ? JSON.parse(currentData) : {};
      const newData = { ...onboardingData, selectedLanguage: language };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newData));
      set({ selectedLanguage: language });
    } catch (e) {
      console.error("Error saving selected language:", e);
    }
  },

  setSelectedTheme: async (theme: string) => {
    try {
      const currentData = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboardingData = currentData ? JSON.parse(currentData) : {};
      const newData = { ...onboardingData, selectedTheme: theme };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newData));
      set({ selectedTheme: theme });
    } catch (e) {
      console.error("Error saving selected theme:", e);
    }
  },

  setHasImportedData: async (imported: boolean) => {
    try {
      const currentData = await AsyncStorage.getItem(ONBOARDING_KEY);
      const onboardingData = currentData ? JSON.parse(currentData) : {};
      const newData = { ...onboardingData, hasImportedData: imported };
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(newData));
      set({ hasImportedData: imported });
    } catch (e) {
      console.error("Error saving import status:", e);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      set({
        isCompleted: false,
        currentStep: 0,
        selectedLanguage: "en",
        selectedTheme: "Exo Theme",
        hasImportedData: false,
      });
    } catch (e) {
      console.error("Error resetting onboarding:", e);
    }
  },
}));
