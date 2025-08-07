import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors, typography } from "@/theme/colors";
import { ActivityIndicator } from "react-native-paper";

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
}) => {
  const renderSearchButtonContent = () => {
    if (isSearching) {
      return <ActivityIndicator size={16} color={colors.text.onAccent} />;
    }
    return (
      <Text style={[styles.searchButtonText, buttonTextStyle]}>Search</Text>
    );
  };

  return (
    <View style={[styles.searchBar, containerStyle]}>
      <TextInput
        style={[styles.searchInput, inputStyle]}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchQueryChange}
        placeholderTextColor={colors.text.muted}
        onSubmitEditing={onSearch}
        returnKeyType="search"
        autoFocus={autoFocus}
        editable={!isSearching}
      />
      <TouchableOpacity
        onPress={onSearch}
        style={[styles.searchButton, buttonStyle]}
        disabled={isSearching || !searchQuery.trim()}
      >
        {renderSearchButtonContent()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    backgroundColor: colors.background.surface,
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
    borderColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.lg,
    color: colors.text.primary,
    paddingRight: 12,
  },
  searchButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: colors.text.onAccent,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});

export default SearchBar;
