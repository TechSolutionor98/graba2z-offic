"use client"

import { useState, useEffect, useRef } from "react"
import { useLanguage } from "../context/LanguageContext"
import config from "../config/config"
import './TipTapRenderer.css'
import './TipTapEditor.css'

/**
 * TranslatedTipTapRenderer Component
 * Renders TipTap content with translation support for Arabic
 */
const TranslatedTipTapRenderer = ({ content, className = "" }) => {
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
    
    // Create a hash for caching
    const cacheKey = `tiptap_${content.substring(0, 100)}_${currentLanguage.code}`
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
        
        if (textNodes.length === 0) {
          setTranslatedContent(content)
          return
        }
        
        // Batch translate - process in chunks to avoid overwhelming the API
        const CHUNK_SIZE = 5
        const translatedTexts = []
        
        for (let i = 0; i < textNodes.length; i += CHUNK_SIZE) {
          const chunk = textNodes.slice(i, i + CHUNK_SIZE)
          const chunkTranslations = await Promise.all(
            chunk.map(async ({ text }) => {
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
                console.error("Translation chunk error:", error)
                return text
              }
            })
          )
          translatedTexts.push(...chunkTranslations)
        }
        
        // Replace text nodes with translated text
        textNodes.forEach((item, index) => {
          if (translatedTexts[index]) {
            item.node.textContent = translatedTexts[index]
          }
        })
        
        // Get the translated HTML
        const translated = doc.body.innerHTML
        
        // Cache the result
        translationCache.current[cacheKey] = translated
        
        setTranslatedContent(translated)
      } catch (error) {
        console.error("TipTap translation error:", error)
        setTranslatedContent(content)
      } finally {
        setIsTranslating(false)
      }
    }
    
    translateHtml()
  }, [content, isArabic, currentLanguage.code])
  
  if (!content) return null
  
  const baseClasses = `tiptap-content prose prose-base md:prose-lg lg:prose-xl max-w-none
    prose-headings:font-bold prose-headings:text-gray-900 
    prose-h1:text-2xl md:prose-h1:text-4xl lg:prose-h1:text-5xl prose-h1:mb-6 prose-h1:leading-tight
    prose-h2:text-xl md:prose-h2:text-3xl lg:prose-h2:text-4xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:leading-snug
    prose-h3:text-lg md:prose-h3:text-2xl lg:prose-h3:text-3xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:leading-snug
    prose-h4:text-base md:prose-h4:text-xl lg:prose-h4:text-2xl prose-h4:mt-6 prose-h4:mb-3
    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-base md:prose-p:text-lg lg:prose-p:text-xl
    prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700
    prose-strong:text-gray-900 prose-strong:font-bold
    prose-em:text-gray-800 prose-em:italic
    prose-ul:my-6 prose-ul:space-y-2 prose-ul:list-disc prose-ul:pl-6
    prose-ol:my-6 prose-ol:space-y-2 prose-ol:list-decimal prose-ol:pl-6
    prose-li:text-gray-700 prose-li:leading-relaxed prose-li:marker:text-blue-600
    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-gray-700 prose-blockquote:my-6
    prose-code:text-sm prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
    prose-table:w-full prose-table:border-collapse prose-table:my-8
    prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:p-3 prose-th:text-left prose-th:font-semibold
    prose-td:border prose-td:border-gray-300 prose-td:p-3
    prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
    prose-video:rounded-lg prose-video:shadow-md prose-video:my-6 prose-video:max-w-full prose-video:h-auto
    first:prose-h1:mt-0 first:prose-h2:mt-0 first:prose-h3:mt-0
    [&_video]:rounded-lg [&_video]:shadow-md [&_video]:my-6 [&_video]:max-w-full [&_video]:h-auto`
  
  return (
    <div 
      className={`${baseClasses} ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
      dangerouslySetInnerHTML={{ __html: translatedContent }}
      style={{ opacity: isTranslating ? 0.7 : 1, transition: "opacity 0.2s" }}
    />
  )
}

export default TranslatedTipTapRenderer