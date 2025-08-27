# Translation Guide for Linkbase App

This guide explains how to manage translations in the Linkbase React Native app.

## Overview

The app supports 17 languages with a comprehensive i18n system built on `react-i18next`. All UI text is translatable and the system includes automatic language detection, persistence, and RTL support.

## Supported Languages

- **English** (en) - Global default
- **Spanish** (es) - Latin America, Spain, US Hispanics
- **Chinese (Simplified)** (zh-CN) - China, Singapore
- **Chinese (Traditional)** (zh-TW) - Taiwan, Hong Kong
- **Hindi** (hi) - India
- **Arabic** (ar) - Middle East, North Africa (RTL)
- **French** (fr) - Europe, Africa, Canada
- **German** (de) - Europe
- **Portuguese (Brazilian)** (pt-BR) - Brazil
- **Japanese** (ja) - Japan
- **Russian** (ru) - Russia, Eastern Europe
- **Korean** (ko) - South Korea
- **Bulgarian** (bg) - Bulgaria
- **Romanian** (ro) - Romania
- **Greek** (el) - Greece
- **Italian** (it) - Italy
- **Dutch** (nl) - Netherlands

## Quick Start

### 1. Install Dependencies

```bash
cd linkbase
pnpm install
```

### 2. Set Up OpenAI API Key (for GPT translations)

```bash
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Translate All Languages

```bash
pnpm run translate
```

This will use GPT-4 to translate the English file to all supported languages.

## Available Scripts

### Translation Scripts

```bash
# Translate all languages using GPT
pnpm run translate

# Force overwrite existing translation files
pnpm run translate:force

# Generate placeholder files for manual translation
pnpm run generate-translations

# Clean up and validate translation files
pnpm run clean-translations
```

### Manual Translation Workflow

If you prefer manual translation or want to use other services:

```bash
# 1. Generate placeholder files
pnpm run generate-translations

# 2. Edit the generated files manually
# Replace [LANG] prefixes with actual translations

# 3. Validate your changes
pnpm run clean-translations
```

## File Structure

```
linkbase/
├── src/i18n/
│   ├── index.ts                 # Main i18n configuration
│   ├── locales/                 # Translation files
│   │   ├── en.json             # English (source)
│   │   ├── es.json             # Spanish
│   │   ├── zh-CN.json          # Chinese (Simplified)
│   │   ├── zh-TW.json          # Chinese (Traditional)
│   │   ├── hi.json             # Hindi
│   │   ├── ar.json             # Arabic
│   │   ├── fr.json             # French
│   │   ├── de.json             # German
│   │   ├── pt-BR.json          # Portuguese (Brazilian)
│   │   ├── ja.json             # Japanese
│   │   ├── ru.json             # Russian
│   │   ├── ko.json             # Korean
│   │   ├── bg.json             # Bulgarian
│   │   ├── ro.json             # Romanian
│   │   ├── el.json             # Greek
│   │   ├── it.json             # Italian
│   │   └── nl.json             # Dutch
│   └── README.md               # Detailed documentation
└── TRANSLATION_GUIDE.md        # This guide

packages/shared/src/scripts/
├── translate-with-gpt.js       # GPT-powered translation script
├── generate-translations.js    # Placeholder generation script
├── clean-translations.js       # Validation and cleanup script
└── update-dev-ip.mjs          # Development utility
```

## Translation Keys Structure

The translation files are organized into logical sections:

### Common Actions
- `common.loading` - Loading text
- `common.error` - Error text
- `common.success` - Success text
- `common.cancel` - Cancel button
- `common.save` - Save button
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

### Connections
- `connections.addConnection` - Add connection button
- `connections.editConnection` - Edit connection button
- `connections.nameRequired` - Name validation message
- etc.

### Social Media
- `socialMedia.title` - Social media section title
- `socialMedia.email.label` - Email input label
- `socialMedia.phone.validation` - Phone validation message
- etc.

### Voice Recording
- `voice.recording` - Recording state
- `voice.processing` - Processing state
- `voice.permissionRequired` - Permission request
- etc.

## Using Translations in Components

### Basic Usage

```tsx
import { useTranslation } from '@/hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('settings.title')}</Text>
  );
};
```

### Language Management

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

### Using the Language Selector Component

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

## Adding New Translation Keys

### 1. Add to English Source File

Add the new key to `linkbase/src/i18n/locales/en.json`:

```json
{
  "newSection": {
    "newKey": "New translation text"
  }
}
```

### 2. Translate to Other Languages

#### Option A: Use GPT Translation
```bash
pnpm run translate
```

#### Option B: Manual Translation
1. Add the key to all language files
2. Translate the values appropriately
3. Run validation: `pnpm run clean-translations`

### 3. Use in Components

```tsx
const { t } = useTranslation();
<Text>{t('newSection.newKey')}</Text>
```

## Best Practices

### 1. Key Naming
- Use descriptive, hierarchical keys: `settings.language.title`
- Avoid generic keys like `t('msg')`
- Group related translations in the same section

### 2. Translation Quality
- Use professional translation services for production apps
- Consider cultural context and regional differences
- Test with native speakers when possible

### 3. Text Length
- Some languages have longer text than English
- Design UI to accommodate longer translations
- Test with multiple languages

### 4. RTL Support
- Arabic and other RTL languages are automatically detected
- Use `isRTL()` function to check current language direction
- Test layout with RTL languages

### 5. Interpolation
- Use interpolation for dynamic content: `t('notifications.newConnection', { name: userName })`
- Preserve placeholders like `{{name}}` in translations

## Troubleshooting

### Common Issues

#### Language not changing
- Check if language code is correctly added to `LANGUAGES` object
- Verify translation file is properly imported
- Check console for errors

#### Missing translations
- Ensure all keys exist in all language files
- Check for typos in translation keys
- Use fallback language (English) for missing translations

#### RTL layout issues
- Test with Arabic language
- Check if `isRTL()` is being used correctly
- Verify layout components support RTL

#### GPT translation failures
- Check OpenAI API key is set correctly
- Verify API quota and billing
- Check network connection
- Review GPT response for JSON parsing errors

### Validation

Run the cleanup script to validate all translation files:

```bash
pnpm run clean-translations
```

This will:
- Check for duplicate keys
- Verify all source keys are present in target files
- Validate JSON structure
- Report any issues

## Contributing

When adding new features:

1. Add all text strings to the English translation file
2. Add translations to all supported languages
3. Test the feature with multiple languages
4. Update this guide if needed

## Dependencies

- `react-i18next` - React integration for i18next
- `i18next` - Core internationalization framework
- `@react-native-async-storage/async-storage` - Language persistence
- `openai` - For GPT-powered translations (dev dependency)

## Support

For issues with the translation system:

1. Check the troubleshooting section above
2. Run `pnpm run clean-translations` to validate files
3. Review the detailed documentation in `linkbase/src/i18n/README.md`
4. Check console logs for error messages
