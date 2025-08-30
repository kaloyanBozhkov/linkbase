import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useTranslation } from "@/hooks/useTranslation";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { trpc } from "@/utils/trpc";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const ImportExportScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const {
    setHasImportedData,
    setCompleted,
    isCompleted: isOnboardingCompleted,
  } = useOnboardingStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // tRPC mutations
  const exportAllConnections = trpc.linkbase.connections.exportAll.useQuery(
    undefined,
    {
      enabled: false,
    }
  );

  const importConnections = trpc.linkbase.connections.import.useMutation();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch all connections
      const connections = await exportAllConnections
        .refetch()
        .then((res) => res.data);

      if (!connections || connections.length === 0) {
        Alert.alert(
          t("importExport.noData"),
          t("importExport.noConnectionsToExport")
        );
        return;
      }

      // Create export data structure
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        connections: connections.map((conn) => ({
          name: conn.name,
          metAt: conn.met_at,
          metWhen: conn.met_when,
          facts: conn.facts.map((fact) => fact.text),
          socialMedias: conn.social_medias.map((sm) => ({
            type: sm.type,
            handle: sm.handle,
          })),
        })),
      };

      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      const filename = `linkbase-connections-${
        new Date().toISOString().split("T")[0]
      }.json`;

      if (Platform.OS === "web") {
        // For web, use Share API
        await Share.share({
          message: jsonData,
          title: filename,
        });
      } else {
        // For mobile, save to file system and share
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, jsonData, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        await Share.share({
          url: fileUri,
          title: filename,
        });
      }

      Alert.alert(t("common.success"), t("importExport.exportSuccess"));
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        t("importExport.exportFailed"),
        t("importExport.exportError")
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);

      // Pick a JSON file
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const fileUri = result.assets[0].uri;

      // Read the file content
      const fileContent = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Parse JSON
      let importData;
      try {
        importData = JSON.parse(fileContent);
      } catch (_parseError) {
        Alert.alert(
          t("importExport.invalidFile"),
          t("importExport.notValidJsonFile")
        );
        return;
      }

      // Validate structure
      if (!importData.connections || !Array.isArray(importData.connections)) {
        Alert.alert(
          t("importExport.invalidFormat"),
          t("importExport.invalidConnectionData")
        );
        return;
      }

      // Transform data for import
      const connections = importData.connections.map((conn: any) => ({
        name: conn.name,
        metAt: conn.metAt,
        metWhen: conn.metWhen ? new Date(conn.metWhen) : undefined,
        facts: conn.facts || [],
        socialMedias: conn.socialMedias || [],
      }));

      // Import connections
      const resultImport = await importConnections.mutateAsync({ connections });

      const message = t("importExport.importCompleteMessage", {
        imported: resultImport.imported,
        skipped: resultImport.skipped,
      });

      Alert.alert(t("importExport.importComplete"), message, [
        {
          text: "OK",
          onPress: async () => {
            if (resultImport.errors && resultImport.errors.length > 0) {
              Alert.alert(
                t("importExport.importErrors"),
                resultImport.errors.join("\n\n"),
                [{ text: t("common.ok") }]
              );
            }
            // Complete onboarding and navigate to home
            await setHasImportedData(true);
            await setCompleted(true);
          },
        },
      ]);
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert(
        t("importExport.importFailed"),
        t("importExport.importError")
      );
    } finally {
      setIsImporting(false);
    }
  };

  const features = [
    {
      icon: "download",
      title: t("importExport.exportConnections"),
      description: t("importExport.exportDescription"),
      action: handleExport,
      loading: isExporting,
      buttonText: isExporting
        ? t("importExport.exporting")
        : t("importExport.export"),
      iconFamily: "MaterialIcons" as const,
    },
    {
      icon: "cloud-upload",
      title: t("importExport.importConnections"),
      description: t("importExport.importDescription"),
      action: handleImport,
      loading: isImporting,
      buttonText: isImporting
        ? t("importExport.importing")
        : t("importExport.import"),
      iconFamily: "MaterialIcons" as const,
    },
  ];

  const renderFeature = (feature: (typeof features)[0], index: number) => {
    const IconComponent =
      feature.iconFamily === "MaterialIcons" ? MaterialIcons : Ionicons;

    return (
      <View
        key={index}
        style={[
          styles.featureCard,
          {
            backgroundColor: colors.background.surface,
            borderColor: colors.border.light,
          },
        ]}
      >
        <View style={styles.featureHeader}>
          <View
            style={[
              styles.featureIcon,
              { backgroundColor: colors.background.secondary },
            ]}
          >
            <IconComponent
              name={feature.icon as any}
              size={24}
              color={colors.text.accent}
            />
          </View>
          <View style={styles.featureContent}>
            <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
              {feature.title}
            </Text>
            <Text
              style={[
                styles.featureDescription,
                { color: colors.text.secondary },
              ]}
            >
              {feature.description}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={feature.action}
          disabled={feature.loading}
          style={[
            styles.actionButton,
            {
              backgroundColor: feature.loading
                ? colors.button.secondary.background + "80"
                : colors.button.secondary.background,
              borderColor: colors.button.secondary.border,
              opacity: feature.loading ? 0.7 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              { color: colors.button.secondary.text },
            ]}
          >
            {feature.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
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
            {t("importExport.title")}
          </Text>

          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, { color: colors.text.primary }]}>
              {t("importExport.manageData")}
            </Text>
            <Text style={[styles.infoText, { color: colors.text.secondary }]}>
              {t("importExport.manageDataDescription")}
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {features.map(renderFeature)}
          </View>

          <View style={styles.warningSection}>
            <MaterialIcons
              name="info"
              size={20}
              color={colors.text.accent}
              style={styles.warningIcon}
            />
            <Text style={[styles.warningTitle, { color: colors.text.primary }]}>
              {t("importExport.importantNotes")}
            </Text>
            <Text
              style={[styles.warningText, { color: colors.text.secondary }]}
            >
              {t("importExport.duplicateNote")}
            </Text>
            <Text
              style={[styles.warningText, { color: colors.text.secondary }]}
            >
              {t("importExport.factsNote")}
            </Text>
            <Text
              style={[styles.warningText, { color: colors.text.secondary }]}
            >
              {t("importExport.jsonFormatNote")}
            </Text>
          </View>

          {!isOnboardingCompleted && (
            <TouchableOpacity
              style={[
                styles.skipButton,
                {
                  backgroundColor: colors.background.surface,
                  borderColor: colors.border.light,
                },
              ]}
              onPress={async () => {
                await setHasImportedData(false);
                await setCompleted(true);
              }}
            >
              <Text
                style={[styles.skipButtonText, { color: colors.text.muted }]}
              >
                {t("onboarding.skipForNow")}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  infoSection: { marginBottom: 20 },
  infoTitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 20 },
  featuresContainer: { gap: 16 },
  featureCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  featureHeader: { flexDirection: "row", marginBottom: 16 },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  featureDescription: { fontSize: 14, lineHeight: 20 },
  actionButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  warningSection: { marginTop: 20 },
  warningIcon: { marginBottom: 8 },
  warningTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  warningText: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  skipButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ImportExportScreen;
