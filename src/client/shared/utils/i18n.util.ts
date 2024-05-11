// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  // Learn more about options: https://www.i18next.com/overview/configuration-options
  .use(HttpBackend) // Load translations over http
  .use(LanguageDetector) // Detect language automatically
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    lng: "en", // Specify the language
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false, // Not needed for React
    },
    backend: {
      // path where resources get loaded from
      loadPath: "./src/client/locales/en/translation.json",
    },
  });

export default i18n;
