import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";
import ConnectionCard from "../components/molecules/ConnectionCard";
import { rateApp } from "../hooks/useRateApp";
import { trpc, updateInfiniteQueryDataOnDelete } from "@/utils/trpc";
import { minutesToMillis } from "@linkbase/shared/src/duration";
import { getInfiniteQueryItems } from "@/hooks/getInfiniteQueryItems";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const trpcUtils = trpc.useUtils();
  const getAllQuery = trpc.linkbase.connections.getAll.useInfiniteQuery(
    {},
    {
      staleTime: minutesToMillis(2),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const { mutateAsync: deleteConnection } =
    trpc.linkbase.connections.delete.useMutation();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchText = useDebouncedValue(searchQuery, 500);
  const searchItemsQuery = trpc.linkbase.connections.search.useInfiniteQuery(
    { query: debouncedSearchText },
    {
      staleTime: minutesToMillis(2),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: !debouncedSearchText,
    }
  );
  const {
    data: connectionsData,
    isLoading: isLoadingConnections,
    error: errorConnections,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = debouncedSearchText ? searchItemsQuery : getAllQuery;
  const connections = getInfiniteQueryItems(connectionsData);

  useEffect(() => {
    if (!connections.length) return;
    rateApp();
  }, [connections]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Respect current search state - if searching, re-run search; if not, fetch all
    if (debouncedSearchText.trim()) {
      await trpcUtils.linkbase.connections.search.invalidate();
    } else {
      // No search active, fetch all connections
      await trpcUtils.linkbase.connections.getAll.invalidate();
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
          onPress: () =>
            deleteConnection(
              { id },
              {
                onSuccess: () => {
                  updateInfiniteQueryDataOnDelete(
                    trpcUtils,
                    ["linkbase", "connections", "getAll"],
                    id
                  );
                },
                onError: (error) => {
                  Alert.alert(
                    "Error",
                    error.message || "Failed to delete connection"
                  );
                },
              }
            ),
        },
      ]
    );
  };

  const renderConnectionCard = ({
    item,
  }: {
    item: (typeof connections)[number];
  }) => (
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
        {debouncedSearchText ? "🔍 No Results" : "🌟 Start Building"}
      </Text>
      <Text style={styles.emptyStateText}>
        {debouncedSearchText
          ? "No connections found matching your search. Try different keywords."
          : "Your connection network is empty. Add your first connection and start building meaningful relationships!"}
      </Text>
      {!debouncedSearchText && (
        <Button
          title="Add First Connection"
          onPress={() => navigation.navigate("AddConnection")}
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );

  if (errorConnections) {
    return (
      <LinearGradient colors={["#0a0d14", "#1e293b"]} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ Connection Error</Text>
            <Text style={styles.errorText}>{errorConnections.message}</Text>
            <Button
              title="Try Again"
              onPress={() => {
                // Respect current search state when retrying
                if (debouncedSearchText) {
                  trpcUtils.linkbase.connections.getAll.invalidate();
                } else {
                  trpcUtils.linkbase.connections.getAll.invalidate();
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
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchContainer}
          />
          <Button
            title="Add Connection"
            onPress={() => navigation.navigate("AddConnection")}
            style={styles.addButton}
          />
        </View>

        {isLoadingConnections ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00f5ff" />
          </View>
        ) : (
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
            onEndReached={() => {
              if (isFetchingNextPage || !hasNextPage) return;
              fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() =>
              isFetchingNextPage && hasNextPage ? (
                <ActivityIndicator size="large" color="#00f5ff" />
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
