import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useTranslation } from "@/hooks/useTranslation";
import { Ionicons } from "@expo/vector-icons";

type OnboardingThemeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OnboardingTheme"
>;

interface Props {
  navigation: OnboardingThemeScreenNavigationProp;
}

const OnboardingThemeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const { selectedTheme, setSelectedTheme, setCurrentStep } = useOnboardingStore();

  const themes = [
    {
      name: t("onboarding.exoTheme"),
      description: t("onboarding.exoDescription"),
      preview: ["#0a0d14", "#1e293b"],
      icon: "moon",
    },
    {
      name: t("onboarding.warmPastel"),
      description: t("onboarding.warmPastelDescription"),
      preview: ["#2b2a27", "#3a3834"],
      icon: "heart",
    },
    {
      name: t("onboarding.lightMode"),
      description: t("onboarding.lightModeDescription"),
      preview: ["#ffffff", "#f8fafc"],
      icon: "sunny",
    },
  ];

  const handleThemeSelect = async (themeName: string) => {
    await setSelectedTheme(themeName);
    // Apply the theme immediately
    const { setThemeName } = useThemeStore.getState();
    await setThemeName(themeName as "Exo Theme" | "Warm Pastel" | "Light Mode");
    await setCurrentStep(2);
    navigation.navigate("OnboardingImport");
  };

  const handleSkip = async () => {
    await setCurrentStep(2);
    navigation.navigate("OnboardingImport");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <LinearGradient colors={colors.gradients.background} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t("onboarding.chooseTheme")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              {t("onboarding.themeDescription")}
            </Text>
          </View>

          <View style={styles.themesContainer}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.name}
                style={[
                  styles.themeCard,
                  {
                    backgroundColor: colors.background.surface,
                    borderColor: selectedTheme === theme.name 
                      ? colors.border.focus 
                      : colors.border.light,
                    borderWidth: selectedTheme === theme.name ? 2 : 1,
                  },
                ]}
                onPress={() => handleThemeSelect(theme.name)}
              >
                <View style={styles.themePreview}>
                  <LinearGradient
                    colors={theme.preview as [string, string]}
                    style={styles.previewGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons 
                      name={theme.icon as any} 
                      size={24} 
                      color="#ffffff" 
                    />
                  </LinearGradient>
                </View>
                
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: colors.text.primary }]}>
                    {theme.name}
                  </Text>
                  <Text style={[styles.themeDescription, { color: colors.text.muted }]}>
                    {theme.description}
                  </Text>
                </View>

                {selectedTheme === theme.name && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={colors.text.accent} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: colors.border.light }]}
              onPress={handleSkip}
            >
                          <Text style={[styles.skipButtonText, { color: colors.text.muted }]}>
              {t("onboarding.skipForNow")}
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.footerText, { color: colors.text.muted }]}>
            {t("onboarding.canChangeLater")}
          </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 24,
  },
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
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 20,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default OnboardingThemeScreen;
