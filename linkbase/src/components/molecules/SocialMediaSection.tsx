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

interface SocialMediaSectionProps {
  socialMedias: SocialMedia[];
  onUpdateSocialMedias: (socialMedias: SocialMedia[]) => void;
  error?: string;
}

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
                colors={["#0f172a", "#1e293b"]}
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
        colors={["#1e293b", "#334155"]}
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#475569",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#00f5ff",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 16,
    textAlign: "center",
  },
  socialMediaRow: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  socialMediaContent: {
    flex: 1,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#e2e8f0",
    letterSpacing: 0.5,
  },
  customPickerButton: {
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#475569",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customPickerText: {
    color: "#00f5ff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  customPickerArrow: {
    color: "#00f5ff",
    fontSize: 14,
    fontWeight: "600",
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
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pickerModal: {
    padding: 20,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#00f5ff",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  pickerOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerOptionSelected: {
    backgroundColor: "#334155",
  },
  pickerOptionText: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "500",
  },
  pickerOptionTextSelected: {
    color: "#00f5ff",
    fontWeight: "600",
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
