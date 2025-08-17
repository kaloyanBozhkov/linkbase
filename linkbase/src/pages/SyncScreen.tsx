import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/hooks/useThemeStore";
import { trpc } from "@/utils/trpc";
import { useSessionUserStore } from "@/hooks/useGetSessionUser";

const SyncScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const [email, setEmail] = useState("");
  const { saveUserId, saveUserEmail, userId, userEmail, loadUserEmail } =
    useSessionUserStore();
  const setEmailAndMerge = trpc.linkbase.users.setEmailAndMerge.useMutation();

  React.useEffect(() => {
    loadUserEmail();
  }, []);

  const handleVerify = async () => {
    try {
      if (!email.includes("@")) {
        Alert.alert("Invalid email", "Please enter a valid email address");
        return;
      }
      const res = await setEmailAndMerge.mutateAsync({ email });
      if (res.userId && res.userId !== userId) {
        await saveUserId(res.userId);
      }
      await saveUserEmail(email);
      await loadUserEmail();
      Alert.alert("Email verified", "Your account is linked for SSO recovery.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to verify email");
    }
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
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Sync
          </Text>

          {userEmail ? (
            // Email already set up - show synced state
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.background.surface,
                  borderColor: colors.border.light,
                },
              ]}
            >
              <View style={styles.syncedHeader}>
                <Text
                  style={[styles.syncedTitle, { color: colors.text.primary }]}
                >
                  ✓ Account Synced
                </Text>
                <Text
                  style={[styles.syncedEmail, { color: colors.text.accent }]}
                >
                  {userEmail}
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text
                  style={[styles.infoTitle, { color: colors.text.primary }]}
                >
                  What this means:
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.text.secondary }]}
                >
                  • Your connections are safely backed up to the cloud
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.text.secondary }]}
                >
                  • You can sign in on any device using this email
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.text.secondary }]}
                >
                  • If you change phones, your data will be restored
                  automatically
                </Text>
              </View>

              <View style={styles.infoSection}>
                <Text
                  style={[styles.infoTitle, { color: colors.text.primary }]}
                >
                  Need to change email?
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.text.secondary }]}
                >
                  Contact support to update your email address or verify on a
                  new device.
                </Text>
              </View>
            </View>
          ) : (
            // Email not set up - show verification flow
            <View
              style={[
                styles.card,
                {
                  backgroundColor: colors.background.surface,
                  borderColor: colors.border.light,
                },
              ]}
            >
              <Text
                style={[styles.setupText, { color: colors.text.secondary }]}
              >
                Set your email to enable sign-in and recovery across devices.
              </Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={colors.input.placeholder}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.emailInput,
                  {
                    borderColor: colors.input.border,
                    color: colors.input.text,
                    backgroundColor: colors.input.background,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity
                onPress={handleVerify}
                style={[
                  styles.verifyButton,
                  {
                    backgroundColor: colors.button.secondary.background,
                    borderColor: colors.button.secondary.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.verifyButtonText,
                    { color: colors.button.secondary.text },
                  ]}
                >
                  Verify & Link
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700" },
  card: { borderRadius: 12, padding: 16, borderWidth: 1 },
  syncedHeader: { marginBottom: 20 },
  syncedTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  syncedEmail: { fontSize: 16, fontWeight: "500" },
  infoSection: { marginBottom: 16 },
  infoTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  setupText: { marginBottom: 12 },
  emailInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  verifyButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  verifyButtonText: {
    textAlign: "center",
    fontWeight: "600",
  },
});

export default SyncScreen;
