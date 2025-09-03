import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Button from "../atoms/Button";
import Input from "../atoms/Input";
import SocialMediaSection from "./SocialMediaSection";
import { camelCaseWords } from "@/helpers/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { typography, borderRadius, shadows } from "@/theme/colors";
import type { VoiceConnectionData } from "@/pages/AddVoiceConnectionsScreen";
import { useThemeStore } from "@/hooks/useThemeStore";

interface VoiceConnectionCardProps {
  connection: VoiceConnectionData;
  onUpdate: (updatedData: Partial<VoiceConnectionData>) => void;
  onRemove: () => void;
  onInputFocus?: () => void;
  idx: number;
}

const VoiceConnectionCard: React.FC<VoiceConnectionCardProps> = ({
  connection,
  onUpdate,
  onRemove,
  onInputFocus,
  idx,
}) => {
  const { t } = useTranslation();
  const { colors } = useThemeStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isNameAutoCapitalized, setIsNameAutoCapitalized] = useState(true);

  // Convert VoiceConnectionData social media format to SocialMediaSection format
  const adaptedSocialMedias = connection.socialMedias.map((sm, index) => ({
    id: sm.id || `temp-${index}`,
    type: sm.type,
    handle: sm.handle,
    url: sm.url || null,
    created_at: sm.created_at || new Date(),
    updated_at: sm.updated_at || new Date(),
    connection_id: sm.connection_id || connection.id,
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!connection.name.trim()) {
      newErrors.name = t("voiceConnections.nameRequired");
    }

    if (!connection.metWhere.trim()) {
      newErrors.metWhere = t("voiceConnections.meetingPlaceRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (text: string) => {
    // Auto-capitalize if user is just typing (not manually editing)
    const processedText = isNameAutoCapitalized ? camelCaseWords(text) : text;
    onUpdate({ name: processedText });

    // If user deletes or manually edits, stop auto-capitalizing
    if (
      text.length < connection.name.length ||
      (text !== camelCaseWords(text) && text === text.toLowerCase())
    ) {
      setIsNameAutoCapitalized(false);
    }

    // Clear name error if it exists
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const handleMetWhereChange = (text: string) => {
    onUpdate({ metWhere: text });
    
    // Clear metWhere error if it exists
    if (errors.metWhere) {
      setErrors((prev) => ({ ...prev, metWhere: "" }));
    }
  };

  const addFactField = () => {
    onUpdate({ facts: [...connection.facts, ""] });
  };

  const removeFactField = (index: number) => {
    const newFacts = connection.facts.filter((_, i) => i !== index);
    onUpdate({ facts: newFacts });
  };

  const updateFact = (index: number, value: string) => {
    const newFacts = connection.facts.map((fact, i) =>
      i === index ? value : fact
    );
    onUpdate({ facts: newFacts });
  };

  const handleRemove = () => {
    Alert.alert(
      t("voiceConnections.removeConnection"),
      t("voiceConnections.removeConnectionConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.remove"),
          style: "destructive",
          onPress: onRemove,
        },
      ]
    );
  };

  // Validate on render to show errors
  React.useEffect(() => {
    validateForm();
  }, [connection.name, connection.metWhere]);

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={colors.gradients.section}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: colors.border.default }]}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>{t("voiceConnections.reviewConnection")} #{idx}</Text>
          <Button
            icon={<Ionicons name="trash" size={18} color="#ffffff" />}
            onPress={handleRemove}
            variant="danger"
            size="small"
            iconOnly
          />
        </View>

        <View style={styles.form}>
          <Input
            label={t("connections.name") + " *"}
            value={connection.name}
            onChangeText={handleNameChange}
            error={errors.name}
            placeholder={t("connections.namePlaceholder")}
            onFocus={() => onInputFocus && onInputFocus()}
          />

          <Input
            label={t("connections.whereDidYouMeet")}
            value={connection.metWhere}
            onChangeText={handleMetWhereChange}
            error={errors.metWhere}
            placeholder={t("connections.meetingPlaceholder")}
            onFocus={() => onInputFocus && onInputFocus()}
          />

          <View style={styles.factsSection}>
            <LinearGradient
              colors={colors.gradients.section}
              style={[styles.factsSectionContent, { borderColor: colors.border.light }]}
            >
              <Text style={[styles.factsTitle, { color: colors.text.accent }]}>{t("connections.notesOptional")}</Text>

              {connection.facts.map((fact, index) => (
                <View key={index} style={styles.factRow}>
                  <Input
                    value={fact}
                    onChangeText={(text) => updateFact(index, text)}
                    placeholder={`${t("connections.interestingFact")}${index + 1}`}
                    containerStyle={styles.factInput}
                    onFocus={() => onInputFocus && onInputFocus()}
                  />
                  <Button
                    icon={<Ionicons name="trash" size={16} color="#ffffff" />}
                    onPress={() => removeFactField(index)}
                    variant="danger"
                    size="small"
                    style={styles.removeButton}
                    iconOnly
                  />
                </View>
              ))}

              <Button
                title={t("connections.addFact")}
                onPress={addFactField}
                variant="ghost"
                style={styles.addFactButton}
              />
            </LinearGradient>
          </View>

          <SocialMediaSection
            socialMedias={adaptedSocialMedias}
            onUpdateSocialMedias={(socialMedias) => onUpdate({ 
              socialMedias: socialMedias.map(sm => ({
                type: sm.type,
                handle: sm.handle,
                id: sm.id,
                url: sm.url,
                created_at: sm.created_at,
                updated_at: sm.updated_at,
                connection_id: sm.connection_id,
              }))
            })}
            onInputFocus={onInputFocus}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: 20,
    borderWidth: 1,
    ...shadows.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: typography.size["3xl"],
    fontWeight: typography.weight.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  form: {
    gap: 16,
  },
  factsSection: {
    marginTop: 8,
  },
  factsSectionContent: {
    padding: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  factsTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginBottom: 12,
    letterSpacing: typography.letterSpacing.wide,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  factInput: {
    flex: 1,
    marginRight: 8,
    marginBottom: 0,
  },
  removeButton: {
    minWidth: 36,
    alignSelf: "center",
  },
  addFactButton: {
    marginTop: 8,
  },
});

export default VoiceConnectionCard;