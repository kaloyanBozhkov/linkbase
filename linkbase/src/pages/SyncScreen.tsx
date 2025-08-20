import React, { useState, useEffect } from "react";
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
import * as Linking from "expo-linking";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SyncScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const [email, setEmail] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Storage keys for email sent state
  const EMAIL_SENT_KEY = "linkbase_email_sent_27-07-2025.6";
  const PENDING_EMAIL_KEY = "linkbase_pending_email_27-07-2025.6";
  const { saveUserEmail, userEmail, loadUserEmail } =
    useSessionUserStore();
  const sendVerificationEmail = trpc.linkbase.users.sendVerificationEmail.useMutation();

  useEffect(() => {
    const loadInitialState = async () => {
      try {
        await loadUserEmail();
        
        // Load email sent state from storage
        const storedEmailSent = await AsyncStorage.getItem(EMAIL_SENT_KEY);
        const storedPendingEmail = await AsyncStorage.getItem(PENDING_EMAIL_KEY);
        
        if (storedEmailSent === "1" && storedPendingEmail) {
          setIsEmailSent(true);
          setPendingEmail(storedPendingEmail);
        }
      } catch (error) {
        console.error("Error loading initial state:", error);
      }
    };
    
    loadInitialState();
  }, []);

  // Handle deep linking for email verification
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      const parsed = Linking.parse(url);
      if (parsed.path === 'sync' && parsed.queryParams?.verified === 'true') {
        const verifiedEmail = parsed.queryParams.email as string;
        if (verifiedEmail) {
          saveUserEmail(verifiedEmail);
          loadUserEmail();
          setIsEmailSent(false);
          setPendingEmail(null);
          
          // Clear email sent state from storage since verification is complete
          await AsyncStorage.removeItem(EMAIL_SENT_KEY);
          await AsyncStorage.removeItem(PENDING_EMAIL_KEY);
          
          Alert.alert(
            "Email Verified!", 
            "Your email has been successfully verified. Your account is now synced across devices."
          );
        }
      }
    };

    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleVerify = async () => {
    try {
      if (!email.includes("@")) {
        Alert.alert("Invalid email", "Please enter a valid email address");
        return;
      }
      
      setIsLoading(true);
      await sendVerificationEmail.mutateAsync({ email });
      setPendingEmail(email);
      setIsEmailSent(true);
      setEmail(""); // Clear the input
      
      // Save email sent state to storage
      await AsyncStorage.setItem(EMAIL_SENT_KEY, "1");
      await AsyncStorage.setItem(PENDING_EMAIL_KEY, email);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = async () => {
    try {
      setIsEmailSent(false);
      setPendingEmail(null);
      setEmail("");
      
      // Clear email sent state from storage
      await AsyncStorage.removeItem(EMAIL_SENT_KEY);
      await AsyncStorage.removeItem(PENDING_EMAIL_KEY);
    } catch (error) {
      console.error("Error clearing email sent state:", error);
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
          ) : isEmailSent ? (
            // Email sent - show pending verification state
            <>
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
                    📧 Check Your Email
                  </Text>
                  <Text
                    style={[styles.syncedEmail, { color: colors.text.accent }]}
                  >
                    {pendingEmail}
                  </Text>
                </View>

                <View style={styles.infoSection}>
                  <Text
                    style={[styles.infoText, { color: colors.text.secondary }]}
                  >
                    We&apos;ve sent a verification link to your email address. Click the link to complete the setup.
                  </Text>
                </View>
              </View>

              {/* Separate card for troubleshooting */}
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
                  style={[styles.infoTitle, { color: colors.text.primary }]}
                >
                  Didn&apos;t receive the email?
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.text.secondary }]}
                >
                  Check your spam folder or try a different email address.
                </Text>

                <TouchableOpacity
                  onPress={handleTryAgain}
                  style={[
                    styles.verifyButton,
                    {
                      backgroundColor: colors.button.secondary.background,
                      borderColor: colors.button.secondary.border,
                      marginTop: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.verifyButtonText,
                      { color: colors.button.secondary.text },
                    ]}
                  >
                    Try Different Email
                  </Text>
                </TouchableOpacity>
              </View>
            </>
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
                editable={!isLoading}
                style={[
                  styles.emailInput,
                  {
                    borderColor: colors.input.border,
                    color: colors.input.text,
                    backgroundColor: colors.input.background,
                    opacity: isLoading ? 0.7 : 1,
                  },
                ]}
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity
                onPress={handleVerify}
                disabled={isLoading}
                style={[
                  styles.verifyButton,
                  {
                    backgroundColor: isLoading 
                      ? colors.button.secondary.background + '80' // Add transparency when loading
                      : colors.button.secondary.background,
                    borderColor: colors.button.secondary.border,
                    opacity: isLoading ? 0.7 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.verifyButtonText,
                    { color: colors.button.secondary.text },
                  ]}
                >
                  {isLoading ? "Sending..." : "Verify & Link"}
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
