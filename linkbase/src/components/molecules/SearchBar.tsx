import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors as baseColors, typography } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";
import { ActivityIndicator } from "react-native-paper";
import { useTranslation } from "@/hooks/useTranslation";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (text: string) => void;
  onSearch: () => void;
  isSearching?: boolean;
  placeholder?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  autoFocus?: boolean;
  hasSearched?: boolean;
  onClearSearch?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isSearching = false,
  placeholder = "Search by facts or questions...",
  containerStyle,
  inputStyle,
  buttonStyle,
  buttonTextStyle,
  autoFocus = true,
  hasSearched = false,
  onClearSearch,
}) => {
  const { t } = useTranslation();
  const lastSubmittedQueryRef = useRef<string>("");
  const { colors } = useThemeStore();

  // Reset the last submitted query whenever the active search is cleared externally
  useEffect(() => {
    if (!hasSearched) {
      lastSubmittedQueryRef.current = "";
    }
  }, [hasSearched]);

  // If a search is already active when mounting or toggling into searched state,
  // initialize the last submitted query to match the current value so the button shows Clear.
  useEffect(() => {
    if (hasSearched && !lastSubmittedQueryRef.current) {
      lastSubmittedQueryRef.current = searchQuery;
    }
  }, [hasSearched, searchQuery]);

  const isDirty = useMemo(() => {
    if (!hasSearched) return false;
    return searchQuery.trim() !== lastSubmittedQueryRef.current.trim();
  }, [hasSearched, searchQuery]);

  const shouldShowClear = useMemo(() => {
    return hasSearched && !isDirty && !isSearching;
  }, [hasSearched, isDirty, isSearching]);

  const handlePress = () => {
    if (shouldShowClear) {
      onClearSearch?.();
      return;
    }
    // Record what we searched for so we can detect dirty state
    lastSubmittedQueryRef.current = searchQuery;
    onSearch();
  };

  const renderSearchButtonContent = () => {
    if (isSearching) {
      return <ActivityIndicator size={16} color={colors.text.onAccent} />;
    }
    return (
      <Text style={[styles.searchButtonText, buttonTextStyle]}>
        {shouldShowClear ? t("common.clear") : t("search.search")}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.searchBar,
        {
          backgroundColor: colors.background.surface,
          borderColor: colors.border.light,
        },
        containerStyle,
      ]}
    >
      <TextInput
        style={[styles.searchInput, { color: colors.text.primary }, inputStyle]}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholderTextColor={colors.text.muted}
        onSubmitEditing={() => {
          lastSubmittedQueryRef.current = searchQuery;
          onSearch();
        }}
        returnKeyType="search"
        autoFocus={autoFocus}
        editable={!isSearching}
      />
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.searchButton,
          { backgroundColor: colors.background.accent },
          buttonStyle,
        ]}
        disabled={isSearching || (!shouldShowClear && !searchQuery.trim())}
      >
        {renderSearchButtonContent()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    backgroundColor: baseColors.background.surface,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: baseColors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.lg,
    color: baseColors.text.primary,
    paddingRight: 12,
  },
  searchButton: {
    backgroundColor: baseColors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: baseColors.text.onAccent,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});

export default SearchBar;
