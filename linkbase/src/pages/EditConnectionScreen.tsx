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
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import SocialMediaSection from "../components/molecules/SocialMediaSection";
import { camelCaseWords, getErrorMessage } from "../helpers/utils";
import type { social_media } from "@linkbase/prisma";
import { trpc, updateInfiniteQueryDataOnEdit } from "@/utils/trpc";
import { colors as baseColors, typography, borderRadius } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useKeyboardScroll } from "@/hooks/useKeyboardScroll";

type EditConnectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EditConnection"
>;

type EditConnectionScreenRouteProp = RouteProp<
  RootStackParamList,
  "EditConnection"
>;

interface Props {
  navigation: EditConnectionScreenNavigationProp;
  route: EditConnectionScreenRouteProp;
}

const EditConnectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { connectionId } = route.params;
  const { data: connection, isLoading: isLoadingConnection } =
    trpc.linkbase.connections.getById.useQuery({
      id: connectionId,
    });
  const { mutateAsync: updateConnection, isPending: isUpdatingConnection } =
    trpc.linkbase.connections.update.useMutation();
  const [formData, setFormData] = useState({
    name: "",
    metAt: "",
    facts: [""],
    socialMedias: [] as social_media[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isNameAutoCapitalized, setIsNameAutoCapitalized] = useState(false); // Don't auto-cap when editing existing
  const trpcUtils = trpc.useUtils();

  // Refs for scroll functionality
  const { scrollViewRef, scrollToFocusedInput } = useKeyboardScroll();

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

    updateConnection(
      {
        id: connectionId,
        name: formData.name.trim(),
        metAt: formData.metAt.trim(),
        facts: validFacts, // Can be empty array
        socialMedias: validSocialMedias,
      },
      {
        onSuccess: (updatedConnection) => {
          // Update getById cache
          trpcUtils.linkbase.connections.getById.setData(
            { id: connectionId },
            updatedConnection
          );

          // Update getAll cache - we need to update the connection in all paginated results
          updateInfiniteQueryDataOnEdit(
            trpcUtils,
            ["linkbase", "connections", "getAll"],
            connectionId,
            updatedConnection
          );

          // Update search cache - we need to update the connection in all search results
          updateInfiniteQueryDataOnEdit(
            trpcUtils,
            ["linkbase", "connections", "search"],
            connectionId,
            updatedConnection
          );

          Alert.alert("Success", "Connection updated successfully!", [
            { text: "OK", onPress: () => navigation.goBack() },
          ]);
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

  useEffect(() => {
    if (!connection) return;
    setFormData({
      name: connection.name,
      metAt: connection.met_at,
      facts: connection.facts.map((fact) => fact.text),
      socialMedias: connection.social_medias,
    });
  }, [connection]);

  const { colors } = useThemeStore();
  if (isLoadingConnection) {
    return (
      <LinearGradient colors={colors.gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <Text style={[styles.loadingText, { color: colors.text.accent }]}>⚡ Loading connection...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Edit Connection</Text>
          <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
            Update {connection?.name}&apos;s info
          </Text>
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
                    (text !== camelCaseWords(text) && text === text.toLowerCase())
                  ) {
                    setIsNameAutoCapitalized(false);
                  } else if (text.length > formData.name.length) {
                    // If user is adding text, enable auto-capitalization
                    setIsNameAutoCapitalized(true);
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
                        icon={<Ionicons name="trash" size={18} color="#ffffff" />}
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
          <View style={styles.bottomActions}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.cancelButton}
            />
            <Button
              title={
                isUpdatingConnection ? "Updating..." : "Update Connection"
              }
              onPress={handleSubmit}
              disabled={isUpdatingConnection}
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
  },
  headerTitle: {
    fontSize: typography.size['5xl'],
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: typography.size['2xl'],
    color: baseColors.text.accent,
    fontWeight: typography.weight.semibold,
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
    fontSize: typography.size['2xl'],
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

export default EditConnectionScreen;
