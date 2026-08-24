/**
 * @fileoverview Internationalization (i18n) configuration module.
 * Sets up i18next with HTTP backend for loading translations,
 * automatic language detection, and React integration.
 * @module shared/utils/i18n
 * @see {@link https://www.i18next.com/overview/configuration-options i18next Configuration Options}
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

/**
 * Configured i18next instance for the application.
 *
 * Features:
 * - HTTP backend for loading translation files
 * - Automatic browser language detection
 * - React-i18next integration for hooks and components
 * - English as default and fallback language
 *
 * @type {import("i18next").i18n}
 * @example
 * // Using in a component
 * import { useTranslation } from 'react-i18next';
 * const { t } = useTranslation();
 * return <span>{t('key.name')}</span>;
 */
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    /** @type {string} Default language code */
    lng: "en",
    /** @type {string} Fallback language when translation is missing */
    fallbackLng: "en",
    /** @type {boolean} Enable debug mode for development */
    debug: true,
    interpolation: {
      /** @type {boolean} Disable escaping since React handles XSS protection */
      escapeValue: false,
    },
    backend: {
      /** @type {string} Path to translation JSON files */
      loadPath: "./src/client/locales/en/translation.json",
    },
  });

export default i18n;
