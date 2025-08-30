import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { ThemeId } from "@/hooks/useThemeStore";
import { useTranslation } from "@/hooks/useTranslation";

interface ThemeOption {
  id: ThemeId;
  name: string;
  description: string;
  preview: [string, string];
  icon: string;
}

interface ThemeSelectorProps {
  selectedThemeId: ThemeId;
  onThemeSelect: (themeId: ThemeId) => void;
  colors: any; // ThemeColors type from useThemeStore
  showDescriptions?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedThemeId,
  onThemeSelect,
  colors,
  showDescriptions = true,
}) => {
  const { t } = useTranslation();

  const themes: ThemeOption[] = [
    {
      id: "exoTheme",
      name: t("onboarding.exoTheme"),
      description: t("onboarding.exoDescription"),
      preview: ["#0a0d14", "#1e293b"],
      icon: "moon",
    },
    {
      id: "warmPastel",
      name: t("onboarding.warmPastel"),
      description: t("onboarding.warmPastelDescription"),
      preview: ["#2b2a27", "#3a3834"],
      icon: "heart",
    },
    {
      id: "lightMode",
      name: t("onboarding.lightMode"),
      description: t("onboarding.lightModeDescription"),
      preview: ["#ffffff", "#f8fafc"],
      icon: "sunny-outline",
    },
  ];

  return (
    <View style={styles.themesContainer}>
      {themes.map((theme) => (
        <TouchableOpacity
          key={theme.id}
          style={[
            styles.themeCard,
            {
              backgroundColor: colors.background.surface,
              borderColor:
                selectedThemeId === theme.id
                  ? colors.border.focus
                  : colors.border.light,
              borderWidth: selectedThemeId === theme.id ? 2 : 1,
            },
          ]}
          onPress={() => onThemeSelect(theme.id)}
        >
          <View style={styles.themePreview}>
            <LinearGradient
              colors={theme.preview}
              style={styles.previewGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons
                name={theme.icon as any}
                size={24}
                color={
                  theme.preview[0] === "#ffffff" ? "#1e293b" : "#ffffff"
                }
              />
            </LinearGradient>
          </View>

          <View style={styles.themeInfo}>
            <Text
              style={[styles.themeName, { color: colors.text.primary }]}
            >
              {theme.name}
            </Text>
            {showDescriptions && (
              <Text
                style={[
                  styles.themeDescription,
                  { color: colors.text.muted },
                ]}
              >
                {theme.description}
              </Text>
            )}
            <Text
              style={[
                styles.themeStatus,
                { color: selectedThemeId === theme.id ? colors.text.accent : colors.text.muted },
              ]}
            >
              {selectedThemeId === theme.id ? t("appearance.selected") : t("appearance.tapToApply")}
            </Text>
          </View>

          {selectedThemeId === theme.id && (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.text.accent}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  themesContainer: {
    gap: 16,
    marginBottom: 40,
  },
  themeCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  themePreview: {
    marginRight: 16,
  },
  previewGradient: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  themeStatus: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ThemeSelector;
