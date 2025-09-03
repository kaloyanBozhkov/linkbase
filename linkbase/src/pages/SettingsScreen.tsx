import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors as baseColors, typography } from "@/theme/colors";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../App";
import { API_CONFIG } from "@/config/api.config";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useTranslation } from "@/hooks/useTranslation";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useThemeStore();
  const { t, currentLanguage, changeLanguage, languages } = useTranslation();
  const { resetOnboarding } = useOnboardingStore();
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

  const settingsItems = [
    {
      icon: "notifications",
      title: t("settings.notifications.title"),
      subtitle: t("settings.notifications.subtitle"),
      iconFamily: "MaterialIcons" as const,
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      icon: "import-export",
      title: t("settings.importExport.title"),
      subtitle: t("settings.importExport.subtitle"),
      iconFamily: "MaterialIcons" as const,
      onPress: () => navigation.navigate("ImportExport"),
    },
    {
      icon: "palette",
      title: t("settings.appearance.title"),
      subtitle: t("settings.appearance.subtitle"),
      iconFamily: "MaterialIcons" as const,
      onPress: () => navigation.navigate("Appearance"),
    },
    {
      icon: "language",
      title: t("settings.language.title"),
      subtitle: t("settings.language.subtitle"),
      iconFamily: "MaterialIcons" as const,
      onPress: () => {}, // Will be handled by LanguageSelector
    },
    {
      icon: "shield-checkmark",
      title: t("settings.privacy.title"),
      subtitle: t("settings.privacy.subtitle"),
      iconFamily: "Ionicons" as const,
      onPress: () => {
        const base = API_CONFIG.BASE_URL.replace(/\/?api$/, "");
        const appSlug = "linkbase";
        Linking.openURL(`${base}/privacy/${appSlug}`);
      },
    },
    {
      icon: "help-circle",
      title: t("settings.helpSupport.title"),
      subtitle: t("settings.helpSupport.subtitle"),
      iconFamily: "Ionicons" as const,
      onPress: () => navigation.navigate("HelpSupport"),
    },
    {
      icon: "cloud-sync",
      title: t("settings.sync.title"),
      subtitle: t("settings.sync.subtitle"),
      iconFamily: "MaterialIcons" as const,
      onPress: () => navigation.navigate("Sync"),
    },
    {
      icon: "refresh",
      title: "Reset Onboarding",
      subtitle: "Restart the onboarding flow",
      iconFamily: "MaterialIcons" as const,
      onPress: () => resetOnboarding(),
    },
  ];

  const renderSettingsItem = (
    item: (typeof settingsItems)[0],
    index: number
  ) => {
    const IconComponent =
      item.iconFamily === "MaterialIcons" ? MaterialIcons : Ionicons;

    // Special handling for language item
    if (item.icon === "language") {
      return (
        <TouchableOpacity
          key={index}
          style={styles.settingsItem}
          onPress={() => setIsLanguageModalVisible(true)}
        >
          <View
            style={[
              styles.settingsItemIcon,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            <IconComponent
              name={item.icon as any}
              size={24}
              color={colors.text.accent}
            />
          </View>
          <View style={styles.settingsItemContent}>
            <Text
              style={[styles.settingsItemTitle, { color: colors.text.primary }]}
            >
              {item.title}
            </Text>
            <Text
              style={[
                styles.settingsItemSubtitle,
                { color: colors.text.muted },
              ]}
            >
              {item.subtitle}
            </Text>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={colors.text.muted}
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        style={styles.settingsItem}
        onPress={item.onPress}
      >
        <View
          style={[
            styles.settingsItemIcon,
            { backgroundColor: colors.background.secondary },
          ]}
        >
          <IconComponent
            name={item.icon as any}
            size={24}
            color={colors.text.accent}
          />
        </View>
        <View style={styles.settingsItemContent}>
          <Text
            style={[styles.settingsItemTitle, { color: colors.text.primary }]}
          >
            {item.title}
          </Text>
          <Text
            style={[styles.settingsItemSubtitle, { color: colors.text.muted }]}
          >
            {item.subtitle}
          </Text>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={colors.text.muted}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
              {t("settings.title")}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
              {t("settings.subtitle")}
            </Text>
          </View>

          {/* Settings Items */}
          <View
            style={[
              styles.settingsSection,
              { backgroundColor: colors.background.surface },
            ]}
          >
            {settingsItems.map(renderSettingsItem)}
          </View>

          {/* App Info Section */}
          <View
            style={[
              styles.appInfoSection,
              { backgroundColor: colors.background.surface },
            ]}
          >
            <View
              style={[
                styles.appInfoItem,
                { borderBottomColor: colors.border.light },
              ]}
            >
              <Text
                style={[styles.appInfoLabel, { color: colors.text.secondary }]}
              >
                {t("settings.appInfo.version")}
              </Text>
              <Text
                style={[styles.appInfoValue, { color: colors.text.primary }]}
              >
                1.0.0
              </Text>
            </View>
            <View
              style={[
                styles.appInfoItem,
                { borderBottomColor: colors.border.light },
              ]}
            >
              <Text
                style={[styles.appInfoLabel, { color: colors.text.secondary }]}
              >
                {t("settings.appInfo.build")}
              </Text>
              <Text
                style={[styles.appInfoValue, { color: colors.text.primary }]}
              >
                2024.1
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.logoGradient}
              >
                <Text
                  style={[styles.logoText, { color: colors.text.onAccent }]}
                >
                  K
                </Text>
              </LinearGradient>
            </View>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>
              {t("settings.footer.createdBy")}{" "}
              <Text
                style={[styles.footerHighlight, { color: colors.text.accent }]}
              >
                K-BITS
              </Text>{" "}
              {t("settings.footer.withLove")}{" "}
              <Text style={styles.heartIcon}>❤️</Text>
            </Text>
            <Text style={[styles.footerSubtext, { color: colors.text.muted }]}>
              {t("settings.footer.tagline")}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLanguageModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={colors.gradients.dark}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, { color: colors.text.accent }]}
                >
                  {t("settings.language.selectLanguage")}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsLanguageModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text.muted} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              >
                {Object.entries(languages)
                  .sort((a, b) => {
                    // Put current language first
                    if (a[0] === currentLanguage) return -1;
                    if (b[0] === currentLanguage) return 1;
                    // Then sort alphabetically by native name
                    return a[1].nativeName.localeCompare(b[1].nativeName);
                  })
                  .map(([code, language]) => {
                    const isSelected = code === currentLanguage;
                    return (
                      <TouchableOpacity
                        key={code}
                        style={[
                          styles.languageItem,
                          { backgroundColor: colors.background.surface },
                          isSelected && [
                            styles.languageItemSelected,
                            { backgroundColor: colors.background.tertiary },
                          ],
                        ]}
                        onPress={async () => {
                          await changeLanguage(code as any);
                          setIsLanguageModalVisible(false);
                        }}
                      >
                        <View style={styles.languageInfo}>
                          <Text
                            style={[
                              styles.languageName,
                              { color: colors.text.primary },
                              isSelected && { color: colors.text.accent },
                            ]}
                          >
                            {language.nativeName}
                          </Text>
                          <Text
                            style={[
                              styles.languageEnglishName,
                              { color: colors.text.muted },
                            ]}
                          >
                            {language.name}
                          </Text>
                          <Text
                            style={[
                              styles.languageRegions,
                              { color: colors.text.muted },
                            ]}
                          >
                            {language.regions.join(", ")}
                          </Text>
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={colors.text.accent}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseColors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: baseColors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: typography.size.base,
    color: baseColors.text.muted,
    textAlign: "center",
  },
  settingsSection: {
    backgroundColor: baseColors.background.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  settingsItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: baseColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingsItemContent: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
    color: baseColors.text.primary,
    marginBottom: 4,
  },
  settingsItemSubtitle: {
    fontSize: typography.size.sm,
    color: baseColors.text.muted,
  },
  appInfoSection: {
    backgroundColor: baseColors.background.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  appInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseColors.border.light,
  },
  appInfoLabel: {
    fontSize: typography.size.base,
    color: baseColors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  appInfoValue: {
    fontSize: typography.size.base,
    color: baseColors.text.primary,
    fontWeight: typography.weight.medium,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingBottom: 60,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 24,
    fontWeight: typography.weight.bold,
    color: baseColors.text.onAccent,
  },
  footerText: {
    fontSize: typography.size.lg,
    color: baseColors.text.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  footerHighlight: {
    color: baseColors.text.accent,
    fontWeight: typography.weight.bold,
  },
  heartIcon: {
    fontSize: typography.size.lg,
  },
  footerSubtext: {
    fontSize: typography.size.sm,
    color: baseColors.text.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.bold,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  languageItemSelected: {
    borderWidth: 2,
    borderColor: "transparent",
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  languageEnglishName: {
    fontSize: typography.size.base,
    marginBottom: 2,
  },
  languageRegions: {
    fontSize: typography.size.sm,
    fontStyle: "italic",
  },
});

export default SettingsScreen;
