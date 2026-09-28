import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supportedLanguages = ['en', 'az', 'tr', 'ru', 'ar'];

const translations = {};

for (const lang of supportedLanguages) {
  try {
    const filePath = join(__dirname, '..', 'locales', `${lang}.json`);
    translations[lang] = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.warn(`⚠️  Locale file for "${lang}" not found`);
    translations[lang] = {};
  }
}

/**
 * @param {string} lang 
 * @param {string} key 
 * @returns {string}
 */
export function t(lang, key) {
  const language = supportedLanguages.includes(lang) ? lang : 'en';
  return translations[language]?.[key] || translations['en']?.[key] || key;
}


export function getTranslations(lang) {
  const language = supportedLanguages.includes(lang) ? lang : 'en';
  return translations[language] || translations['en'];
}

export function getSupportedLanguages() {
  return supportedLanguages;
}

export function isRTL(lang) {
  return lang === 'ar';
}