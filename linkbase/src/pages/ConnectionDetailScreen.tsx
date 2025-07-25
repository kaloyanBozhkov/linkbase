import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import Button from "../components/atoms/Button";
import { trpc, updateInfiniteQueryDataOnDelete } from "@/utils/trpc";
import { socialMediaDisplayNames } from "@/helpers/constants";
import { formatDate } from "@linkbase/shared/src/date";
import { colors, shadows, typography, borderRadius } from "@/theme/colors";

type ConnectionDetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ConnectionDetail"
>;

type ConnectionDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "ConnectionDetail"
>;

interface Props {
  navigation: ConnectionDetailScreenNavigationProp;
  route: ConnectionDetailScreenRouteProp;
}

const ConnectionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { connectionId } = route.params;
  const {
    data: connection,
    isLoading,
    error,
    refetch: fetchConnection,
  } = trpc.linkbase.connections.getById.useQuery({
    id: connectionId,
  });
  const { mutateAsync: deleteConnection } =
    trpc.linkbase.connections.delete.useMutation();
  const trpcUtils = trpc.useUtils();

  const handleSocialMediaPress = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const handleEdit = () => {
    navigation.navigate("EditConnection", { connectionId });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Connection",
      `Are you sure you want to delete ${connection?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteConnection(
              {
                id: connectionId,
              },
              {
                onSuccess: () => {
                  updateInfiniteQueryDataOnDelete(
                    trpcUtils,
                    ["linkbase", "connections", "getAll"],
                    connectionId
                  );
                  Alert.alert("Success", "Connection deleted successfully!", [
                    { text: "OK", onPress: () => navigation.goBack() },
                  ]);
                },
                onError: (err: any) => {
                  Alert.alert(
                    "Error",
                    err.message || "Failed to delete connection"
                  );
                },
              }
            );
          },
        },
      ]
    );
  };



  const formatShortDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSocialMediasToShow = () => {
    return connection?.socialMedias || [];
  };

  if (isLoading) {
    return (
      <LinearGradient colors={colors.gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>⚡ Loading...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error || !connection) {
    return (
      <LinearGradient colors={colors.gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centerContainer}>
            <Text style={styles.errorTitle}>⚠️ Error</Text>
            <Text style={styles.errorText}>
              {error?.message ?? "Connection not found"}
            </Text>
            <Button title="Try Again" onPress={fetchConnection} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const socialMediasToShow = getSocialMediasToShow();

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <LinearGradient
              colors={colors.gradients.section}
              style={styles.header}
            >
              <Text style={styles.name}>{connection.name}</Text>
            </LinearGradient>

            {/* Social Media Section */}
            {socialMediasToShow.length > 0 && (
              <LinearGradient
                colors={colors.gradients.section}
                style={styles.section}
              >
                <Text style={styles.sectionTitle}>🔗 Social Media</Text>
                <View style={styles.socialMediaContainer}>
                  {socialMediasToShow.map((socialMedia, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        handleSocialMediaPress(socialMedia.url || "")
                      }
                      style={styles.socialMediaItem}
                    >
                      <LinearGradient
                        colors={colors.gradients.primary}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.socialMediaGradient}
                      >
                        <Text style={styles.socialMediaPlatform}>
                          {socialMediaDisplayNames[socialMedia.type] ||
                            socialMedia.type}
                        </Text>
                        <Text style={styles.socialMediaHandle}>
                          @{socialMedia.handle}
                        </Text>
                      </LinearGradient>
                      <Text style={styles.socialMediaSubtext}>Tap to open</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            )}

            {/* Meeting Details */}
            <LinearGradient
              colors={colors.gradients.section}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>🤝 Meeting Details</Text>
              <View style={styles.detailContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📍 Where:</Text>
                  <Text style={styles.detailValue}>{connection.metAt}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>📅 When:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(connection.metWhen)}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Facts Section */}
            <LinearGradient
              colors={colors.gradients.section}
              style={styles.section}
            >
              <Text style={styles.sectionTitle}>💡 Facts & Insights</Text>
              <View style={styles.factsContainer}>
                {connection.facts.map((fact, index) => (
                  <View key={index} style={styles.factItem}>
                    <View style={styles.factDot} />
                    <Text style={styles.factText}>{fact}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            {/* Timestamps */}
            <LinearGradient
              colors={colors.gradients.dark}
              style={styles.timestampSection}
            >
              <Text style={styles.timestampTitle}>📊 Record Info</Text>
              <View style={styles.timestampContainer}>
                <View style={styles.timestampRow}>
                  <Text style={styles.timestampLabel}>Added:</Text>
                  <Text style={styles.timestampValue}>
                    {formatShortDate(connection.createdAt)}
                  </Text>
                </View>
                <View style={styles.timestampRow}>
                  <Text style={styles.timestampLabel}>Updated:</Text>
                  <Text style={styles.timestampValue}>
                    {formatShortDate(connection.updatedAt)}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                title="Edit"
                onPress={handleEdit}
                variant="ghost"
                style={styles.actionButton}
              />
              <Button
                icon={<Ionicons name="trash" size={20} color="#ffffff" />}
                onPress={handleDelete}
                variant="danger"
                style={styles.actionButton}
                iconOnly
              />
            </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: typography.size['2xl'],
    color: colors.text.accent,
    fontWeight: typography.weight.semibold,
  },
  errorTitle: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: typography.size.xl,
    color: colors.text.error,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  header: {
    borderRadius: borderRadius.lg,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.lg,
  },
  name: {
    fontSize: typography.size['5xl'],
    fontWeight: typography.weight.extrabold,
    color: colors.text.primary,
    marginBottom: 16,
    letterSpacing: typography.letterSpacing.wide,
  },
  section: {
    borderRadius: borderRadius.lg,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.accent,
    marginBottom: 16,
    letterSpacing: typography.letterSpacing.wide,
  },
  socialMediaContainer: {
    gap: 12,
  },
  socialMediaItem: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: "hidden",
  },
  socialMediaGradient: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  socialMediaPlatform: {
    fontSize: typography.size.xl,
    color: colors.text.onAccent,
    fontWeight: typography.weight.bold,
  },
  socialMediaHandle: {
    fontSize: typography.size.xl,
    color: colors.text.onAccent,
    fontWeight: typography.weight.semibold,
  },
  socialMediaSubtext: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontStyle: "italic",
    textAlign: "center",
    alignSelf: "center",
  },
  detailContainer: {
    backgroundColor: colors.background.surface,
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.text.muted,
    width: 80,
  },
  detailValue: {
    fontSize: typography.size.lg,
    color: colors.text.primary,
    flex: 1,
    fontWeight: typography.weight.medium,
    lineHeight: 22,
  },
  factsContainer: {
    backgroundColor: colors.background.surface,
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  factItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  factDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.accent,
    marginTop: 8,
    marginRight: 16,
  },
  factText: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  timestampSection: {
    borderRadius: borderRadius.md,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  timestampTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.muted,
    marginBottom: 12,
  },
  timestampContainer: {
    gap: 8,
  },
  timestampRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timestampLabel: {
    fontSize: typography.size.base,
    color: colors.text.muted,
  },
  timestampValue: {
    fontSize: typography.size.base,
    color: colors.slate[400],
    fontWeight: typography.weight.medium,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: 44,
  },
});

export default ConnectionDetailScreen;
