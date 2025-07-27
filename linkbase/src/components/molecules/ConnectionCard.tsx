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
import type { RouterOutput } from "@linkbase/backend/src/trpc/routers";
import { socialMediaDisplayNames } from "@/helpers/constants";
import { formatDate } from "@linkbase/shared/src/date";
import { colors, shadows, typography, borderRadius } from "@/theme/colors";

interface ConnectionCardProps {
  connection: NonNullable<RouterOutput["linkbase"]["connections"]["getById"]>;
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
  const handleSocialMediaPress = (url: string) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  const getSocialMediasToShow = () => {
    return connection.social_medias || [];
  };

  const socialMediasToShow = getSocialMediasToShow();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={colors.gradients.section}
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
                      colors={colors.gradients.primary}
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
            <Text style={styles.date}>{formatDate(connection.created_at)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.locationContainer}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{connection.met_at}</Text>
          </View>

          <View style={styles.factsContainer}>
            <Text style={styles.factsLabel}>💡 Notes</Text>
            <View style={styles.factsList}>
              {connection.facts && connection.facts.length > 0 ? (
                <>
                  {connection.facts.slice(0, 2).map((fact) => (
                    <View key={fact.id} style={styles.factItem}>
                      <View style={styles.factDot} />
                      <Text style={styles.fact}>{fact.text}</Text>
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
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.lg,
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
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 8,
    letterSpacing: typography.letterSpacing.wide,
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
    borderRadius: borderRadius.sm,
  },
  socialMediaText: {
    fontSize: typography.size.xs,
    color: colors.text.onAccent,
    fontWeight: typography.weight.semibold,
  },
  moreSocialMedia: {
    backgroundColor: colors.border.default,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  moreSocialMediaText: {
    fontSize: typography.size.xs,
    color: colors.text.secondary,
    fontWeight: typography.weight.semibold,
  },
  dateContainer: {
    backgroundColor: colors.border.default,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  date: {
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
  },
  cardBody: {
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: colors.background.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  locationIcon: {
    fontSize: typography.size.xl,
    marginRight: 8,
  },
  location: {
    fontSize: typography.size.lg,
    color: colors.text.secondary,
    fontWeight: typography.weight.medium,
    flex: 1,
  },
  factsContainer: {
    backgroundColor: colors.background.surface,
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  factsLabel: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    color: colors.text.accent,
    marginBottom: 12,
    letterSpacing: typography.letterSpacing.wide,
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
    backgroundColor: colors.text.accent,
    marginTop: 6,
    marginRight: 12,
  },
  fact: {
    fontSize: typography.size.base,
    color: colors.text.secondary,
    lineHeight: 20,
    flex: 1,
  },
  moreFacts: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  noFacts: {
    fontSize: typography.size.sm,
    color: colors.text.muted,
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
