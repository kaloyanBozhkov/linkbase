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
import { Connection } from "../../hooks/useConnectionStore";

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
  const handleInstagramPress = () => {
    if (connection.igUrl) {
      Linking.openURL(connection.igUrl);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            {connection.igHandle && (
              <TouchableOpacity
                onPress={handleInstagramPress}
                style={styles.igContainer}
              >
                <LinearGradient
                  colors={["#00f5ff", "#bf00ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.igGradient}
                >
                  <Text style={styles.igHandle}>@{connection.igHandle}</Text>
                </LinearGradient>
              </TouchableOpacity>
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
            <Text style={styles.factsLabel}>💡 Facts</Text>
            <View style={styles.factsList}>
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
            onPress={onDelete}
            variant="danger"
            size="small"
            style={styles.deleteButton}
            icon={<Ionicons name="trash-outline" size={18} color="white" />}
            iconOnly={true}
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
  igContainer: {
    alignSelf: "flex-start",
  },
  igGradient: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  igHandle: {
    fontSize: 14,
    color: "#0a0d14",
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
  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },
  actionButton: {
    minWidth: 70,
  },
  deleteButton: {
    minWidth: 44,
    shadowColor: "#dc2626",
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});

export default ConnectionCard;
