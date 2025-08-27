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
import { trpc } from "@/utils/trpc";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

const ImportExportScreen: React.FC = () => {
  const { colors } = useThemeStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // tRPC mutations
  const exportAllConnections = trpc.linkbase.connections.exportAll.useQuery(undefined, {
    enabled: false,
  });

  const importConnections = trpc.linkbase.connections.import.useMutation();

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Fetch all connections
      const connections = await exportAllConnections.refetch().then(res => res.data);

      if (!connections || connections.length === 0) {
        Alert.alert("No Data", "You don't have any connections to export.");
        return;
      }

      // Create export data structure
      const exportData = {
        version: "1.0",
        exportDate: new Date().toISOString(),
        connections: connections.map(conn => ({
          name: conn.name,
          metAt: conn.met_at,
          metWhen: conn.met_when,
          facts: conn.facts.map(fact => fact.text),
          socialMedias: conn.social_medias.map(sm => ({
            type: sm.type,
            handle: sm.handle,
          })),
        })),
      };

      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      const filename = `linkbase-connections-${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'web') {
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

      Alert.alert("Success", "Your connections have been exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Export Failed", "An error occurred while exporting your connections.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);

      // Pick a JSON file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
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
        Alert.alert("Invalid File", "The selected file is not a valid JSON file.");
        return;
      }

      // Validate structure
      if (!importData.connections || !Array.isArray(importData.connections)) {
        Alert.alert("Invalid Format", "The file doesn't contain valid connection data.");
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

      const message = `Import completed!\n\nImported: ${resultImport.imported}\nSkipped (duplicates): ${resultImport.skipped}`;

      Alert.alert(
        "Import Complete",
        message,
        [
          {
            text: "OK",
            onPress: () => {
              if (resultImport.errors && resultImport.errors.length > 0) {
                Alert.alert(
                  "Import Errors",
                  resultImport.errors.join('\n\n'),
                  [{ text: "OK" }]
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Import error:", error);
      Alert.alert("Import Failed", "An error occurred while importing your connections.");
    } finally {
      setIsImporting(false);
    }
  };

  const features = [
    {
      icon: "download",
      title: "Export Connections",
      description: "Download all your connections as a JSON file",
      action: handleExport,
      loading: isExporting,
      buttonText: isExporting ? "Exporting..." : "Export",
      iconFamily: "MaterialIcons" as const,
    },
    {
      icon: "cloud-upload",
      title: "Import Connections",
      description: "Import connections from a JSON file",
      action: handleImport,
      loading: isImporting,
      buttonText: isImporting ? "Importing..." : "Import",
      iconFamily: "MaterialIcons" as const,
    },
  ];

  const renderFeature = (feature: typeof features[0], index: number) => {
    const IconComponent = feature.iconFamily === "MaterialIcons" ? MaterialIcons : Ionicons;

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
            <Text
              style={[styles.featureTitle, { color: colors.text.primary }]}
            >
              {feature.title}
            </Text>
            <Text
              style={[styles.featureDescription, { color: colors.text.secondary }]}
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
                ? colors.button.secondary.background + '80'
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
            Import & Export
          </Text>

          <View style={styles.infoSection}>
            <Text
              style={[styles.infoTitle, { color: colors.text.primary }]}
            >
              Manage Your Data
            </Text>
            <Text
              style={[styles.infoText, { color: colors.text.secondary }]}
            >
              Export your connections to backup your data or share it with another device.
              Import connections from a JSON file to add them to your current collection.
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
            <Text
              style={[styles.warningTitle, { color: colors.text.primary }]}
            >
              Important Notes
            </Text>
            <Text
              style={[styles.warningText, { color: colors.text.secondary }]}
            >
              • Duplicate connections (same name and meeting place) will be skipped during import
            </Text>
            <Text
              style={[styles.warningText, { color: colors.text.secondary }]}
            >
              • Facts are deduplicated per connection
            </Text>
            <Text
              style={[styles.warningText, { color: colors.text.secondary }]}
            >
              • Import files must be valid JSON format
            </Text>
          </View>
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
});

export default ImportExportScreen;
