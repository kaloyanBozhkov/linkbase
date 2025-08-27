# Internationalization (i18n) System

This directory contains the internationalization setup for the Linkbase React Native app.

## Overview

The i18n system supports 17 languages:
- English (global default)
- Spanish (Latin America, Spain, US Hispanics)
- Chinese (Simplified) (China, Singapore)
- Chinese (Traditional) (Taiwan, Hong Kong)
- Hindi (India)
- Arabic (Middle East, North Africa)
- French (Europe, Africa, Canada)
- German (Europe)
- Portuguese (Brazilian) (Brazil)
- Japanese (Japan)
- Russian (Russia, Eastern Europe)
- Korean (South Korea)
- Bulgarian
- Romanian
- Greek
- Italian
- Dutch (Netherlands)

## File Structure

```
src/i18n/
├── index.ts                 # Main i18n configuration
├── locales/                 # Translation files
│   ├── en.json             # English (base)
│   ├── es.json             # Spanish
│   ├── zh-CN.json          # Chinese (Simplified)
│   ├── zh-TW.json          # Chinese (Traditional)
│   ├── hi.json             # Hindi
│   ├── ar.json             # Arabic
│   ├── fr.json             # French
│   ├── de.json             # German
│   ├── pt-BR.json          # Portuguese (Brazilian)
│   ├── ja.json             # Japanese
│   ├── ru.json             # Russian
│   ├── ko.json             # Korean
│   ├── bg.json             # Bulgarian
│   ├── ro.json             # Romanian
│   ├── el.json             # Greek
│   ├── it.json             # Italian
│   └── nl.json             # Dutch
└── README.md               # This file
```

## Usage

### 1. Using Translations in Components

```tsx
import { useTranslation } from '@/hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('common.loading')}</Text>
  );
};
```

### 2. Language Management

```tsx
import { useTranslation } from '@/hooks/useTranslation';

const LanguageComponent = () => {
  const { 
    t, 
    currentLanguage, 
    changeLanguage, 
    languages,
    isRTL 
  } = useTranslation();
  
  const handleLanguageChange = async (languageCode) => {
    await changeLanguage(languageCode);
  };
  
  return (
    <View>
      <Text>Current: {currentLanguage}</Text>
      <Text>RTL: {isRTL ? 'Yes' : 'No'}</Text>
    </View>
  );
};
```

### 3. Using the Language Selector Component

```tsx
import LanguageSelector from '@/components/molecules/LanguageSelector';

const SettingsScreen = () => {
  return (
    <View>
      <LanguageSelector 
        onLanguageChange={(code) => console.log('Language changed to:', code)}
      />
    </View>
  );
};
```

## Translation Keys Structure

The translation files are organized into logical sections:

### Common
- `common.loading` - Loading text
- `common.error` - Error text
- `common.success` - Success text
- etc.

### Navigation
- `navigation.home` - Home tab
- `navigation.profile` - Profile tab
- `navigation.settings` - Settings tab
- etc.

### Settings
- `settings.title` - Settings screen title
- `settings.language.title` - Language section title
- `settings.notifications.title` - Notifications section title
- etc.

### Social Media
- `socialMedia.title` - Social media section title
- `socialMedia.email.label` - Email input label
- `socialMedia.phone.validation` - Phone validation message
- etc.

### Profile
- `profile.title` - Profile screen title
- `profile.firstName` - First name label
- `profile.bioPlaceholder` - Bio placeholder text
- etc.

### Authentication
- `auth.signIn` - Sign in button
- `auth.email` - Email field label
- `auth.validation.emailRequired` - Email validation message
- etc.

## Adding New Languages

1. Create a new translation file in `locales/` directory
2. Add the language configuration to `LANGUAGES` object in `index.ts`
3. Import the new translation file in `index.ts`
4. Add the language to the resources object

Example for adding a new language (e.g., Swedish):

```tsx
// In index.ts
export const LANGUAGES = {
  // ... existing languages
  sv: {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    regions: ['Sweden'],
    rtl: false,
  },
};

// Add to resources
const resources = {
  // ... existing resources
  sv: { translation: sv },
};
```

## Adding New Translation Keys

1. Add the key to the English translation file (`en.json`)
2. Add the translation to all other language files
3. Use the key in your components with `t('new.key')`

## RTL Support

The system automatically detects RTL languages (currently Arabic) and provides:
- `isRTL()` function to check if current language is RTL
- Automatic text direction handling
- Layout adjustments for RTL languages

## Best Practices

1. **Use descriptive keys**: Instead of `t('msg')`, use `t('auth.validation.emailRequired')`
2. **Group related translations**: Keep related translations in the same section
3. **Use interpolation for dynamic content**: `t('notifications.newConnection', { name: userName })`
4. **Test with different languages**: Always test your app with multiple languages
5. **Consider text length**: Some languages have longer text than English
6. **Use professional translations**: For production apps, consider using professional translation services

## Scripts

### Generate Placeholder Translation Files

```bash
cd linkbase
pnpm run generate-translations
```

This will create placeholder files for all missing languages with `[LANG]` prefixes.

### Translate with GPT

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Translate all languages
pnpm run translate

# Force overwrite existing files
pnpm run translate:force
```

This will use GPT-4 to translate the English file to all supported languages.

### Manual Translation

If you prefer to translate manually or use other services:

```bash
# Generate placeholder files first
pnpm run generate-translations

# Then edit the files manually
# Replace [LANG] prefixes with actual translations
```

## Dependencies

- `react-i18next` - React integration for i18next
- `i18next` - Core internationalization framework
- `@react-native-async-storage/async-storage` - Language persistence
- `openai` - For GPT-powered translations (dev dependency)

## Troubleshooting

### Language not changing
- Check if the language code is correctly added to `LANGUAGES`
- Verify the translation file is properly imported
- Check for console errors

### Missing translations
- Ensure all keys exist in all language files
- Check for typos in translation keys
- Use the fallback language (English) for missing translations

### RTL layout issues
- Test with Arabic language
- Check if `isRTL()` is being used correctly
- Verify layout components support RTL

## Contributing

When adding new features:
1. Add all text strings to the English translation file
2. Add translations to all supported languages
3. Test the feature with multiple languages
4. Update this README if needed
