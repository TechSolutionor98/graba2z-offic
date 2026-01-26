"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../context/LanguageContext"
import config from "../config/config"

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
    // If English or no content, use original
    if (!isArabic || !content) {
      setTranslatedContent(content)
      return
    }
    
    // Check cache first
    const cacheKey = `${content.substring(0, 100)}_${currentLanguage.code}`
    if (translationCache.current[cacheKey]) {
      setTranslatedContent(translationCache.current[cacheKey])
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
          const text = node.textContent.trim()
          if (text && text.length > 0) {
            textNodes.push({ node, text })
          }
        }
        
        // Batch translate all text nodes
        const textsToTranslate = textNodes.map(n => n.text)
        
        if (textsToTranslate.length === 0) {
          setTranslatedContent(content)
          return
        }
        
        // Call translation API for batch translation
        const translatedTexts = await Promise.all(
          textsToTranslate.map(async (text) => {
            try {
              const response = await fetch(`${config.TRANSLATION_API_URL}/translate`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  text: text,
                  source_lang: "eng_Latn",
                  target_lang: "arb_Arab",
                }),
              })
              
              if (response.ok) {
                const data = await response.json()
                return data.translated_text || text
              }
              return text
            } catch (error) {
              console.error("Translation error:", error)
              return text
            }
          })
        )
        
        // Replace text nodes with translated text
        textNodes.forEach((item, index) => {
          item.node.textContent = translatedTexts[index]
        })
        
        // Get the translated HTML
        const translated = doc.body.innerHTML
        
        // Cache the result
        translationCache.current[cacheKey] = translated
        
        setTranslatedContent(translated)
      } catch (error) {
        console.error("HTML translation error:", error)
        setTranslatedContent(content)
      } finally {
        setIsTranslating(false)
      }
    }
    
    translateHtml()
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
