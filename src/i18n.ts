import i18next from "i18next";
import HttpBackend from "i18next-http-backend";

export const i18n = i18next;

// Initialize i18next with http backend to load /locales/{{lng}}/{{ns}}.json
i18n.use(HttpBackend).init({
  fallbackLng: "pl",
  supportedLngs: ["pl", "en"],
  lng: "pl",
  ns: ["translation"],
  defaultNS: "translation",
  backend: {
    loadPath: "/locales/{{lng}}/{{ns}}.json",
  },
  interpolation: {
    escapeValue: false,
  },
});

// keep document.lang in sync
i18n.on("languageChanged", (lng) => {
  try {
    document.documentElement.lang = lng;
  } catch (e) {}
});

export default i18n;