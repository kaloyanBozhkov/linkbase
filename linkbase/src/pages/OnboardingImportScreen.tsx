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

type OnboardingImportScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "OnboardingImport"
>;

interface Props {
  navigation: OnboardingImportScreenNavigationProp;
}

const OnboardingImportScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const { setHasImportedData, setCompleted } = useOnboardingStore();



  const handleImportData = async () => {
    await setHasImportedData(true);
    navigation.navigate("ImportExport");
  };

  const handleGetStarted = async () => {
    await setHasImportedData(false);
    await setCompleted(true);
    navigation.navigate("Home");
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
              {t("onboarding.getStarted")}
            </Text>
            <Text
              style={[
                styles.mainButtonDescription,
                { color: colors.button.primary.text },
              ]}
            >
              {t("onboarding.startFreshDescription")}
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.muted }]}>
              {t("onboarding.enjoy")}
            </Text>
          </View>

          <View style={styles.optionalSection}>
            <Text style={[styles.optionalTitle, { color: colors.text.muted }]}>
              {t("onboarding.optionalImport")}
            </Text>
            <TouchableOpacity
              style={[
                styles.importButton,
                {
                  backgroundColor: colors.background.surface,
                  borderColor: colors.border.light,
                },
              ]}
              onPress={handleImportData}
            >
              <View style={styles.optionIcon}>
                <Ionicons
                  name="cloud-upload"
                  size={24}
                  color={colors.text.accent}
                />
              </View>
              <Text
                style={[styles.optionTitle, { color: colors.text.primary }]}
              >
                {t("onboarding.importFromJson")}
              </Text>
              <Text
                style={[styles.optionDescription, { color: colors.text.muted }]}
              >
                {t("onboarding.importDescription")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.text.accent}
              />
              <Text style={[styles.infoText, { color: colors.text.muted }]}>
                {t("onboarding.importAnytime")}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Get Started button at bottom */}
        <View style={styles.fixedFooter}>
          <TouchableOpacity
            style={[
              styles.getStartedButton,
              {
                backgroundColor: colors.button.primary.background[0],
                borderColor: colors.button.primary.background[0],
              },
            ]}
            onPress={handleGetStarted}
          >
            <Text
              style={[
                styles.getStartedButtonText,
                { color: colors.button.primary.text },
              ]}
            >
              {t("onboarding.getStarted")}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 100, // Add padding to account for fixed footer
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
  mainButtonContainer: {
    marginBottom: 40,
  },
  mainButton: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 120,
  },
  mainButtonIcon: {
    marginBottom: 16,
  },
  mainButtonTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  mainButtonDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.9,
  },
  optionalSection: {
    marginBottom: 40,
  },
  optionalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  importButton: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  optionIcon: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  optionDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  infoSection: {
    marginBottom: 40,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0, 245, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 245, 255, 0.2)",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  fixedFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  getStartedButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
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
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardingImportScreen;
