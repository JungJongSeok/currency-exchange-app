/**
 * i18next bootstrap for CurrencyExchangeApp.
 *
 * Korean (default) + English. Falls back to `ko` when the device language
 * is unsupported.
 */

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {NativeModules, Platform} from 'react-native';

import ko from './locales/ko.json';
import en from './locales/en.json';

export type SupportedLanguage = 'ko' | 'en';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ko';

interface IOSSettings {
  AppleLocale?: string;
  AppleLanguages?: readonly string[];
}

const getDeviceLanguage = (): SupportedLanguage => {
  try {
    let locale: string | undefined;
    if (Platform.OS === 'ios') {
      const settings = NativeModules.SettingsManager?.settings as
        | IOSSettings
        | undefined;
      locale = settings?.AppleLocale ?? settings?.AppleLanguages?.[0];
    } else if (Platform.OS === 'android') {
      const i18nManager = NativeModules.I18nManager as
        | {localeIdentifier?: string}
        | undefined;
      locale = i18nManager?.localeIdentifier;
    }
    if (typeof locale === 'string' && locale.toLowerCase().startsWith('ko')) {
      return 'ko';
    }
    if (typeof locale === 'string' && locale.toLowerCase().startsWith('en')) {
      return 'en';
    }
  } catch {
    // Fall through to default
  }
  return DEFAULT_LANGUAGE;
};

export const resources = {
  ko: {translation: ko},
  en: {translation: en},
} as const;

void i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
