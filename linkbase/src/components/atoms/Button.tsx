import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadows, typography, borderRadius } from "@/theme/colors";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconOnly?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  style,
  textStyle,
  icon,
  iconOnly = false,
}) => {
  const renderButton = () => {
    if (variant === "primary") {
      return (
        <LinearGradient
          colors={colors.button.primary.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.button,
            styles[size],
            iconOnly && styles.iconButton,
            disabled && styles.disabled,
            style,
          ]}
        >
          {icon && <>{icon}</>}
          {title && !iconOnly && (
            <Text style={[styles.text, styles.primaryText, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles[variant],
          styles[size],
          iconOnly && styles.iconButton,
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon && <>{icon}</>}
        {title && !iconOnly && (
          <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.gradientContainer, disabled && styles.disabled]}
      >
        {renderButton()}
      </TouchableOpacity>
    );
  }

  return renderButton();
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: borderRadius.md,
    ...shadows.accent,
  },
  button: {
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    ...shadows.md,
  },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minWidth: 44,
    minHeight: 44,
  },
  primary: {
    // This is handled by LinearGradient
  },
  secondary: {
    backgroundColor: colors.button.secondary.background,
    borderWidth: 1,
    borderColor: colors.button.secondary.border,
  },
  danger: {
    backgroundColor: colors.button.danger.background,
    ...shadows.danger,
  },
  ghost: {
    backgroundColor: colors.button.ghost.background,
    borderWidth: 1,
    borderColor: colors.button.ghost.border,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.weight.semibold,
    fontSize: typography.size.xl,
    letterSpacing: typography.letterSpacing.wide,
  },
  primaryText: {
    color: colors.button.primary.text,
    fontWeight: typography.weight.bold,
  },
  secondaryText: {
    color: colors.button.secondary.text,
  },
  dangerText: {
    color: colors.button.danger.text,
  },
  ghostText: {
    color: colors.button.ghost.text,
  },
});

export default Button;
