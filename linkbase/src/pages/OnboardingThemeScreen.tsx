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
import { ThemeId, useThemeStore } from "@/hooks/useThemeStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useTranslation } from "@/hooks/useTranslation";
import ThemeSelector from "@/components/molecules/ThemeSelector";

type OnboardingThemeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OnboardingTheme"
>;

interface Props {
  navigation: OnboardingThemeScreenNavigationProp;
}

const OnboardingThemeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, setThemeId } = useThemeStore();
  const { t } = useTranslation();
  const { selectedTheme, setSelectedTheme, setCurrentStep } =
    useOnboardingStore();



  const handleThemeSelect = async (themeId: string) => {
    // Apply the theme immediately for instant visual feedback
    await setThemeId(themeId as ThemeId);
    await setSelectedTheme(themeId);
  };

  const handleContinue = async () => {
    await setCurrentStep(2);
    navigation.navigate("OnboardingImport");
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text.primary }]}>
                {t("onboarding.chooseTheme")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.muted }]}>
                {t("onboarding.themeDescription")}
              </Text>
            </View>

            <ThemeSelector
              selectedThemeId={selectedTheme as ThemeId}
              onThemeSelect={handleThemeSelect}
              colors={colors}
              showDescriptions={true}
            />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                {
                  backgroundColor: colors.button.primary.background[0],
                  borderColor: colors.button.primary.background[0],
                },
              ]}
              onPress={handleContinue}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  { color: colors.button.primary.text },
                ]}
              >
                {t("onboarding.continue")}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.footerText, { color: colors.text.muted }]}>
              {t("onboarding.canChangeLater")}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 0,
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

  footer: {
    alignItems: "center",
    padding: 20,
    paddingTop: 20,
  },
  continueButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    minWidth: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
