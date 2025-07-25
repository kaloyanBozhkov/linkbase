import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import type { SocialMedia } from "@linkbase/prisma";
import { SocialMediaType } from "@linkbase/prisma/client/enums";
import { socialMediaDisplayNames } from "@/helpers/constants";
import { colors, shadows, typography, borderRadius } from "@/theme/colors";

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Accept various phone formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

const getInputConfig = (type: SocialMediaType) => {
  switch (type) {
    case SocialMediaType.EMAIL:
      return {
        label: "Email Address",
        placeholder: "user@example.com",
        keyboardType: "email-address" as const,
        autoCapitalize: "none" as const,
      };
    case SocialMediaType.PHONE:
      return {
        label: "Phone Number",
        placeholder: "+1 (555) 123-4567",
        keyboardType: "phone-pad" as const,
        autoCapitalize: "none" as const,
      };
    default:
      return {
        label: "Handle/Username",
        placeholder: "@username or handle",
        keyboardType: "default" as const,
        autoCapitalize: "none" as const,
      };
  }
};

interface SocialMediaSectionProps {
  socialMedias: SocialMedia[];
  onUpdateSocialMedias: (socialMedias: SocialMedia[]) => void;
  error?: string;
}

const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  socialMedias,
  onUpdateSocialMedias,
  error,
}) => {
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(
    null
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});

  const addSocialMedia = () => {
    onUpdateSocialMedias([
      ...socialMedias,
      { type: SocialMediaType.EMAIL, handle: "" } as SocialMedia,
    ]);
  };

  const removeSocialMedia = (index: number) => {
    if (socialMedias.length > 0) {
      onUpdateSocialMedias(socialMedias.filter((_, i) => i !== index));
      // Clear validation error for removed item
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      // Reindex remaining errors
      const reindexedErrors: Record<number, string> = {};
      Object.keys(newErrors).forEach((key) => {
        const keyNum = parseInt(key);
        if (keyNum > index) {
          reindexedErrors[keyNum - 1] = newErrors[keyNum];
        } else {
          reindexedErrors[keyNum] = newErrors[keyNum];
        }
      });
      setValidationErrors(reindexedErrors);
    }
  };

  const updateSocialMedia = (
    index: number,
    field: keyof SocialMedia,
    value: any
  ) => {
    onUpdateSocialMedias(
      socialMedias.map((sm, i) =>
        i === index ? { ...sm, [field]: value } : sm
      )
    );

    // Clear validation error when user starts typing
    if (field === "handle" && validationErrors[index]) {
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    }
  };

  const validateSocialMediaHandle = (
    type: SocialMediaType,
    handle: string
  ): string | null => {
    if (!handle.trim()) return "This field is required";

    switch (type) {
      case SocialMediaType.EMAIL:
        return validateEmail(handle)
          ? null
          : "Please enter a valid email address";
      case SocialMediaType.PHONE:
        return validatePhone(handle)
          ? null
          : "Please enter a valid phone number";
      default:
        return null;
    }
  };

  const handleBlur = (index: number, type: SocialMediaType, handle: string) => {
    const error = validateSocialMediaHandle(type, handle);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [index]: error }));
    }
  };

  const getSortedSocialMediaTypes = () => {
    return Object.values(SocialMediaType).sort((a, b) => {
      // Put EMAIL and PHONE at the top
      if (a === SocialMediaType.EMAIL) return -1;
      if (b === SocialMediaType.EMAIL) return 1;
      if (a === SocialMediaType.PHONE) return -1;
      if (b === SocialMediaType.PHONE) return 1;
      return socialMediaDisplayNames[a].localeCompare(
        socialMediaDisplayNames[b]
      );
    });
  };

  const CustomPicker = ({
    selectedValue,
    onValueChange,
    index,
  }: {
    selectedValue: SocialMediaType;
    onValueChange: (value: SocialMediaType) => void;
    index: number;
  }) => {
    const isOpen = activePickerIndex === index;
    const sortedTypes = getSortedSocialMediaTypes();

    const selectOption = (value: SocialMediaType) => {
      onValueChange(value);
      setActivePickerIndex(null);
      // Clear validation error when type changes
      const newErrors = { ...validationErrors };
      delete newErrors[index];
      setValidationErrors(newErrors);
    };

    return (
      <>
        <TouchableOpacity
          style={styles.customPickerButton}
          onPress={() => setActivePickerIndex(isOpen ? null : index)}
        >
          <Text style={styles.customPickerText}>
            {socialMediaDisplayNames[selectedValue]}
          </Text>
          <Text style={styles.customPickerArrow}>{isOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setActivePickerIndex(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActivePickerIndex(null)}
          >
            <View style={styles.modalContent}>
              <LinearGradient
                colors={colors.gradients.dark}
                style={styles.pickerModal}
              >
                <Text style={styles.pickerModalTitle}>Select Contact Type</Text>
                <FlatList
                  data={sortedTypes}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.pickerOption,
                        selectedValue === item && styles.pickerOptionSelected,
                      ]}
                      onPress={() => selectOption(item)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedValue === item &&
                            styles.pickerOptionTextSelected,
                        ]}
                      >
                        {socialMediaDisplayNames[item]}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

  return (
    <View style={styles.section}>
      <LinearGradient
        colors={colors.gradients.section}
        style={styles.sectionContent}
      >
        <Text style={styles.sectionTitle}>🔗 Contact & Social (Optional)</Text>
        {error && <Text style={styles.errorText}>{error}</Text>}

        {socialMedias.length === 0 && (
          <Text style={styles.emptyText}>
            No contact or social media added yet
          </Text>
        )}

        {socialMedias.map((socialMedia, index) => {
          const inputConfig = getInputConfig(socialMedia.type);
          return (
            <View key={index} style={styles.socialMediaRow}>
              <View style={styles.socialMediaContent}>
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Contact Type</Text>
                  <CustomPicker
                    selectedValue={socialMedia.type}
                    onValueChange={(value: SocialMediaType) =>
                      updateSocialMedia(index, "type", value)
                    }
                    index={index}
                  />
                </View>

                <Input
                  label={inputConfig.label}
                  value={socialMedia.handle}
                  onChangeText={(text) =>
                    updateSocialMedia(index, "handle", text)
                  }
                  onBlur={() =>
                    handleBlur(index, socialMedia.type, socialMedia.handle)
                  }
                  placeholder={inputConfig.placeholder}
                  keyboardType={inputConfig.keyboardType}
                  autoCapitalize={inputConfig.autoCapitalize}
                  containerStyle={styles.handleInput}
                  error={validationErrors[index]}
                />
              </View>

              <Button
                icon={<Ionicons name="trash" size={18} color="#ffffff" />}
                onPress={() => removeSocialMedia(index)}
                variant="danger"
                size="small"
                style={styles.removeButton}
                iconOnly
              />
            </View>
          );
        })}

        <Button
          title="+ Add Contact or Social"
          onPress={addSocialMedia}
          variant="ghost"
          style={styles.addButton}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionContent: {
    padding: 20,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    marginBottom: 16,
    color: colors.text.accent,
    letterSpacing: typography.letterSpacing.wide,
  },
  errorText: {
    color: colors.text.error,
    fontSize: typography.size.base,
    marginBottom: 12,
    fontWeight: typography.weight.medium,
  },
  emptyText: {
    color: colors.text.muted,
    fontSize: typography.size.base,
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  socialMediaRow: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  socialMediaContent: {
    flex: 1,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginBottom: 8,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.wide,
  },
  customPickerButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customPickerText: {
    color: colors.text.accent,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
    flex: 1,
  },
  customPickerArrow: {
    color: colors.text.accent,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxHeight: "60%",
    borderRadius: borderRadius.lg,
    overflow: "hidden",
    ...shadows.lg,
  },
  pickerModal: {
    padding: 20,
  },
  pickerModalTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.text.accent,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: typography.letterSpacing.wide,
  },
  pickerOption: {
    padding: 16,
    borderRadius: borderRadius.sm,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: colors.background.tertiary,
  },
  pickerOptionText: {
    color: colors.text.primary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.medium,
  },
  pickerOptionTextSelected: {
    color: colors.text.accent,
    fontWeight: typography.weight.semibold,
  },
  handleInput: {
    marginBottom: 0,
  },
  removeButton: {
    alignSelf: "flex-end",
    minWidth: 44,
  },
  addButton: {
    marginTop: 12,
  },
});

export default SocialMediaSection;
