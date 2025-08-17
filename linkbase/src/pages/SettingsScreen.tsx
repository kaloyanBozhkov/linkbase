import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors as baseColors, typography } from "@/theme/colors";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../../App";
import { API_CONFIG } from "@/config/api.config";
import { useThemeStore } from "@/hooks/useThemeStore";

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useThemeStore();

  const settingsItems = [
    {
      icon: "notifications",
      title: "Notifications",
      subtitle: "Manage your notification preferences",
      iconFamily: "MaterialIcons" as const,
      onPress: () => navigation.navigate("Notifications"),
    },
    {
      icon: "cloud-sync",
      title: "Sync",
      subtitle: "Backup and sync your connections",
      iconFamily: "MaterialIcons" as const,
      onPress: () => navigation.navigate("Sync"),
    },
    {
      icon: "palette",
      title: "Appearance",
      subtitle: "Customize the app's look and feel",
      iconFamily: "MaterialIcons" as const,
      onPress: () => navigation.navigate("Appearance"),
    },
    {
      icon: "shield-checkmark",
      title: "Privacy",
      subtitle: "Privacy and security settings",
      iconFamily: "Ionicons" as const,
      onPress: () => {
        const base = API_CONFIG.BASE_URL.replace(/\/?api$/, "");
        const appSlug = "linkbase";
        Linking.openURL(`${base}/privacy/${appSlug}`);
      },
    },
    {
      icon: "help-circle",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      iconFamily: "Ionicons" as const,
      onPress: () => navigation.navigate("HelpSupport"),
    },
  ];

  const renderSettingsItem = (item: typeof settingsItems[0], index: number) => {
    const IconComponent = item.iconFamily === "MaterialIcons" ? MaterialIcons : Ionicons;
    
    return (
      <TouchableOpacity key={index} style={styles.settingsItem} onPress={item.onPress}>
        <View style={[styles.settingsItemIcon, { backgroundColor: colors.background.secondary }]}>
          <IconComponent 
            name={item.icon as any} 
            size={24} 
            color={colors.text.accent} 
          />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={[styles.settingsItemTitle, { color: colors.text.primary }]}>{item.title}</Text>
          <Text style={[styles.settingsItemSubtitle, { color: colors.text.muted }]}>{item.subtitle}</Text>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Settings</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
              Customize your Linkbase experience
            </Text>
          </View>

          {/* Settings Items */}
          <View style={[styles.settingsSection, { backgroundColor: colors.background.surface }]}>
            {settingsItems.map(renderSettingsItem)}
          </View>

          {/* App Info Section */}
          <View style={[styles.appInfoSection, { backgroundColor: colors.background.surface }]}>
            <View style={[styles.appInfoItem, { borderBottomColor: colors.border.light }]}>
              <Text style={[styles.appInfoLabel, { color: colors.text.secondary }]}>Version</Text>
              <Text style={[styles.appInfoValue, { color: colors.text.primary }]}>1.0.0</Text>
            </View>
            <View style={[styles.appInfoItem, { borderBottomColor: colors.border.light }]}>
              <Text style={[styles.appInfoLabel, { color: colors.text.secondary }]}>Build</Text>
              <Text style={[styles.appInfoValue, { color: colors.text.primary }]}>2024.1</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.logoGradient}
              >
                <Text style={[styles.logoText, { color: colors.text.onAccent }]}>K</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.footerText, { color: colors.text.secondary }]}>
              Created by{" "}
              <Text style={[styles.footerHighlight, { color: colors.text.accent }]}>K-BITS</Text>
              {" "}with{" "}
              <Text style={styles.heartIcon}>❤️</Text>
            </Text>
            <Text style={[styles.footerSubtext, { color: colors.text.muted }]}>
              Building connections, one link at a time
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
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
});

export default SettingsScreen;