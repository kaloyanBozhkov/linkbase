import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { useConnectionStore } from "../hooks/useConnectionStore";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import ConnectionCard from "../components/molecules/ConnectionCard";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const {
    connections,
    error,
    searchQuery,
    fetchConnections,
    setSearchQuery,
    deleteConnection,
    clearError,
  } = useConnectionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState(searchQuery);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchText);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchText, setSearchQuery]);

  // Sync searchText with searchQuery when it changes externally (e.g., from refresh)
  useEffect(() => {
    setSearchText(searchQuery);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchConnections();
    }, [fetchConnections])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    // Respect current search state - if searching, re-run search; if not, fetch all
    if (searchText.trim()) {
      // Re-trigger the current search
      setSearchQuery(searchText);
    } else {
      // No search active, fetch all connections
      await fetchConnections();
    }
    setRefreshing(false);
  };

  const handleDeleteConnection = (id: string, name: string) => {
    Alert.alert(
      "Delete Connection",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteConnection(id),
        },
      ]
    );
  };

  const renderConnectionCard = ({ item }: { item: any }) => (
    <ConnectionCard
      connection={item}
      onPress={() =>
        navigation.navigate("ConnectionDetail", { connectionId: item.id })
      }
      onEdit={() =>
        navigation.navigate("EditConnection", { connectionId: item.id })
      }
      onDelete={() => handleDeleteConnection(item.id, item.name)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {searchText ? "🔍 No Results" : "🌟 Start Building"}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchText
          ? "No connections found matching your search. Try different keywords."
          : "Your connection network is empty. Add your first connection and start building meaningful relationships!"}
      </Text>
      {!searchText && (
        <Button
          title="Add First Connection"
          onPress={() => navigation.navigate("AddConnection")}
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );

  if (error) {
    return (
      <LinearGradient colors={["#0a0d14", "#1e293b"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ Connection Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Try Again"
              onPress={() => {
                clearError();
                // Respect current search state when retrying
                if (searchText.trim()) {
                  setSearchQuery(searchText);
                } else {
                  fetchConnections();
                }
              }}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#0a0d14", "#1e293b"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Linkbase</Text>
          <Text style={styles.headerSubtitle}>Your Connection Network</Text>

          <Input
            placeholder="Search connections by name or facts..."
            value={searchText}
            onChangeText={setSearchText}
            containerStyle={styles.searchContainer}
          />
          <Button
            title="Add Connection"
            onPress={() => navigation.navigate("AddConnection")}
            style={styles.addButton}
          />
        </View>

        <FlatList
          data={connections}
          renderItem={renderConnectionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00f5ff"
              colors={["#00f5ff", "#bf00ff"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
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
    borderBottomColor: "#334155",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e2e8f0",
    marginBottom: 4,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
    fontWeight: "500",
  },
  searchContainer: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
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
});

export default HomeScreen;
