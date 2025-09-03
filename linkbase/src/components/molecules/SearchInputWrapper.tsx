import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors as baseColors, shadows, borderRadius } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";

interface SearchInputWrapperProps {
  children: React.ReactNode;
  isSearching: boolean;
  hasSearched: boolean;
  searchQuery: string;
  onSearch: () => void;
  onClear: () => void;
  containerStyle?: any;
}

const SearchInputWrapper: React.FC<SearchInputWrapperProps> = ({
  children,
  isSearching,
  hasSearched,
  searchQuery,
  onSearch,
  onClear,
  containerStyle,
}) => {
  const { colors } = useThemeStore();
  
  const renderIcon = () => {
    if (isSearching) {
      return <ActivityIndicator size={20} color={colors.text.accent} style={{ marginTop: 4, marginBottom: 4 }} />;
    }
    
    if (hasSearched) {
      return (
        <TouchableOpacity onPress={onClear} style={styles.iconButton}>
          <Ionicons name="close" size={20} color={colors.text.muted} />
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity 
        onPress={onSearch} 
        style={styles.iconButton}
        disabled={!searchQuery.trim()}
      >
        <Ionicons 
          name="search" 
          size={20} 
          color={searchQuery.trim() ? colors.text.muted : colors.text.disabled} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {children}
      {renderIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: baseColors.border.default,
    borderRadius: borderRadius.md,
    backgroundColor: baseColors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadows.sm,
  },
  iconButton: {
    padding: 4,
  },
});

export default SearchInputWrapper; 