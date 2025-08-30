import React, { useEffect } from "react";
import { Text, SafeAreaView, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useTranslation } from "@/hooks/useTranslation";
import ThemeSelector from "@/components/molecules/ThemeSelector";



const AppearanceScreen: React.FC = () => {
  const { colors, themeId, setThemeId, initializeTheme, isInitializing } = useThemeStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isInitializing) return;
    initializeTheme();
  }, [initializeTheme, isInitializing]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <LinearGradient colors={colors.gradients.background} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{t("appearance.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>{t("appearance.chooseTheme")}</Text>
          <ThemeSelector
            selectedThemeId={themeId}
            onThemeSelect={setThemeId}
            colors={colors}
            showDescriptions={false}
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 14 },
});

export default AppearanceScreen;

