import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import Button from "../components/atoms/Button";
import VoiceRecorder from "../components/organisms/VoiceRecorder";
import VoiceConnectionCard from "../components/molecules/VoiceConnectionCard";
import { useSessionUserStore } from "../hooks/useGetSessionUser";
import { getErrorMessage } from "../helpers/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { trpc, updateInfiniteQueryDataOnAdd } from "@/utils/trpc";
import { colors as baseColors, typography } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useKeyboardScroll } from "@/hooks/useKeyboardScroll";

type AddVoiceConnectionsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddVoiceConnections"
>;

interface Props {
  navigation: AddVoiceConnectionsScreenNavigationProp;
}

export interface VoiceConnectionData {
  name: string;
  metWhere: string;
  facts: string[];
  id: string; // temporary ID for UI management
}

const AddVoiceConnectionsScreen: React.FC<Props> = ({ navigation }) => {
  const trpcUtils = trpc.useUtils();
  const { t } = useTranslation();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [connections, setConnections] = useState<VoiceConnectionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const { scrollViewRef, scrollToFocusedInput } = useKeyboardScroll();

  const {
    data: filloutData,
    isFetching: isFetchingFillout,
    error: filloutError,
  } = trpc.linkbase.connections.getMultipleConnectionsFillout.useQuery(
    {
      audioFileUrl: audioUrl ?? "",
    },
    {
      enabled: !!audioUrl,
    }
  );

  const { mutateAsync: createConnection } =
    trpc.linkbase.connections.create.useMutation();

  useEffect(() => {
    if (filloutError) {
      Alert.alert(
        t("common.error"),
        t("voice.couldntParseRecording")
      );
    }
  }, [filloutError]);

  useEffect(() => {
    if (filloutData) {
      const connectionsWithIds = filloutData.connections.map((conn, index) => ({
        ...conn,
        metWhere: conn.metWhere || "",
        id: `temp-${index}`,
      }));
      setConnections(connectionsWithIds);
      setCurrentIndex(0);
    }
  }, [filloutData]);

  const handleVoiceRecordingUploaded = (s3AudioUrl: string) => {
    console.log("handleVoiceRecordingUploaded s3AudioUrl:", s3AudioUrl);
    setAudioUrl(s3AudioUrl);
    setConnections([]);
    setCurrentIndex(0);
  };

  const handleConnectionUpdate = (
    connectionId: string,
    updatedData: Partial<VoiceConnectionData>
  ) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === connectionId ? { ...conn, ...updatedData } : conn
      )
    );
  };

  const handleRemoveConnection = (connectionId: string) => {
    const updatedConnections = connections.filter(
      (conn) => conn.id !== connectionId
    );
    setConnections(updatedConnections);

    // Adjust current index if needed
    if (
      currentIndex >= updatedConnections.length &&
      updatedConnections.length > 0
    ) {
      setCurrentIndex(updatedConnections.length - 1);
    } else if (updatedConnections.length === 0) {
      setCurrentIndex(0);
    }
  };

  const handleCreateAll = async () => {
    if (connections.length === 0) {
      Alert.alert(t("voiceConnections.noConnections"), t("voiceConnections.pleaseRecordFirst"));
      return;
    }

    // Validate all connections have required fields
    const invalidConnections = connections.filter(
      (conn) => !conn.name.trim() || !conn.metWhere.trim()
    );

    if (invalidConnections.length > 0) {
      Alert.alert(
        t("voiceConnections.incompleteConnections"),
        t("voiceConnections.fillNameAndMeetingPlace")
      );
      return;
    }

    setIsCreating(true);

    try {
      // Create all connections
      const createPromises = connections.map((conn) =>
        createConnection({
          name: conn.name.trim(),
          metAt: conn.metWhere.trim(),
          facts: conn.facts.filter((fact) => fact.trim()),
          socialMedias: [],
        })
      );

      const createdConnections = await Promise.all(createPromises);

      // Update cache for each created connection
      createdConnections.forEach((createdConnection) => {
        updateInfiniteQueryDataOnAdd(
          trpcUtils,
          ["linkbase", "connections", "getAll"],
          createdConnection,
          { prepend: true }
        );
      });

      Alert.alert(
        t("common.success"),
        t("voiceConnections.connectionsAddedSuccessfully", { count: createdConnections.length }),
        [{ text: t("common.ok"), onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    setAudioUrl(null);
    setConnections([]);
    setCurrentIndex(0);
  };

  const { colors } = useThemeStore();
  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>{t("voiceConnections.title")}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}> 
              {t("voiceConnections.subtitle")}
            </Text>
          </View>
        </View>

        {connections.length > 0 && (
          <>
            <View style={[styles.navigationHeader, { borderBottomColor: colors.border.light }]}>
              <Text style={[styles.navigationText, { color: colors.text.primary }]}>
                {currentIndex + 1} of {connections.length}
              </Text>
              <View style={styles.navigationButtons}>
                <Button
                  title={t("common.previous")}
                  onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  variant="secondary"
                  size="small"
                />
                <Button
                  title={t("common.next")}
                  onPress={() =>
                    setCurrentIndex(
                      Math.min(connections.length - 1, currentIndex + 1)
                    )
                  }
                  disabled={currentIndex === connections.length - 1}
                  variant="secondary"
                  size="small"
                />
              </View>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {connections[currentIndex] && (
                  <VoiceConnectionCard
                    connection={connections[currentIndex]}
                    onUpdate={(updatedData) =>
                      handleConnectionUpdate(
                        connections[currentIndex].id,
                        updatedData
                      )
                    }
                    onRemove={() =>
                      handleRemoveConnection(connections[currentIndex].id)
                    }
                    onInputFocus={scrollToFocusedInput}
                  />
                )}
              </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.bottomActions}>
              <Button
                title={t("common.tryAgain")}
                onPress={handleRetry}
                variant="secondary"
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />
              <Button
                title={
                  isCreating
                    ? t("voiceConnections.creating")
                    : t("voiceConnections.createConnections", { count: connections.length })
                }
                onPress={handleCreateAll}
                disabled={isCreating}
                style={styles.actionButton}
                textStyle={styles.actionButtonText}
              />
            </View>
          </>
        )}

        {isFetchingFillout && (
          <View style={styles.processingState}>
            <ActivityIndicator size="large" color={baseColors.loading} />
            <Text style={[styles.processingTitle, { color: colors.text.primary }]}>{t("voiceConnections.processingRecording")}</Text>
            <Text style={[styles.processingText, { backgroundColor: colors.background.surface, borderColor: colors.border.light, color: colors.text.muted }]}>
              {t("voiceConnections.processingDescription")}
            </Text>
          </View>
        )}

        {connections.length === 0 && !isFetchingFillout && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateTitle, { color: colors.text.primary }]}>{t("voiceConnections.readyToRecord")}</Text>
            <Text style={[styles.emptyStateText, { color: colors.text.muted }]}>
              {t("voiceConnections.readyToRecordDescription")}
            </Text>
            <View style={styles.voiceRecorderContainer}>
              <VoiceRecorder
                onRecordingUploaded={handleVoiceRecordingUploaded}
                featureFolder="add-multiple-contacts-recordings"
                userId={useSessionUserStore.getState().userId!}
                size="large"
              />
            </View>
            <Text style={[styles.emptyStateExample, { backgroundColor: colors.background.surface, borderColor: colors.border.light, color: colors.text.secondary }]}>
              {t("voiceConnections.exampleText")}
            </Text>
          </View>
        )}
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
  navigationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: baseColors.border.light,
  },
  navigationText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: baseColors.text.primary,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 12,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  bottomActions: {
    flexDirection: "row",
    gap: 16,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: baseColors.border.light,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: typography.size.base,
    lineHeight: typography.size.base * 1.2,
  },
  processingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  processingTitle: {
    fontSize: typography.size["4xl"],
    fontWeight: typography.weight.bold,
    color: baseColors.text.primary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  processingText: {
    fontSize: typography.size.xl,
    color: baseColors.text.muted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    backgroundColor: baseColors.background.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: baseColors.border.light,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: typography.size["4xl"],
    fontWeight: typography.weight.bold,
    color: baseColors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: typography.size.xl,
    color: baseColors.text.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  voiceRecorderContainer: {
    alignItems: "center",
    marginVertical: 32,
  },
  emptyStateExample: {
    fontSize: typography.size.base,
    color: baseColors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
    paddingHorizontal: 16,
    backgroundColor: baseColors.background.surface,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: baseColors.border.light,
  },
});

export default AddVoiceConnectionsScreen;
