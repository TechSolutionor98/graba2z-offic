/**
 * Translation Service - Client
 * Connects to the Translation Model Service running on port 5001
 * Uses Helsinki-NLP/opus-mt-tc-big-en-ar model via our backend API
 */

import config from '../config/config';

// Translation Model Service URL
const TRANSLATION_API_URL = config.TRANSLATION_API_URL;

// Cache for translated texts to avoid repeated API calls
const translationCache = new Map();

/**
 * Translate text from English to Arabic
 * @param {string} text - The English text to translate
 * @returns {Promise<string>} - Translated Arabic text
 */
export const translateToArabic = async (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  // Check cache first
  const cacheKey = `en-ar:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${TRANSLATION_API_URL}/api/translate/en-ar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn(`Translation API error: ${response.status}`);
      return text;
    }

    const data = await response.json();
    
    if (data.success && data.translation) {
      translationCache.set(cacheKey, data.translation);
      return data.translation;
    }

    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

/**
 * Translate text from Arabic to English
 * @param {string} text - The Arabic text to translate
 * @returns {Promise<string>} - Translated English text
 */
export const translateToEnglish = async (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  // Check cache first
  const cacheKey = `ar-en:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${TRANSLATION_API_URL}/api/translate/ar-en`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.warn(`Translation API error: ${response.status}`);
      return text;
    }

    const data = await response.json();
    
    if (data.success && data.translation) {
      translationCache.set(cacheKey, data.translation);
      return data.translation;
    }

    return text;
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

/**
 * Batch translate multiple texts
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language ('ar' or 'en')
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const batchTranslate = async (texts, targetLang = 'ar') => {
  if (!texts || texts.length === 0) return [];

  const endpoint = targetLang === 'ar' ? '/api/translate/en-ar' : '/api/translate/ar-en';

  try {
    const response = await fetch(`${TRANSLATION_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ texts }),
    });

    if (!response.ok) {
      console.warn(`Batch translation API error: ${response.status}`);
      return texts;
    }

    const data = await response.json();
    
    if (data.success && data.translations) {
      // Cache all translations
      const direction = targetLang === 'ar' ? 'en-ar' : 'ar-en';
      texts.forEach((text, index) => {
        translationCache.set(`${direction}:${text}`, data.translations[index]);
      });
      return data.translations;
    }

    return texts;
  } catch (error) {
    console.error("Batch translation error:", error);
    return texts;
  }
};

/**
 * Clear the translation cache
 */
export const clearTranslationCache = () => {
  translationCache.clear();
};

/**
 * Get cache statistics
 * @returns {object} - Cache size and entries
 */
export const getCacheStats = () => {
  return {
    size: translationCache.size,
    entries: Array.from(translationCache.keys()),
  };
};

/**
 * Check if translation service is healthy
 * @returns {Promise<boolean>} - True if service is available
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${TRANSLATION_API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export default {
  translateToArabic,
  translateToEnglish,
  batchTranslate,
  clearTranslationCache,
  getCacheStats,
  checkHealth,
};
