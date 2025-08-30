import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

// Import all translation files
import en from './locales/en.json';
import es from './locales/es.json';
import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ptBR from './locales/pt-BR.json';
import ja from './locales/ja.json';
import ru from './locales/ru.json';
import ko from './locales/ko.json';
import bg from './locales/bg.json';
import ro from './locales/ro.json';
import el from './locales/el.json';
import it from './locales/it.json';
import nl from './locales/nl.json';

// Language configuration
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    regions: ['Global'],
    rtl: false,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    regions: ['Latin America', 'Spain', 'US Hispanics'],
    rtl: false,
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    regions: ['China', 'Singapore'],
    rtl: false,
  },
  'zh-TW': {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '繁體中文',
    regions: ['Taiwan', 'Hong Kong'],
    rtl: false,
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    regions: ['India'],
    rtl: false,
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    regions: ['Middle East', 'North Africa'],
    rtl: true,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    regions: ['Europe', 'Africa', 'Canada'],
    rtl: false,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    regions: ['Europe'],
    rtl: false,
  },
  'pt-BR': {
    code: 'pt-BR',
    name: 'Portuguese (Brazilian)',
    nativeName: 'Português (Brasil)',
    regions: ['Brazil'],
    rtl: false,
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    regions: ['Japan'],
    rtl: false,
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    regions: ['Russia', 'Eastern Europe'],
    rtl: false,
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    regions: ['South Korea'],
    rtl: false,
  },
  bg: {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    regions: ['Bulgaria'],
    rtl: false,
  },
  ro: {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    regions: ['Romania'],
    rtl: false,
  },
  el: {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    regions: ['Greece'],
    rtl: false,
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    regions: ['Italy'],
    rtl: false,
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    regions: ['Netherlands'],
    rtl: false,
  },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// Get device language
const getDeviceLanguage = (): string => {
  const deviceLanguage =
    Platform.OS === 'ios'
      ? NativeModules.SettingsManager.settings.AppleLocale ||
        NativeModules.SettingsManager.settings.AppleLanguages[0]
      : NativeModules.I18nManager.localeIdentifier;

  if (deviceLanguage) {
    // Extract language code (e.g., "en-US" -> "en", "zh-CN" -> "zh-CN")
    const langCode = deviceLanguage.split('-')[0];
    const fullCode = deviceLanguage.split('_')[0];
    
    // Check if we have the full code (e.g., zh-CN, pt-BR)
    if (LANGUAGES[fullCode as LanguageCode]) {
      return fullCode;
    }
    
    // Check if we have the base language code
    if (LANGUAGES[langCode as LanguageCode]) {
      return langCode;
    }
  }
  
  return 'en'; // Default to English
};

// Resources object
const resources = {
  en: { translation: en },
  es: { translation: es },
  'zh-CN': { translation: zhCN },
  'zh-TW': { translation: zhTW },
  hi: { translation: hi },
  ar: { translation: ar },
  fr: { translation: fr },
  de: { translation: de },
  'pt-BR': { translation: ptBR },
  ja: { translation: ja },
  ru: { translation: ru },
  ko: { translation: ko },
  bg: { translation: bg },
  ro: { translation: ro },
  el: { translation: el },
  it: { translation: it },
  nl: { translation: nl },
};

// Language detection
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // First check onboarding store for language selection
      const onboardingData = await AsyncStorage.getItem('linkbase_onboarding_27-07-2025.13');
      if (onboardingData) {
        try {
          const parsed = JSON.parse(onboardingData);
          if (parsed.selectedLanguage && LANGUAGES[parsed.selectedLanguage as LanguageCode]) {
            callback(parsed.selectedLanguage);
            return;
          }
        } catch (e) {
          console.warn('Error parsing onboarding data:', e);
        }
      }
      
      // Fallback to user language storage
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage && LANGUAGES[savedLanguage as LanguageCode]) {
        callback(savedLanguage);
        return;
      }
      
      const deviceLanguage = getDeviceLanguage();
      callback(deviceLanguage);
    } catch (error) {
      console.warn('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {
      console.warn('Error saving language:', error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: __DEV__,
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false, // React Native doesn't support Suspense yet
    },
    
    // Language detection options
    detection: {
      order: ['asyncStorage', 'device'],
      caches: ['asyncStorage'],
    },
  });

// Language management functions
export const changeLanguage = async (languageCode: LanguageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem('user-language', languageCode);
    
    // Also update onboarding store if it exists
    try {
      const onboardingData = await AsyncStorage.getItem('linkbase_onboarding_27-07-2025.13');
      if (onboardingData) {
        const parsed = JSON.parse(onboardingData);
        const newData = { ...parsed, selectedLanguage: languageCode };
        await AsyncStorage.setItem('linkbase_onboarding_27-07-2025.13', JSON.stringify(newData));
      }
    } catch (e) {
      console.warn('Error updating onboarding language:', e);
    }
  } catch (error) {
    console.warn('Error changing language:', error);
  }
};

export const getCurrentLanguage = (): LanguageCode => {
  return (i18n.language as LanguageCode) || 'en';
};

export const isRTL = (): boolean => {
  const currentLang = getCurrentLanguage();
  return LANGUAGES[currentLang]?.rtl || false;
};

export default i18n;
