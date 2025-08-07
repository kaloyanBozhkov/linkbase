import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { colors, typography } from "@/theme/colors";

const SettingsScreen: React.FC = () => {
  const settingsItems = [
    {
      icon: "notifications",
      title: "Notifications",
      subtitle: "Manage your notification preferences",
      iconFamily: "MaterialIcons" as const,
    },
    {
      icon: "person",
      title: "Account",
      subtitle: "Manage your account settings",
      iconFamily: "MaterialIcons" as const,
    },
    {
      icon: "cloud-sync",
      title: "Sync",
      subtitle: "Backup and sync your connections",
      iconFamily: "MaterialIcons" as const,
    },
    {
      icon: "palette",
      title: "Appearance",
      subtitle: "Customize the app's look and feel",
      iconFamily: "MaterialIcons" as const,
    },
    {
      icon: "shield-checkmark",
      title: "Privacy",
      subtitle: "Privacy and security settings",
      iconFamily: "Ionicons" as const,
    },
    {
      icon: "help-circle",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      iconFamily: "Ionicons" as const,
    },
  ];

  const renderSettingsItem = (item: typeof settingsItems[0], index: number) => {
    const IconComponent = item.iconFamily === "MaterialIcons" ? MaterialIcons : Ionicons;
    
    return (
      <View key={index} style={styles.settingsItem}>
        <View style={styles.settingsItemIcon}>
          <IconComponent 
            name={item.icon as any} 
            size={24} 
            color={colors.text.accent} 
          />
        </View>
        <View style={styles.settingsItemContent}>
          <Text style={styles.settingsItemTitle}>{item.title}</Text>
          <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
        </View>
        <MaterialIcons 
          name="chevron-right" 
          size={20} 
          color={colors.text.muted} 
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize your Linkbase experience
            </Text>
          </View>

          {/* Settings Items */}
          <View style={styles.settingsSection}>
            {settingsItems.map(renderSettingsItem)}
          </View>

          {/* App Info Section */}
          <View style={styles.appInfoSection}>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Version</Text>
              <Text style={styles.appInfoValue}>1.0.0</Text>
            </View>
            <View style={styles.appInfoItem}>
              <Text style={styles.appInfoLabel}>Build</Text>
              <Text style={styles.appInfoValue}>2024.1</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>K</Text>
              </LinearGradient>
            </View>
            <Text style={styles.footerText}>
              Created by{" "}
              <Text style={styles.footerHighlight}>K-BITS</Text>
              {" "}with{" "}
              <Text style={styles.heartIcon}>❤️</Text>
            </Text>
            <Text style={styles.footerSubtext}>
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
    backgroundColor: colors.background.primary,
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
    color: colors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: typography.size.base,
    color: colors.text.muted,
    textAlign: "center",
  },
  settingsSection: {
    backgroundColor: colors.background.surface,
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
    backgroundColor: colors.background.secondary,
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
    color: colors.text.primary,
    marginBottom: 4,
  },
  settingsItemSubtitle: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
  },
  appInfoSection: {
    backgroundColor: colors.background.surface,
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
    borderBottomColor: colors.border.light,
  },
  appInfoLabel: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  appInfoValue: {
    fontSize: typography.size.base,
    color: colors.text.primary,
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
    color: colors.text.onAccent,
  },
  footerText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 8,
  },
  footerHighlight: {
    color: colors.text.accent,
    fontWeight: typography.weight.bold,
  },
  heartIcon: {
    fontSize: typography.size.lg,
  },
  footerSubtext: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default SettingsScreen;