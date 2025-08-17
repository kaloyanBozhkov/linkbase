import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/hooks/useThemeStore";

export default function LoadingScreen() {
  const { colors } = useThemeStore();
  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color={colors.text.accent} />
          <Text variant="bodyMedium" style={[styles.loadingText, { color: colors.text.primary }]}>
            Doing magic..
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingText: {
    color: "#e2e8f0",
    marginTop: 10,
  },
});
