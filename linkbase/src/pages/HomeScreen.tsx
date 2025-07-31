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
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import Button from "../components/atoms/Button";
import ConnectionCard from "../components/molecules/ConnectionCard";
import SearchInputWrapper from "../components/molecules/SearchInputWrapper";
import { rateApp } from "../hooks/useRateApp";
import { trpc, updateInfiniteQueryDataOnDelete } from "@/utils/trpc";
import { minutesToMillis } from "@linkbase/shared/src/duration";
import { getInfiniteQueryItems } from "@/hooks/getInfiniteQueryItems";
import { getErrorMessage } from "@/helpers/utils";
import { colors, typography, borderRadius } from "@/theme/colors";

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
      getNextPageParam: (lastPage) => {
        console.log("lastPage", lastPage);
        return lastPage.nextCursor;
      },
    }
  );

  const { mutateAsync: deleteConnection } =
    trpc.linkbase.connections.delete.useMutation();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchItemsQuery = trpc.linkbase.connections.search.useInfiniteQuery(
    { query: searchQuery },
    {
      staleTime: minutesToMillis(2),
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: false,
    }
  );

  // Handle search state changes
  useEffect(() => {
    if (searchItemsQuery.data && isSearching) {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, [searchItemsQuery.data, isSearching]);

  useEffect(() => {
    if (searchItemsQuery.error && isSearching) {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, [searchItemsQuery.error, isSearching]);

  // Auto-clear search when input becomes empty after a search
  useEffect(() => {
    if (!searchQuery.trim() && hasSearched) {
      setHasSearched(false);
      setIsSearching(false);
    }
  }, [searchQuery, hasSearched]);

  // Use search results if we've searched, otherwise use all connections
  const {
    data: connectionsData,
    isLoading: isLoadingConnections,
    error: errorConnections,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = hasSearched ? searchItemsQuery : getAllQuery;

  const connections = hasSearched
    ? getInfiniteQueryItems(searchItemsQuery.data)
    : getInfiniteQueryItems(connectionsData);

  useEffect(() => {
    if (!connections.length) return;
    rateApp();
  }, [connections]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    searchItemsQuery.refetch();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setHasSearched(false);
    setIsSearching(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (hasSearched && searchQuery.trim()) {
      // Re-run the search
      await searchItemsQuery.refetch();
    } else {
      // Fetch all connections
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
                  // Also update search results if we're in search mode
                  if (hasSearched) {
                    updateInfiniteQueryDataOnDelete(
                      trpcUtils,
                      ["linkbase", "connections", "search"],
                      id
                    );
                  }
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
  }) => {
    return (
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
  };
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {hasSearched ? "🔍 No Results" : "🌟 Start Building"}
      </Text>
      <Text style={styles.emptyStateText}>
        {hasSearched
          ? "No connections found matching your search. Try different keywords."
          : "Your connection network is empty. Add your first connection and start building meaningful relationships!"}
      </Text>
      {!hasSearched && (
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
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ Connection Error</Text>
            <Text style={styles.errorText}>{getErrorMessage(errorConnections)}</Text>
            <Button
              title="Try Again"
              onPress={() => {
                if (hasSearched && searchQuery.trim()) {
                  searchItemsQuery.refetch();
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

  const actionsHeader = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Linkbase</Text>
      <Text style={styles.headerSubtitle}>Your Connection Network</Text>

      <SearchInputWrapper
        isSearching={isSearching}
        hasSearched={hasSearched}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        containerStyle={styles.searchContainerWrapper}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search by facts or questions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.text.muted}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </SearchInputWrapper>

      <Button
        title="Add Connection"
        onPress={() => navigation.navigate("AddConnection")}
        style={styles.addButton}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {actionsHeader}
        {isLoadingConnections ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.loading} />
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
                tintColor={colors.loading}
                colors={[colors.loading, colors.secondary[500]]}
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
                <ActivityIndicator size="large" color={colors.loading} />
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
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.size["5xl"],
    fontWeight: typography.weight.extrabold,
    color: colors.text.primary,
    marginBottom: 4,
    letterSpacing: typography.letterSpacing.wider,
  },
  headerSubtitle: {
    fontSize: typography.size.xl,
    color: colors.text.muted,
    marginBottom: 20,
    fontWeight: typography.weight.medium,
  },
  searchContainerWrapper: {
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.xl,
    color: colors.text.primary,
    paddingRight: 8,
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
    fontSize: typography.size["4xl"],
    fontWeight: typography.weight.bold,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: typography.size.xl,
    color: colors.text.muted,
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
    fontSize: typography.size["4xl"],
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
});

export default HomeScreen;
