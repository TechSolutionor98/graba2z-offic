/**
 * Translation Service - Client
 * Connects to the Translation Model Service running on port 5001
 * Uses Helsinki-NLP/opus-mt-tc-big-en-ar model via our backend API
 * 
 * OPTIMIZED: Uses batching and debouncing to minimize API calls
 */

import config from '../config/config';

// Translation Model Service URL
const TRANSLATION_API_URL = config.TRANSLATION_API_URL;

// Cache for translated texts to avoid repeated API calls
const translationCache = new Map();

// ============================================
// BATCH TRANSLATION QUEUE SYSTEM
// ============================================

// Queue for pending translation requests
const translationQueue = {
  'en-ar': new Map(), // text -> { resolve, reject }[]
  'ar-en': new Map(),
};

// Debounce timers
let debounceTimers = {
  'en-ar': null,
  'ar-en': null,
};

// Batch configuration
const BATCH_CONFIG = {
  DEBOUNCE_MS: 50,      // Wait 50ms to collect more requests
  MAX_BATCH_SIZE: 100,   // Max texts per batch request
  MAX_WAIT_MS: 200,      // Force flush after 200ms even if still collecting
};

// Track when queue started filling
let queueStartTime = {
  'en-ar': null,
  'ar-en': null,
};

/**
 * Process the queued translations as a batch
 */
const flushQueue = async (direction) => {
  const queue = translationQueue[direction];
  
  if (queue.size === 0) return;
  
  // Get all texts and their callbacks
  const entries = Array.from(queue.entries());
  const texts = entries.map(([text]) => text);
  const callbacks = entries.map(([, cbs]) => cbs);
  
  // Clear the queue immediately
  queue.clear();
  queueStartTime[direction] = null;
  
  console.log(`[TranslationService] Batch translating ${texts.length} texts (${direction})`);
  
  const endpoint = direction === 'en-ar' ? '/api/translate/en-ar' : '/api/translate/ar-en';
  
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
      // Resolve all with original texts on error
      callbacks.forEach((cbs, index) => {
        cbs.forEach(cb => cb.resolve(texts[index]));
      });
      return;
    }

    const data = await response.json();
    
    if (data.success && data.translations) {
      // Cache and resolve all translations
      texts.forEach((text, index) => {
        const translation = data.translations[index] || text;
        translationCache.set(`${direction}:${text}`, translation);
        callbacks[index].forEach(cb => cb.resolve(translation));
      });
      console.log(`[TranslationService] Batch complete: ${texts.length} translations cached`);
    } else {
      // Resolve all with original texts
      callbacks.forEach((cbs, index) => {
        cbs.forEach(cb => cb.resolve(texts[index]));
      });
    }
  } catch (error) {
    console.error("Batch translation error:", error);
    // Resolve all with original texts on error
    callbacks.forEach((cbs, index) => {
      cbs.forEach(cb => cb.resolve(texts[index]));
    });
  }
};

/**
 * Add a text to the translation queue
 */
const queueTranslation = (text, direction) => {
  return new Promise((resolve, reject) => {
    const queue = translationQueue[direction];
    
    // Add callback to queue (multiple components might request same text)
    if (queue.has(text)) {
      queue.get(text).push({ resolve, reject });
    } else {
      queue.set(text, [{ resolve, reject }]);
    }
    
    // Track when queue started
    if (!queueStartTime[direction]) {
      queueStartTime[direction] = Date.now();
    }
    
    // Clear existing debounce timer
    if (debounceTimers[direction]) {
      clearTimeout(debounceTimers[direction]);
    }
    
    // Check if we should force flush (max wait time exceeded or max batch size)
    const shouldForceFlush = 
      queue.size >= BATCH_CONFIG.MAX_BATCH_SIZE ||
      (queueStartTime[direction] && Date.now() - queueStartTime[direction] >= BATCH_CONFIG.MAX_WAIT_MS);
    
    if (shouldForceFlush) {
      flushQueue(direction);
    } else {
      // Set new debounce timer
      debounceTimers[direction] = setTimeout(() => {
        flushQueue(direction);
      }, BATCH_CONFIG.DEBOUNCE_MS);
    }
  });
};

/**
 * Translate text from English to Arabic (uses batching)
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

  // Add to queue for batch processing
  return queueTranslation(text, 'en-ar');
};

/**
 * Translate text from Arabic to English (uses batching)
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

  // Add to queue for batch processing
  return queueTranslation(text, 'ar-en');
};

/**
 * Batch translate multiple texts (optimized - uses internal queue)
 * @param {string[]} texts - Array of texts to translate
 * @param {string} targetLang - Target language ('ar' or 'en')
 * @returns {Promise<string[]>} - Array of translated texts
 */
export const batchTranslate = async (texts, targetLang = 'ar') => {
  if (!texts || texts.length === 0) return [];

  const direction = targetLang === 'ar' ? 'en-ar' : 'ar-en';
  
  // Filter out empty texts and check cache
  const results = new Array(texts.length);
  const uncachedTexts = [];
  const uncachedIndices = [];
  
  texts.forEach((text, index) => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      results[index] = text;
      return;
    }
    
    const cacheKey = `${direction}:${text}`;
    if (translationCache.has(cacheKey)) {
      results[index] = translationCache.get(cacheKey);
    } else {
      uncachedTexts.push(text);
      uncachedIndices.push(index);
    }
  });
  
  // If all cached, return immediately
  if (uncachedTexts.length === 0) {
    return results;
  }
  
  // Queue all uncached texts for batch translation
  const translations = await Promise.all(
    uncachedTexts.map(text => queueTranslation(text, direction))
  );
  
  // Fill in the results
  translations.forEach((translation, i) => {
    results[uncachedIndices[i]] = translation;
  });
  
  return results;
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
 * Pre-load translations into cache (useful for initial page load)
 * @param {string[]} texts - Array of texts to pre-translate
 * @param {string} targetLang - Target language ('ar' or 'en')
 */
export const preloadTranslations = async (texts, targetLang = 'ar') => {
  if (!texts || texts.length === 0) return;
  
  const direction = targetLang === 'ar' ? 'en-ar' : 'ar-en';
  
  // Filter only uncached texts
  const uncachedTexts = texts.filter(text => {
    if (!text || typeof text !== 'string') return false;
    return !translationCache.has(`${direction}:${text}`);
  });
  
  if (uncachedTexts.length === 0) {
    console.log('[TranslationService] All texts already cached');
    return;
  }
  
  console.log(`[TranslationService] Preloading ${uncachedTexts.length} translations`);
  await batchTranslate(uncachedTexts, targetLang);
};

/**
 * Get translation from cache only (no API call)
 * @param {string} text - Text to look up
 * @param {string} direction - Translation direction ('en-ar' or 'ar-en')
 * @returns {string|null} - Cached translation or null
 */
export const getCachedTranslation = (text, direction = 'en-ar') => {
  const cacheKey = `${direction}:${text}`;
  return translationCache.has(cacheKey) ? translationCache.get(cacheKey) : null;
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
  preloadTranslations,
  getCachedTranslation,
};
