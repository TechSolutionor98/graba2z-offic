/**
 * LanguageModel - Entry point
 * Helsinki-NLP/opus-mt-tc-big-en-ar based translation service
 */

export {
  translateToArabic,
  translateToEnglish,
  batchTranslate,
  clearTranslationCache,
  getCacheStats,
} from './translationService';

export { default as translationService } from './translationService';
