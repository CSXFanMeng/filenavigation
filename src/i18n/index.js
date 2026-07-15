import locale0 from "./locales/en.js";
import locale1 from "./locales/zh-CN.js";
import locale2 from "./locales/zh-TW.js";
import locale3 from "./locales/es.js";
import locale4 from "./locales/fr.js";
import locale5 from "./locales/de.js";
import locale6 from "./locales/ja.js";
import locale7 from "./locales/ko.js";
import locale8 from "./locales/pt-BR.js";
import locale9 from "./locales/ru.js";
import locale10 from "./locales/ar.js";
import locale11 from "./locales/hi.js";
import locale12 from "./locales/it.js";
import locale13 from "./locales/nl.js";
import locale14 from "./locales/tr.js";
import locale15 from "./locales/vi.js";
import locale16 from "./locales/id.js";
import locale17 from "./locales/th.js";
import locale18 from "./locales/pl.js";
import locale19 from "./locales/uk.js";

export const languageOptions = [
  ["auto", "Auto"],
  ["en", "English"],
  ["zh-CN", "简体中文"],
  ["zh-TW", "繁體中文"],
  ["es", "Español"],
  ["fr", "Français"],
  ["de", "Deutsch"],
  ["ja", "日本語"],
  ["ko", "한국어"],
  ["pt-BR", "Português"],
  ["ru", "Русский"],
  ["ar", "العربية"],
  ["hi", "हिन्दी"],
  ["it", "Italiano"],
  ["nl", "Nederlands"],
  ["tr", "Türkçe"],
  ["vi", "Tiếng Việt"],
  ["id", "Bahasa Indonesia"],
  ["th", "ไทย"],
  ["pl", "Polski"],
  ["uk", "Українська"]
];

export const translations = {
  "en": locale0,
  "zh-CN": locale1,
  "zh-TW": locale2,
  "es": locale3,
  "fr": locale4,
  "de": locale5,
  "ja": locale6,
  "ko": locale7,
  "pt-BR": locale8,
  "ru": locale9,
  "ar": locale10,
  "hi": locale11,
  "it": locale12,
  "nl": locale13,
  "tr": locale14,
  "vi": locale15,
  "id": locale16,
  "th": locale17,
  "pl": locale18,
  "uk": locale19
};

export const aliases = {
  zh: "zh-CN",
  "zh-Hans": "zh-CN",
  "zh-Hant": "zh-TW",
  pt: "pt-BR",
  "pt-PT": "pt-BR"
};

export function resolveLanguage(value, navigatorLanguages = []) {
  if (value && value !== "auto") {
    return translations[value] ? value : aliases[value] || value.split("-")[0];
  }

  for (const locale of navigatorLanguages) {
    const normalized = aliases[locale] || locale;
    if (translations[normalized]) {
      return normalized;
    }

    const base = normalized.split("-")[0];
    if (translations[base]) {
      return base;
    }
  }

  return "en";
}

export function translateForLanguage(language, key, ...args) {
  const value = translations[language]?.[key] ?? translations.en[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}
