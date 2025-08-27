import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { typography, borderRadius } from '@/theme/colors';
import { useThemeStore } from '@/hooks/useThemeStore';

interface LanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageChange,
}) => {
  const { t, currentLanguage, changeLanguage, languages } = useTranslation();
  const { colors } = useThemeStore();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleLanguageSelect = async (languageCode: string) => {
    await changeLanguage(languageCode as any);
    onLanguageChange?.(languageCode);
    setIsModalVisible(false);
  };

  const currentLanguageInfo = languages[currentLanguage];

  const renderLanguageItem = ({ item }: { item: [string, typeof languages[string]] }) => {
    const [code, language] = item;
    const isSelected = code === currentLanguage;

    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          { backgroundColor: colors.background.surface },
          isSelected && [styles.languageItemSelected, { backgroundColor: colors.background.tertiary }],
        ]}
        onPress={() => handleLanguageSelect(code)}
      >
        <View style={styles.languageInfo}>
          <Text
            style={[
              styles.languageName,
              { color: colors.text.primary },
              isSelected && { color: colors.text.accent },
            ]}
          >
            {language.nativeName}
          </Text>
          <Text
            style={[
              styles.languageEnglishName,
              { color: colors.text.muted },
            ]}
          >
            {language.name}
          </Text>
          <Text
            style={[
              styles.languageRegions,
              { color: colors.text.muted },
            ]}
          >
            {language.regions.join(', ')}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={colors.text.accent}
          />
        )}
      </TouchableOpacity>
    );
  };

  const languageEntries = Object.entries(languages).sort((a, b) => {
    // Put current language first
    if (a[0] === currentLanguage) return -1;
    if (b[0] === currentLanguage) return 1;
    // Then sort alphabetically by native name
    return a[1].nativeName.localeCompare(b[1].nativeName);
  });

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          { backgroundColor: colors.background.secondary, borderColor: colors.border.default },
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <View style={styles.currentLanguageInfo}>
            <Text
              style={[styles.currentLanguageName, { color: colors.text.primary }]}
            >
              {currentLanguageInfo.nativeName}
            </Text>
            <Text
              style={[styles.currentLanguageEnglish, { color: colors.text.muted }]}
            >
              {currentLanguageInfo.name}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.text.muted}
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={colors.gradients.dark}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text
                  style={[styles.modalTitle, { color: colors.text.accent }]}
                >
                  {t('settings.language.selectLanguage')}
                </Text>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={colors.text.muted}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              >
                {languageEntries.map((item) => (
                  <View key={item[0]}>
                    {renderLanguageItem({ item })}
                  </View>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    borderWidth: 2,
    borderRadius: borderRadius.md,
    padding: 16,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentLanguageInfo: {
    flex: 1,
  },
  currentLanguageName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  currentLanguageEnglish: {
    fontSize: typography.size.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: borderRadius.md,
    marginBottom: 8,
  },
  languageItemSelected: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    marginBottom: 2,
  },
  languageEnglishName: {
    fontSize: typography.size.base,
    marginBottom: 2,
  },
  languageRegions: {
    fontSize: typography.size.sm,
    fontStyle: 'italic',
  },
});

export default LanguageSelector;
