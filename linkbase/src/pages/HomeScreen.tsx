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
import ConnectionCard from "../components/molecules/ConnectionCard";
import ActionsHeader from "../components/molecules/ActionsHeader";
import { rateApp } from "../hooks/useRateApp";
import { trpc, updateInfiniteQueryDataOnDelete } from "@/utils/trpc";
import { minutesToMillis } from "@linkbase/shared/src/duration";
import { getInfiniteQueryItems } from "@/hooks/getInfiniteQueryItems";
import { getErrorMessage } from "@/helpers/utils";
import { colors as baseColors, typography } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";
import { useOnboardingStore } from "@/hooks/useOnboardingStore";
import { useTranslation } from "@/hooks/useTranslation";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const trpcUtils = trpc.useUtils();
  const { colors } = useThemeStore();
  const { t } = useTranslation();
  const { isCompleted: isOnboardingCompleted } = useOnboardingStore();
  
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

  const connections = getInfiniteQueryItems(connectionsData);

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
    if (hasSearched && searchQuery.trim().length > 0) {
      await searchItemsQuery.refetch();
    } else {
      await trpcUtils.linkbase.connections.getAll.invalidate();
    }
    setRefreshing(false);
  };

  const handleDeleteConnection = (id: string, name: string) => {
    Alert.alert(
      t("connections.deleteConnection"),
      t("connections.deleteConnectionConfirm", { name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
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
                    t("common.error"),
                    error.message || t("home.failedToDelete")
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
      <Text style={[styles.emptyStateTitle, { color: colors.text.primary }]}>
        {hasSearched ? t("home.noResults") : t("home.startBuilding")}
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.text.muted }]}>
        {hasSearched
          ? t("home.noResultsFound")
          : t("home.emptyNetwork")}
      </Text>
      {!hasSearched && (
        <Button
          title={t("home.addFirstConnection")}
          onPress={() => navigation.navigate("AddConnection")}
          style={styles.emptyStateButton}
        />
      )}
    </View>
  );

  if (errorConnections) {
    return (
      <LinearGradient colors={colors.gradients.background} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorTitle, { color: colors.text.primary }]}>{t("home.connectionError")}</Text>
            <Text style={[styles.errorText, { color: colors.text.error }]}>
              {getErrorMessage(errorConnections)}
            </Text>
            <Button
              title={t("home.tryAgain")}
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

  return (
    <LinearGradient colors={colors.gradients.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ActionsHeader
          isSearching={isSearching}
          hasSearched={hasSearched}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
          onSearchQueryChange={setSearchQuery}
          onAddConnection={() => navigation.navigate("AddConnection")}
          onVoiceAddConnection={() => navigation.navigate("AddVoiceConnections")}
          onOpenSettings={() => navigation.navigate("Settings")}
        />
        {isLoadingConnections ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={baseColors.loading} />
          </View>
        ) : (
          <FlatList
            data={connections}
            renderItem={renderConnectionCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainerFloating}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={baseColors.loading}
                colors={[baseColors.loading, baseColors.secondary[500]]}
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
                <ActivityIndicator size="large" color={baseColors.loading} />
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
  listContainerFloating: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 120, // Add extra padding at bottom for search bar area
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
    color: baseColors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: typography.size.xl,
    color: baseColors.text.muted,
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
    color: baseColors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: typography.size.xl,
    color: baseColors.text.error,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
});

export default HomeScreen;
