import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import SocialMediaSection from "../components/molecules/SocialMediaSection";
import VoiceRecorder from "../components/organisms/VoiceRecorder";
import { useSessionUserStore } from "../hooks/useGetSessionUser";
import { camelCaseWords, getErrorMessage } from "../helpers/utils";
import { enableRateApp } from "../hooks/useRateApp";
import type { social_media } from "@linkbase/prisma";
import { trpc, updateInfiniteQueryDataOnAdd } from "@/utils/trpc";
import { colors as baseColors, typography, borderRadius } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useKeyboardScroll } from "@/hooks/useKeyboardScroll";
import { ActivityIndicator } from "react-native-paper";

type AddConnectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddConnection"
>;

interface Props {
  navigation: AddConnectionScreenNavigationProp;
}

const AddConnectionScreen: React.FC<Props> = ({ navigation }) => {
  const { mutateAsync: createConnection, isPending: loading } =
    trpc.linkbase.connections.create.useMutation();
  const { scrollViewRef, scrollToFocusedInput } = useKeyboardScroll();
  const [formData, setFormData] = useState({
    name: "",
    metAt: "",
    facts: [""],
    socialMedias: [] as social_media[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isNameAutoCapitalized, setIsNameAutoCapitalized] = useState(true);
  const trpcUtils = trpc.useUtils();
  
  const [filloutAudioUrl, setFilloutAudioUrl] = useState<string | null>(null);
  const {
    data: filloutData,
    isFetching: isFetchingFillout,
    error: filloutError,
  } = trpc.linkbase.connections.getAddNewConnectionFillout.useQuery(
    {
      audioFileUrl: filloutAudioUrl ?? "",
    },
    {
      enabled: !!filloutAudioUrl,
    }
  );
  useEffect(() => {
    if (filloutError) {
      Alert.alert(
        "Error",
        "Couldn't use your voice recording to fill out the form. Please try again later."
      );
    }
  }, [filloutError]);
  useEffect(() => {
    if (filloutData) {
      setFormData((prev) => ({
        ...prev,
        name: filloutData.name ?? prev.name,
        metAt: filloutData.metWhere ?? prev.metAt,
        facts: [...prev.facts.filter(Boolean), ...filloutData.facts],
      }));
    }
  }, [filloutData]);

  // Handle voice recording transcription
  const handleVoiceRecordingUploaded = (s3AudioUrl: string) => {
    console.log("handleVoiceRecordingUploaded s3AudioUrl:", s3AudioUrl);
    setFilloutAudioUrl(s3AudioUrl);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.metAt.trim()) {
      newErrors.metAt = "Meeting place is required";
    }

    // Facts are now optional - no validation needed

    // Validate social media entries
    const invalidSocialMedias = formData.socialMedias.filter(
      (sm) => !sm.handle.trim()
    );
    if (invalidSocialMedias.length > 0) {
      newErrors.socialMedias = "All social media entries must have valid input";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const validFacts = formData.facts.filter((fact) => fact.trim());
    const validSocialMedias = formData.socialMedias.filter((sm) =>
      sm.handle.trim()
    );

    const userId = useSessionUserStore.getState().userId;
    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }

    createConnection(
      {
        name: formData.name.trim(),
        metAt: formData.metAt.trim(),
        facts: validFacts, // Can be empty array
        socialMedias: validSocialMedias,
      },
      {
        onSuccess: (createdConnection) => {
          // Update getAll cache - we need to update the connection in all paginated results
          updateInfiniteQueryDataOnAdd(
            trpcUtils,
            ["linkbase", "connections", "getAll"],
            createdConnection,
            { prepend: true }
          );

          Alert.alert("Success", "Connection added successfully!", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);

          enableRateApp();
        },
        onError: (error) => {
          const errorMessage = getErrorMessage(error);
          Alert.alert("Error", errorMessage);
        },
      }
    );
  };

  const addFactField = () => {
    setFormData((prev) => ({
      ...prev,
      facts: [...prev.facts, ""],
    }));
  };

  const removeFactField = (index: number) => {
    // Allow removing even the last fact since facts are now optional
    setFormData((prev) => ({
      ...prev,
      facts: prev.facts.filter((_, i) => i !== index),
    }));
  };

  const updateFact = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      facts: prev.facts.map((fact, i) => (i === index ? value : fact)),
    }));
  };

  const updateSocialMedias = (socialMedias: social_media[]) => {
    setFormData((prev) => ({
      ...prev,
      socialMedias,
    }));
  };

  const { colors } = useThemeStore();

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>New Connection</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>Build your network</Text>
          </View>
          <View style={styles.voiceRec}>
            {isFetchingFillout ? (
              <ActivityIndicator size="small" color={baseColors.loading} />
            ) : (
              <VoiceRecorder
                onRecordingUploaded={handleVoiceRecordingUploaded}
                featureFolder="add-contact-recordings"
                userId={useSessionUserStore.getState().userId!}
              />
            )}
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <Input
                label="Name *"
                value={formData.name}
                onChangeText={(text) => {
                  // Auto-capitalize if user is just typing (not manually editing)
                  const processedText = isNameAutoCapitalized
                    ? camelCaseWords(text)
                    : text;
                  setFormData((prev) => ({ ...prev, name: processedText }));

                  // If user deletes or manually edits, stop auto-capitalizing
                  if (
                    text.length < formData.name.length ||
                    (text !== camelCaseWords(text) &&
                      text === text.toLowerCase())
                  ) {
                    setIsNameAutoCapitalized(false);
                  }
                }}
                onFocus={() => scrollToFocusedInput()}
                error={errors.name}
                placeholder="Enter their name"
              />

              <Input
                label="Where did you meet? *"
                value={formData.metAt}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, metAt: text }))
                }
                onFocus={() => scrollToFocusedInput()}
                error={errors.metAt}
                placeholder="Coffee shop, conference, party, etc."
              />

              <SocialMediaSection
                socialMedias={formData.socialMedias}
                onUpdateSocialMedias={updateSocialMedias}
                error={errors.socialMedias}
                onInputFocus={scrollToFocusedInput}
              />

              <View style={styles.factsSection}>
                <LinearGradient colors={colors.gradients.section} style={styles.factsSectionContent}>
                  <Text style={[styles.factsTitle, { color: colors.text.accent }]}>💡 Notes (Optional)</Text>
                  {errors.facts && (
                    <Text style={[styles.errorText, { color: colors.text.error }]}>{errors.facts}</Text>
                  )}

                  {formData.facts.map((fact, index) => (
                    <View key={index} style={styles.factRow}>
                      <Input
                        value={fact}
                        onChangeText={(text) => updateFact(index, text)}
                        onFocus={() => scrollToFocusedInput()}
                        placeholder={`Interesting fact #${index + 1}`}
                        containerStyle={styles.factInput}
                      />
                      {/* Always show remove button since facts are optional */}
                      <Button
                        icon={
                          <Ionicons name="trash" size={18} color="#ffffff" />
                        }
                        onPress={() => removeFactField(index)}
                        variant="danger"
                        size="small"
                        style={styles.removeButton}
                        iconOnly
                      />
                    </View>
                  ))}

                  <Button
                    title="+ Add Fact"
                    onPress={addFactField}
                    variant="ghost"
                    style={styles.addFactButton}
                  />
                </LinearGradient>
              </View>

            </View>
          </ScrollView>
          <View style={[styles.bottomActions, { borderTopColor: colors.border.light }]}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={loading ? "Adding..." : "Add Connection"}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: baseColors.border.light,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  voiceRec: {
    display: "flex",
    alignContent: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: typography.size["5xl"],
    fontWeight: typography.weight.extrabold,
    color: baseColors.text.primary,
    marginBottom: 4,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSubtitle: {
    fontSize: typography.size.xl,
    color: baseColors.text.muted,
    fontWeight: typography.weight.medium,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  factsSection: {
    marginBottom: 32,
  },
  factsSectionContent: {
    padding: 20,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: baseColors.border.default,
  },
  factsTitle: {
    fontSize: typography.size["2xl"],
    fontWeight: typography.weight.bold,
    marginBottom: 16,
    color: baseColors.text.accent,
    letterSpacing: typography.letterSpacing.wide,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  factInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  removeButton: {
    minWidth: 44,
    alignSelf: "center",
  },
  addFactButton: {
    marginTop: 12,
  },
  bottomActions: {
    flexDirection: "row",
    gap: 16,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: baseColors.border.light,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  errorText: {
    color: baseColors.text.error,
    fontSize: typography.size.base,
    marginBottom: 12,
    fontWeight: typography.weight.medium,
  },
});

export default AddConnectionScreen;
