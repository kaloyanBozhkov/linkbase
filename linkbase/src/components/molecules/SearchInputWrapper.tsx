import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
  const renderIcon = () => {
    if (isSearching) {
      return <ActivityIndicator size={20} color="#00f5ff" style={{ marginTop: 4, marginBottom: 4 }} />;
    }
    
    if (hasSearched) {
      return (
        <TouchableOpacity onPress={onClear} style={styles.iconButton}>
          <Ionicons name="close" size={20} color="#64748b" />
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
          color={searchQuery.trim() ? "#64748b" : "#475569"} 
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
    borderColor: "#475569",
    borderRadius: 12,
    backgroundColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  iconButton: {
    padding: 4,
  },
});

export default SearchInputWrapper; 