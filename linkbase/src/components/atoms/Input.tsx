import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { colors, shadows, typography, borderRadius } from "@/theme/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        placeholderTextColor={colors.input.placeholder}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginBottom: 8,
    color: colors.input.label,
    letterSpacing: typography.letterSpacing.wide,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.input.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: typography.size.xl,
    backgroundColor: colors.input.background,
    color: colors.input.text,
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.input.borderFocus,
    shadowColor: colors.input.borderFocus,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inputError: {
    borderColor: colors.input.borderError,
    shadowColor: colors.input.borderError,
    shadowOpacity: 0.3,
  },
  errorText: {
    color: colors.text.error,
    fontSize: typography.size.base,
    marginTop: 6,
    fontWeight: typography.weight.medium,
  },
});

export default Input;
