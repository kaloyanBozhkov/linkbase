import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_KEY = "linkbase_theme_27-07-2025.6";

export type ThemeName = "Exo Theme" | "Warm Pastel" | "Light Mode";

export interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    surface: string;
    accent: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    disabled: string;
    accent: string;
    error: string;
    onAccent: string;
  };
  border: {
    default: string;
    light: string;
    focus: string;
    error: string;
  };
  gradients: {
    primary: [string, string];
    background: [string, string];
    section: [string, string];
    dark: [string, string];
  };
  button: {
    primary: { background: [string, string]; text: string; shadow: string };
    secondary: { background: string; border: string; text: string };
    danger: { background: string; text: string; shadow: string };
    ghost: { background: string; border: string; text: string };
  };
  input: {
    background: string;
    border: string;
    borderFocus: string;
    borderError: string;
    text: string;
    placeholder: string;
    label: string;
  };
}

const exoTheme: ThemeColors = {
  background: {
    primary: "#0a0d14",
    secondary: "#1e293b",
    tertiary: "#334155",
    surface: "#0f172a",
    accent: "#00f5ff",
  },
  text: {
    primary: "#e2e8f0",
    secondary: "#cbd5e1",
    muted: "#64748b",
    disabled: "#475569",
    accent: "#00f5ff",
    error: "#dc2626",
    onAccent: "#0a0d14",
  },
  border: {
    default: "#475569",
    light: "#334155",
    focus: "#00f5ff",
    error: "#dc2626",
  },
  gradients: {
    primary: ["#00f5ff", "#bf00ff"],
    background: ["#0a0d14", "#1e293b"],
    section: ["#1e293b", "#334155"],
    dark: ["#0f172a", "#1e293b"],
  },
  button: {
    primary: { background: ["#00f5ff", "#bf00ff"], text: "#0a0d14", shadow: "#00f5ff" },
    secondary: { background: "#334155", border: "#475569", text: "#e2e8f0" },
    danger: { background: "#dc2626", text: "#ffffff", shadow: "#dc2626" },
    ghost: { background: "transparent", border: "#00f5ff", text: "#00f5ff" },
  },
  input: {
    background: "#1e293b",
    border: "#475569",
    borderFocus: "#00f5ff",
    borderError: "#dc2626",
    text: "#e2e8f0",
    placeholder: "#64748b",
    label: "#e2e8f0",
  },
};

const warmPastelTheme: ThemeColors = {
  background: {
    primary: "#2b2a27",
    secondary: "#3a3834",
    tertiary: "#4a4741",
    surface: "#34322e",
    accent: "#f4bfbf", // warm pink
  },
  text: {
    primary: "#f7f2ea",
    secondary: "#e8dfd1",
    muted: "#b6a99b",
    disabled: "#8b8176",
    accent: "#f4bfbf",
    error: "#ef4444",
    onAccent: "#3a2f2f",
  },
  border: {
    default: "#6b6258",
    light: "#595247",
    focus: "#f4bfbf",
    error: "#ef4444",
  },
  gradients: {
    primary: ["#f4bfbf", "#ffd6a5"], // pink to peach
    background: ["#2b2a27", "#3a3834"],
    section: ["#3a3834", "#4a4741"],
    dark: ["#34322e", "#3a3834"],
  },
  button: {
    primary: { background: ["#f4bfbf", "#ffd6a5"], text: "#3a2f2f", shadow: "#f4bfbf" },
    secondary: { background: "#4a4741", border: "#6b6258", text: "#f7f2ea" },
    danger: { background: "#ef4444", text: "#ffffff", shadow: "#ef4444" },
    ghost: { background: "transparent", border: "#f4bfbf", text: "#f4bfbf" },
  },
  input: {
    background: "#3a3834",
    border: "#6b6258",
    borderFocus: "#f4bfbf",
    borderError: "#ef4444",
    text: "#f7f2ea",
    placeholder: "#b6a99b",
    label: "#f7f2ea",
  },
};

const lightModeTheme: ThemeColors = {
  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    tertiary: "#f1f5f9",
    surface: "#ffffff",
    accent: "#2563eb",
  },
  text: {
    primary: "#0f172a",
    secondary: "#334155",
    muted: "#64748b",
    disabled: "#94a3b8",
    accent: "#2563eb",
    error: "#dc2626",
    onAccent: "#ffffff",
  },
  border: {
    default: "#e2e8f0",
    light: "#e5e7eb",
    focus: "#2563eb",
    error: "#dc2626",
  },
  gradients: {
    primary: ["#60a5fa", "#a78bfa"],
    background: ["#ffffff", "#f8fafc"],
    section: ["#f8fafc", "#f1f5f9"],
    dark: ["#ffffff", "#f8fafc"],
  },
  button: {
    primary: { background: ["#60a5fa", "#a78bfa"], text: "#ffffff", shadow: "#60a5fa" },
    secondary: { background: "#f1f5f9", border: "#e2e8f0", text: "#0f172a" },
    danger: { background: "#dc2626", text: "#ffffff", shadow: "#dc2626" },
    ghost: { background: "transparent", border: "#2563eb", text: "#2563eb" },
  },
  input: {
    background: "#f8fafc",
    border: "#e2e8f0",
    borderFocus: "#2563eb",
    borderError: "#dc2626",
    text: "#0f172a",
    placeholder: "#64748b",
    label: "#0f172a",
  },
};

const themeNameToColors: Record<ThemeName, ThemeColors> = {
  "Exo Theme": exoTheme,
  "Warm Pastel": warmPastelTheme,
  "Light Mode": lightModeTheme,
};

interface ThemeStoreState {
  themeName: ThemeName;
  colors: ThemeColors;
  isInitializing: boolean;
  setThemeName: (name: ThemeName) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStoreState>((set) => ({
  themeName: "Exo Theme",
  colors: themeNameToColors["Exo Theme"],
  isInitializing: true,
  initializeTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      const name = (stored as ThemeName | null) || "Exo Theme";
      set({ themeName: name, colors: themeNameToColors[name], isInitializing: false });
    } catch (e) {
      set({ isInitializing: false });
    }
  },
  setThemeName: async (name: ThemeName) => {
    await AsyncStorage.setItem(THEME_KEY, name);
    set({ themeName: name, colors: themeNameToColors[name] });
  },
}));

