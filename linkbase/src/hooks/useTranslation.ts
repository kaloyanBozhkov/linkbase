import { useTranslation as useI18nTranslation } from 'react-i18next';
import { LANGUAGES, changeLanguage, getCurrentLanguage, isRTL, type LanguageCode } from '@/i18n';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  return {
    t,
    currentLanguage: getCurrentLanguage(),
    isRTL: isRTL(),
    changeLanguage: (languageCode: LanguageCode) => changeLanguage(languageCode),
    languages: LANGUAGES,
    isLanguageLoaded: i18n.isLanguageLoaded,
  };
};

export type { LanguageCode };
