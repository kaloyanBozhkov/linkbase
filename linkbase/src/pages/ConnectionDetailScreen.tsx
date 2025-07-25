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
      <LinearGradient colors={["#0a0d14", "#1e293b"]} style={styles.container}>
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
      <LinearGradient colors={["#0a0d14", "#1e293b"]} style={styles.container}>
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
    <LinearGradient colors={["#0a0d14", "#1e293b"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header Section */}
            <LinearGradient
              colors={["#1e293b", "#334155"]}
              style={styles.header}
            >
              <Text style={styles.name}>{connection.name}</Text>
            </LinearGradient>

            {/* Social Media Section */}
            {socialMediasToShow.length > 0 && (
              <LinearGradient
                colors={["#1e293b", "#334155"]}
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
                        colors={["#00f5ff", "#bf00ff"]}
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
              colors={["#1e293b", "#334155"]}
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
              colors={["#1e293b", "#334155"]}
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
              colors={["#0f172a", "#1e293b"]}
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
    fontSize: 18,
    color: "#00f5ff",
    fontWeight: "600",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  header: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#475569",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e2e8f0",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#475569",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#00f5ff",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  socialMediaContainer: {
    gap: 12,
  },
  socialMediaItem: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden",
  },
  socialMediaGradient: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  socialMediaPlatform: {
    fontSize: 16,
    color: "#0a0d14",
    fontWeight: "700",
  },
  socialMediaHandle: {
    fontSize: 16,
    color: "#0a0d14",
    fontWeight: "600",
  },
  socialMediaSubtext: {
    fontSize: 12,
    color: "#64748b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontStyle: "italic",
    textAlign: "center",
    alignSelf: "center",
  },
  detailContainer: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
    width: 80,
  },
  detailValue: {
    fontSize: 15,
    color: "#e2e8f0",
    flex: 1,
    fontWeight: "500",
    lineHeight: 22,
  },
  factsContainer: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
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
    backgroundColor: "#00f5ff",
    marginTop: 8,
    marginRight: 16,
  },
  factText: {
    fontSize: 15,
    color: "#cbd5e1",
    flex: 1,
    lineHeight: 22,
  },
  timestampSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#334155",
  },
  timestampTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
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
    fontSize: 14,
    color: "#64748b",
  },
  timestampValue: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
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
