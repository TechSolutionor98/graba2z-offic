"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../context/LanguageContext"
import { batchTranslate } from "../LanguageModel/translationService"

const HTML_TRANSLATION_CACHE = new Map()
const HTML_TRANSLATION_IN_FLIGHT = new Map()
const HTML_CACHE_LIMIT = 200
const SKIP_PARENT_TAGS = new Set(["CODE", "PRE", "KBD", "SAMP", "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "OPTION"])

const buildCacheKey = (content, languageCode) => {
  const head = content.slice(0, 120)
  const tail = content.slice(-120)
  return `html_${languageCode}_${content.length}_${head}_${tail}`
}

const setHtmlCache = (key, value) => {
  if (HTML_TRANSLATION_CACHE.size >= HTML_CACHE_LIMIT) {
    const firstKey = HTML_TRANSLATION_CACHE.keys().next().value
    HTML_TRANSLATION_CACHE.delete(firstKey)
  }
  HTML_TRANSLATION_CACHE.set(key, value)
}

const shouldTranslateText = (text) => {
  if (!text) return false
  const normalized = text.trim()
  if (!normalized) return false
  if (/[\u0600-\u06FF]/.test(normalized)) return false
  if (/(https?:\/\/|www\.|@)/i.test(normalized)) return false
  if (!/[A-Za-z]/.test(normalized)) return false
  if (!normalized.includes(" ") && /\d/.test(normalized)) return false
  return true
}

/**
 * TranslatedHtml Component
 * Translates HTML content (like TipTap descriptions) to Arabic while preserving HTML structure
 */
const TranslatedHtml = ({ content, className = "" }) => {
  const { currentLanguage, isArabic } = useLanguage()
  const [translatedContent, setTranslatedContent] = useState(content)
  const [isTranslating, setIsTranslating] = useState(false)
  const translationCache = useRef({})
  
  useEffect(() => {
    let isCancelled = false

    // If English or no content, use original
    if (!isArabic || !content) {
      setTranslatedContent(content)
      setIsTranslating(false)
      return
    }

    const globalCacheKey = buildCacheKey(content, currentLanguage.code)
    if (HTML_TRANSLATION_CACHE.has(globalCacheKey)) {
      setTranslatedContent(HTML_TRANSLATION_CACHE.get(globalCacheKey))
      setIsTranslating(false)
      return
    }

    if (HTML_TRANSLATION_IN_FLIGHT.has(globalCacheKey)) {
      setIsTranslating(true)
      HTML_TRANSLATION_IN_FLIGHT.get(globalCacheKey)
        .then((translated) => {
          if (!isCancelled && translated) {
            setTranslatedContent(translated)
          }
        })
        .finally(() => {
          if (!isCancelled) {
            setIsTranslating(false)
          }
        })
      return
    }
    
    // Check cache first
    const cacheKey = `${content.substring(0, 100)}_${currentLanguage.code}`
    if (translationCache.current[cacheKey]) {
      setTranslatedContent(translationCache.current[cacheKey])
      setIsTranslating(false)
      return
    }
    
    const translateHtml = async () => {
      setIsTranslating(true)
      try {
        // Parse HTML and extract text nodes
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, "text/html")
        
        // Get all text nodes that need translation
        const textNodes = []
        const walker = document.createTreeWalker(
          doc.body,
          NodeFilter.SHOW_TEXT,
          null,
          false
        )
        
        let node
        while ((node = walker.nextNode())) {
          const parentTag = node.parentElement?.tagName
          if (parentTag && SKIP_PARENT_TAGS.has(parentTag)) {
            continue
          }

          const originalText = node.textContent || ""
          const text = originalText.trim()
          if (shouldTranslateText(text)) {
            const leadingSpace = (originalText.match(/^\s*/) || [""])[0]
            const trailingSpace = (originalText.match(/\s*$/) || [""])[0]
            textNodes.push({ node, text, leadingSpace, trailingSpace })
          }
        }
        
        if (textNodes.length === 0) {
          setHtmlCache(globalCacheKey, content)
          setTranslatedContent(content)
          return content
        }

        const uniqueTexts = Array.from(new Set(textNodes.map(({ text }) => text)))
        const translatedUniqueTexts = await batchTranslate(uniqueTexts, "ar")
        const translatedMap = new Map(
          uniqueTexts.map((text, index) => [text, translatedUniqueTexts[index] || text])
        )
        
        // Replace text nodes with translated text
        textNodes.forEach((item) => {
          const translatedText = translatedMap.get(item.text)
          item.node.textContent = `${item.leadingSpace}${translatedText || item.text}${item.trailingSpace}`
        })
        
        // Get the translated HTML
        const translated = doc.body.innerHTML
        
        // Cache the result
        translationCache.current[cacheKey] = translated
        setHtmlCache(globalCacheKey, translated)
        
        return translated
      } catch (error) {
        console.error("HTML translation error:", error)
        return content
      } finally {
        if (!isCancelled) {
          setIsTranslating(false)
        }
      }
    }

    const translationPromise = translateHtml()
    HTML_TRANSLATION_IN_FLIGHT.set(globalCacheKey, translationPromise)

    translationPromise
      .then((translated) => {
        if (!isCancelled && translated) {
          setTranslatedContent(translated)
        }
      })
      .finally(() => {
        HTML_TRANSLATION_IN_FLIGHT.delete(globalCacheKey)
      })

    return () => {
      isCancelled = true
    }
  }, [content, isArabic, currentLanguage.code])
  
  if (!content) return null
  
  return (
    <div 
      className={className}
      dir={isArabic ? "rtl" : "ltr"}
      dangerouslySetInnerHTML={{ __html: translatedContent }}
      style={{ opacity: isTranslating ? 0.7 : 1, transition: "opacity 0.2s" }}
    />
  )
}

export default TranslatedHtml
