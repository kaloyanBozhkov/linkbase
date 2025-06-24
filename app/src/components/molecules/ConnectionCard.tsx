import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../atoms/Button";
import {
  Connection,
  socialMediaDisplayNames,
  SocialMediaType,
} from "../../hooks/useConnectionStore";

interface ConnectionCardProps {
  connection: Connection;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  connection,
  onPress,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSocialMediaPress = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const getSocialMediasToShow = () => {
    // Show legacy Instagram if it exists and no new social medias
    if (
      connection.igHandle &&
      (!connection.socialMedias || connection.socialMedias.length === 0)
    ) {
      return [
        {
          type: SocialMediaType.INSTAGRAM,
          handle: connection.igHandle,
          url: connection.igUrl,
        },
      ];
    }
    return connection.socialMedias || [];
  };

  const socialMediasToShow = getSocialMediasToShow();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={["#1e293b", "#334155"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{connection.name}</Text>
            {socialMediasToShow.length > 0 && (
              <View style={styles.socialMediaContainer}>
                {socialMediasToShow.slice(0, 3).map((socialMedia, index) => (
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
                      <Text style={styles.socialMediaText}>
                        {socialMediaDisplayNames[socialMedia.type] ||
                          socialMedia.type}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
                {socialMediasToShow.length > 3 && (
                  <View style={styles.moreSocialMedia}>
                    <Text style={styles.moreSocialMediaText}>
                      +{socialMediasToShow.length - 3}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate(connection.metWhen)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{connection.metAt}</Text>
          </View>

          <View style={styles.factsContainer}>
            <Text style={styles.factsLabel}>💡 Notes</Text>
            <View style={styles.factsList}>
              {connection.facts && connection.facts.length > 0 ? (
                <>
                  {connection.facts.slice(0, 2).map((fact, index) => (
                    <View key={index} style={styles.factItem}>
                      <View style={styles.factDot} />
                      <Text style={styles.fact}>{fact}</Text>
                    </View>
                  ))}
                  {connection.facts.length > 2 && (
                    <Text style={styles.moreFacts}>
                      +{connection.facts.length - 2} more insights
                    </Text>
                  )}
                </>
              ) : (
                <Text style={styles.noFacts}>
                  No notes added, click edit and some!
                </Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Button
            title="Edit"
            onPress={onEdit}
            variant="ghost"
            size="small"
            style={styles.actionButton}
          />
          <Button
            icon={<Ionicons name="trash" size={18} color="#ffffff" />}
            onPress={onDelete}
            variant="danger"
            size="small"
            style={styles.actionButton}
            iconOnly
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  socialMediaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  socialMediaItem: {
    marginBottom: 4,
  },
  socialMediaGradient: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  socialMediaText: {
    fontSize: 11,
    color: "#0a0d14",
    fontWeight: "600",
  },
  moreSocialMedia: {
    backgroundColor: "#475569",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  moreSocialMediaText: {
    fontSize: 11,
    color: "#cbd5e1",
    fontWeight: "600",
  },
  dateContainer: {
    backgroundColor: "#475569",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  date: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  cardBody: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  location: {
    fontSize: 15,
    color: "#cbd5e1",
    fontWeight: "500",
    flex: 1,
  },
  factsContainer: {
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  factsLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#00f5ff",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  factsList: {
    gap: 8,
  },
  factItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  factDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00f5ff",
    marginTop: 6,
    marginRight: 12,
  },
  fact: {
    fontSize: 14,
    color: "#cbd5e1",
    lineHeight: 20,
    flex: 1,
  },
  moreFacts: {
    fontSize: 13,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  noFacts: {
    fontSize: 13,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    minWidth: 44,
  },
});

export default ConnectionCard;
