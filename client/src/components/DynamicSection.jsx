import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import config from '../config/config'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getFullImageUrl } from '../utils/imageUtils'

function DynamicSection({ section }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (section?.slug) {
      fetchSectionCards()
    }
  }, [section?.slug])

  const fetchSectionCards = async () => {
    try {
      const { data } = await axios.get(`${config.API_URL}/api/banner-cards/section/${section.slug}`)
      setCards(data.filter(card => card.isActive))
      setLoading(false)
    } catch (error) {
      console.error('Error fetching section cards:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    )
  }

  if (cards.length === 0) {
    return null
  }

  const settings = section.settings || {}

  // Render based on section type
  switch (section.sectionType) {
    case 'background-image':
      return <BackgroundImageSection section={section} cards={cards} settings={settings} />
    
    case 'arrow-slider':
      return <ArrowSliderSection section={section} cards={cards} settings={settings} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
    
    case 'cards-left-image-right':
      return <CardsLeftImageRightSection section={section} cards={cards} settings={settings} />
    
    case 'cards-right-image-left':
      return <CardsRightImageLeftSection section={section} cards={cards} settings={settings} />
    
    case 'simple-cards':
      return <SimpleCardsSection section={section} cards={cards} settings={settings} />
    
    case 'vertical-grid':
      return <VerticalGridSection section={section} cards={cards} settings={settings} />
    
    default:
      return <SimpleCardsSection section={section} cards={cards} settings={settings} />
  }
}

// Background Image Section - 5 cards on background
function BackgroundImageSection({ section, cards, settings }) {
  const bgImage = settings.backgroundImage ? getFullImageUrl(settings.backgroundImage) : ''
  const overlayOpacity = settings.overlayOpacity || 0.2
  const cardsCount = settings.cardsCount || 5 // Get card count from settings

  return (
    <>
   <h2 className="text-2xl font-bold mb-2 mt-4 mx-5 text-black text-start">{section.name}</h2>
   {section.description && (
     <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
   )}
    <section 
      className="py-12 relative"
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '450px',
      }}
    >
      {/* Overlay */}
      {bgImage && (
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className="max-w-[1920px] mx-auto px-4 relative z-10">
       
        <div className="flex gap-6 flex-nowrap justify-center">
          {cards.slice(0, cardsCount).map((card) => {
            const cardBgColor = card.bgColor || '#ffffff'
            const cardWidth = `calc(${100 / cardsCount}% - ${24 * (cardsCount - 1) / cardsCount}px)`
            
            return (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0 rounded-lg"
                style={{ 
                  width: cardWidth, 
                  minWidth: cardWidth,
                  minHeight: '320px',
                  maxHeight: '320px',
                  backgroundColor: cardBgColor,
                }}
              >
              <div className="relative z-10 flex-grow flex flex-col">
                <h3 className="text-lg font-bold mb-2 group-hover:text-gray-900 line-clamp-1 text-gray-800">
                  {card.name}
                </h3>
                {card.details && (
                  <p className="text-sm mb-3 line-clamp-2 text-gray-600">
                    {card.details}
                  </p>
                )}
                <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 mt-auto">
                  Shop Now
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              
              {card.image && (
                <div className="mt-3 relative h-40 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover" />
                </div>
              )}
            </Link>
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}

// Arrow Slider Section - 3-6 cards with arrows
function ArrowSliderSection({ section, cards, settings, currentIndex, setCurrentIndex }) {
  const cardsCount = settings.cardsCount || 5
  const showArrows = settings.showArrows !== false
  const backgroundColor = settings.backgroundColor || '#f3f4f6'

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(cards.length - cardsCount, prev + 1))
  }

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < cards.length - cardsCount
  const visibleCards = cards.slice(currentIndex, currentIndex + cardsCount)

  return (
    <>
    <div className="flex items-center justify-between mx-5 mb-2 mt-4">
      <h2 className="text-2xl font-bold text-start text-gray-800">{section.name}</h2>
      {/* Navigation Arrows - Inline with heading */}
      {showArrows && cards.length > cardsCount && (
        <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="bg-white border-2 border-gray-300 rounded-lg p-3 transition-all group hover:bg-lime-500 hover:border-lime-500 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6 text-lime-500 group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="bg-white border-2 border-gray-300 rounded-lg p-3 transition-all group hover:bg-lime-500 hover:border-lime-500 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6 text-lime-500 group-hover:text-white transition-colors" />
              </button>
        </div>
      )}
    </div>
    {section.description && (
      <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
    )}
    <section className="py-12" style={{ backgroundColor, minHeight: '400px', maxHeight: '440px' }}>
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="relative">

          {/* Cards */}
          <div className="flex gap-6 px-12">
            {visibleCards.map((card) => (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="bg-white rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0"
                style={{ 
                  width: `calc(${100/cardsCount}% - ${24 * (cardsCount - 1) / cardsCount}px)`,
                  minHeight: '320px',
                }}
              >
                {/* Full-size image background */}
                {card.image && (
                  <img src={getFullImageUrl(card.image)} alt={card.name} className="absolute inset-0 w-full h-full bg-cover" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

// Cards Left + Image Right Section - 3 cards on left (8-grid), image on right (4-grid) with one-by-one auto-sliding
function CardsLeftImageRightSection({ section, cards, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sideImage = settings.sideImage || ''
  const backgroundColor = settings.backgroundColor || '#f3f4f6'
  const autoSlideInterval = settings.autoSlideInterval || 3000 // Default 3 seconds

  // Auto-slide effect - moves one card at a time
  useEffect(() => {
    if (cards.length <= 3) return // No need to slide if 3 or fewer cards

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length) // Loop through all cards
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [cards.length, autoSlideInterval])

  // Get 3 cards with wrapping
  const getVisibleCards = () => {
    const result = []
    for (let i = 0; i < 3; i++) {
      result.push(cards[(currentIndex + i) % cards.length])
    }
    return result
  }

  const cardsToShow = cards.length >= 3 ? getVisibleCards() : cards

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
     <section className="py-8" style={{ backgroundColor, minHeight: '450px', maxHeight: '450px' }}>
      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center">
        <div className="grid grid-cols-12 gap-6 w-full">
          {/* 3 Cards - 8 columns with one-by-one auto-sliding */}
          <div className="col-span-8 grid grid-cols-3 gap-6">
            {cardsToShow.map((card, index) => {
              const isCenterCard = index === 1 // Middle card
              const cardBgColor = card.bgColor || '#ffffff'
              const cardTextColor = card.textColor || '#1f2937'
              
              return (
                <Link
                  key={`${card._id}-${currentIndex}-${index}`}
                  to={card.linkUrl || '#'}
                  className={`p-4 hover:shadow-xl transition-all duration-500 group overflow-hidden relative ${
                    isCenterCard ? 'scale-105 shadow-xl z-10' : 'hover:scale-105'
                  }`}
                  style={{ 
                    minHeight: '380px', 
                    maxHeight: '380px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: cardBgColor
                  }}
                >
                  {/* Text Content - Top Section */}
                  <div className="relative z-10 flex-grow pb-2" style={{ color: cardTextColor }}>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">
                      {card.name}
                    </h3>
                    {card.details && (
                      <p className="text-xs mb-3 line-clamp-3" style={{ opacity: 0.85 }}>
                        {card.details}
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm font-semibold">
                      Shop Now
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  
                  {/* Image - Fixed at Bottom */}
                  {card.image && (
                    <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '160px', flexShrink: 0 }}>
                      <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Side Image - 4 columns */}
          {sideImage && (
            <div className="col-span-4">
              <div className="rounded-lg overflow-hidden" style={{ height: '380px' }}>
                <img src={getFullImageUrl(sideImage)} alt={section.name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
    </>
  )
}

// Cards Right + Image Left Section - image on left (4-grid), 3 cards on right (8-grid) with one-by-one auto-sliding
function CardsRightImageLeftSection({ section, cards, settings }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sideImage = settings.sideImage || ''
  const backgroundColor = settings.backgroundColor || '#f3f4f6'
  const autoSlideInterval = settings.autoSlideInterval || 3000 // Default 3 seconds

  // Auto-slide effect - moves one card at a time
  useEffect(() => {
    if (cards.length <= 3) return // No need to slide if 3 or fewer cards

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length) // Loop through all cards
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [cards.length, autoSlideInterval])

  // Get 3 cards with wrapping
  const getVisibleCards = () => {
    const result = []
    for (let i = 0; i < 3; i++) {
      result.push(cards[(currentIndex + i) % cards.length])
    }
    return result
  }

  const cardsToShow = cards.length >= 3 ? getVisibleCards() : cards

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
     <section className="py-8" style={{ backgroundColor, minHeight: '450px', maxHeight: '450px' }}>
      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center">
        <div className="grid grid-cols-12 gap-6 w-full">
          {/* Side Image - 4 columns */}
          {sideImage && (
            <div className="col-span-4">
              <div className="rounded-lg overflow-hidden" style={{ height: '380px' }}>
                <img src={getFullImageUrl(sideImage)} alt={section.name} className="w-full h-full bg-cover" />
              </div>
            </div>
          )}

          {/* 3 Cards - 8 columns with one-by-one auto-sliding */}
          <div className="col-span-8 grid grid-cols-3 gap-6">
            {cardsToShow.map((card, index) => {
              const isCenterCard = index === 1 // Middle card
              const cardBgColor = card.bgColor || '#ffffff' // Use bgColor from card model
              return (
                <Link
                  key={`${card._id}-${currentIndex}-${index}`}
                  to={card.linkUrl || '#'}
                  className={`p-4 hover:shadow-xl transition-all duration-500 group overflow-hidden relative ${
                    isCenterCard ? 'scale-105 shadow-xl z-10' : 'hover:scale-105'
                  }`}
                  style={{ 
                    minHeight: '380px', 
                    maxHeight: '380px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: cardBgColor
                  }}
                >
                  {/* Text Content - Top Section */}
                  <div className="relative z-10 flex-grow pb-2">
                    <h3 className="text-lg font-bold mb-2 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                      {card.name}
                    </h3>
                    {card.details && (
                      <p className="text-xs mb-3 line-clamp-3 text-gray-600">
                        {card.details}
                      </p>
                    )}
                    <span className="inline-flex items-center text-sm font-semibold text-blue-600">
                      Shop Now
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  
                  {/* Image - Fixed at Bottom */}
                  {card.image && (
                    <div className="relative w-full overflow-hidden rounded-lg mt-auto" style={{ height: '160px', flexShrink: 0 }}>
                      <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full bg-cover" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

// Simple Cards Section - Image-only display with dynamic card count
function SimpleCardsSection({ section, cards, settings }) {
  const backgroundColor = settings.backgroundColor || '#f3f4f6'
  const cardsCount = settings.cardsCount || 5 // Get card count from settings, default to 5
  
  // Calculate card width based on cards count
  const cardWidth = `calc(${100 / cardsCount}% - ${24 * (cardsCount - 1) / cardsCount}px)`

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
     <section className="py-8" style={{ backgroundColor, minHeight: '380px' }}>
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex gap-6 flex-nowrap w-full justify-center items-center">
          {cards.slice(0, cardsCount).map((card) => (
            <Link
              key={card._id}
              to={card.linkUrl || '#'}
              className="group overflow-hidden relative flex-shrink-0 transition-all duration-300 hover:scale-11"
              style={{ 
                width: cardWidth, 
                minWidth: cardWidth,
              }}
            >
              {card.image && (
                <div className="relative w-full overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl transition-shadow duration-300" style={{ height: '320px' }}>
                  <img 
                    src={getFullImageUrl(card.image)} 
                    alt={card.name} 
                    className="w-full h-full bg-cover"
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}



// Vertical Grid Section - Cards wrap to new rows based on cardsPerRow setting
function VerticalGridSection({ section, cards, settings }) {
  const cardsPerRow = settings.cardsPerRow || 7
  const backgroundColor = settings.backgroundColor || '#ffffff'
  
  // Calculate card width based on cards per row
  const cardWidthMap = {
    2: 'calc(50% - 12px)',
    3: 'calc(33.333% - 16px)',
    4: 'calc(25% - 18px)',
    5: 'calc(20% - 19.2px)',
    6: 'calc(16.666% - 20px)',
    7: 'calc(14.285% - 20px)',
  }
  const cardWidth = cardWidthMap[cardsPerRow] || cardWidthMap[7]

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
     <section className="py-8" style={{ backgroundColor, minHeight: '400px' }}>
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="flex gap-6 flex-wrap">
          {cards.map((card) => {
            
            return (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="group flex flex-col flex-shrink-0 transition-all duration-300 hover:scale-105"
                style={{ 
                  width: cardWidth,
                  minWidth: cardWidth,
                }}
              >
                {/* Image with rounded corners */}
                <div 
                  className="overflow-hidden rounded-3xl shadow-md group-hover:shadow-xl transition-shadow duration-300"
                  style={{ 
                    height: '200px',
                  }}
                >
                  {/* Full Image */}
                  {card.image && (
                    <img 
                      src={getFullImageUrl(card.image)} 
                      alt={card.name} 
                      className="w-full h-full bg-cover"
                    />
                  )}
                </div>
                
                {/* Text Below Image */}
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-gray-800 text-center line-clamp-2">
                    {card.name}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}

export default DynamicSection
