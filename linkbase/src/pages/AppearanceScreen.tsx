import React, { useEffect } from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore, ThemeName } from "@/hooks/useThemeStore";

const THEMES: ThemeName[] = ["Exo Theme", "Warm Pastel", "Light Mode"];

const AppearanceScreen: React.FC = () => {
  const { colors, themeName, setThemeName, initializeTheme, isInitializing } = useThemeStore();

  useEffect(() => {
    if (!isInitializing) return;
    initializeTheme();
  }, [initializeTheme, isInitializing]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <LinearGradient colors={colors.gradients.background} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Appearance</Text>
          <Text style={[styles.subtitle, { color: colors.text.muted }]}>Choose a theme</Text>
          <View style={styles.list}>
            {THEMES.map((name) => {
              const selected = themeName === name;
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => setThemeName(name)}
                  style={[
                    styles.item,
                    { backgroundColor: colors.background.surface, borderColor: selected ? colors.border.focus : colors.border.light },
                  ]}
                >
                  <Text style={[styles.itemTitle, { color: colors.text.primary }]}>{name}</Text>
                  <Text style={[styles.itemSubtitle, { color: selected ? colors.text.accent : colors.text.muted }]}>
                    {selected ? "Selected" : "Tap to apply"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  list: { gap: 10 },
  item: { padding: 16, borderRadius: 12, borderWidth: 1 },
  itemTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  itemSubtitle: { fontSize: 12 },
});

export default AppearanceScreen;

