import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
          colors={["#00f5ff", "#bf00ff"]}
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
    borderRadius: 12,
    shadowColor: "#00f5ff",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    backgroundColor: "#334155",
    borderWidth: 1,
    borderColor: "#475569",
  },
  danger: {
    backgroundColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOpacity: 0.4,
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#00f5ff",
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
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  primaryText: {
    color: "#0a0d14",
    fontWeight: "700",
  },
  secondaryText: {
    color: "#e2e8f0",
  },
  dangerText: {
    color: "#ffffff",
  },
  ghostText: {
    color: "#00f5ff",
  },
});

export default Button;
