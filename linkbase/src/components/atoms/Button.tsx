import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { shadows, typography, borderRadius } from "@/theme/colors";
import { useThemeStore } from "@/hooks/useThemeStore";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large" | "xsmall";
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
  const { colors } = useThemeStore();

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
            <Text style={[styles.text, { color: colors.button.primary.text, fontWeight: typography.weight.bold }, textStyle]}>
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
          // dynamic variant styles
          variant === "secondary" && {
            backgroundColor: colors.button.secondary.background,
            borderWidth: 1,
            borderColor: colors.button.secondary.border,
          },
          variant === "danger" && {
            backgroundColor: colors.button.danger.background,
            ...(shadows.danger as any),
          },
          variant === "ghost" && {
            backgroundColor: colors.button.ghost.background,
            borderWidth: 1,
            borderColor: colors.button.ghost.border,
          },
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
          <Text
            style={[
              styles.text,
              variant === "secondary" && { color: colors.button.secondary.text },
              variant === "danger" && { color: colors.button.danger.text },
              variant === "ghost" && { color: colors.button.ghost.text },
              textStyle,
            ]}
          >
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
  secondary: {},
  danger: {},
  ghost: {},
  xsmall: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    minWidth: 4,
    minHeight: 4,
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
  primaryText: {},
  secondaryText: {},
  dangerText: {},
  ghostText: {},
});

export default Button;
