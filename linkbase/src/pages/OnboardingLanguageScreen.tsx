import React, { useEffect } from "react";
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

type OnboardingLanguageScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OnboardingLanguage"
>;

interface Props {
  navigation: OnboardingLanguageScreenNavigationProp;
}

const OnboardingLanguageScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const { t, changeLanguage } = useTranslation();
  const {
    selectedLanguage,
    setSelectedLanguage,
    setCurrentStep,
    isInitializing,
  } = useOnboardingStore();



  // Initialize the language when component mounts
  useEffect(
    () => {
      if (!isInitializing && selectedLanguage) {
        // Apply the stored language immediately when component loads
        changeLanguage(selectedLanguage as any);
      }
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    []
  );

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "zh-CN", name: "中文 (简体)", flag: "🇨🇳" },
    { code: "zh-TW", name: "中文 (繁體)", flag: "🇹🇼" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "bg", name: "Български", flag: "🇧🇬" },
    { code: "ro", name: "Română", flag: "🇷🇴" },
    { code: "el", name: "Ελληνικά", flag: "🇬🇷" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  ];

  const handleLanguageSelect = async (languageCode: string) => {
    // Apply the language change immediately first for instant visual feedback
    await changeLanguage(languageCode as any);
    await setSelectedLanguage(languageCode);
    await setCurrentStep(1);
    navigation.navigate("OnboardingTheme");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              {t("onboarding.welcome")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              {t("onboarding.chooseLanguage")}
            </Text>
          </View>

          <View style={styles.languagesContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageCard,
                  {
                    backgroundColor: colors.background.surface,
                    borderColor:
                      selectedLanguage === language.code
                        ? colors.border.focus
                        : colors.border.light,
                    borderWidth: selectedLanguage === language.code ? 2 : 1,
                  },
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <View style={styles.languageContent}>
                  <Text style={styles.flag}>{language.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text
                      style={[
                        styles.languageName,
                        { color: colors.text.primary },
                      ]}
                    >
                      {language.name}
                    </Text>
                  </View>
                  {selectedLanguage === language.code && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.text.accent}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
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
  languagesContainer: {
    gap: 12,
    marginBottom: 40,
  },
  languageCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default OnboardingLanguageScreen;
