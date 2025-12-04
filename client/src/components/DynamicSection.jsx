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
    
    default:
      return <SimpleCardsSection section={section} cards={cards} settings={settings} />
  }
}

// Background Image Section - 5 cards on background
function BackgroundImageSection({ section, cards, settings }) {
  const bgImage = settings.backgroundImage || ''
  const overlayOpacity = settings.overlayOpacity || 0.2

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
        maxHeight: '450px',
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
          {cards.slice(0, 5).map((card) => (
            <Link
              key={card._id}
              to={card.linkUrl || '#'}
              className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0 bg-white rounded-lg"
              style={{ 
                width: 'calc(20% - 19.2px)', 
                minWidth: 'calc(20% - 19.2px)',
                minHeight: '320px',
              }}
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                  {card.name}
                </h3>
                {card.details && (
                  <p className="text-sm mb-4 line-clamp-3 text-gray-600">
                    {card.details}
                  </p>
                )}
                <span className="inline-flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                  Shop Now
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              
              {card.image && (
                <div className="mt-4 relative h-48 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover" />
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
    <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
    {section.description && (
      <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
    )}
    <section className="py-12" style={{ backgroundColor, minHeight: '400px', maxHeight: '440px' }}>
      <div className="max-w-[1920px] mx-auto px-4">
        {/* <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">{section.name}</h2> */}
        
        <div className="relative">
          {/* Navigation Arrows */}
          {showArrows && cards.length > cardsCount && (
            <>
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 transition-all ${
                  canGoPrev ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 transition-all ${
                  canGoNext ? 'hover:bg-gray-100 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Cards */}
          <div className="flex gap-6 px-12">
            {visibleCards.map((card) => (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="p-6 bg-white rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0"
                style={{ 
                  width: `calc(${100/cardsCount}% - ${24 * (cardsCount - 1) / cardsCount}px)`,
                  minHeight: '320px',
                }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-3 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                    {card.name}
                  </h3>
                  {card.details && (
                    <p className="text-sm mb-4 line-clamp-3 text-gray-600">
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
                
                {card.image && (
                  <div className="mt-4 relative h-48 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full bg-cover" />
                  </div>
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

// Cards Left + Image Right Section - 3 cards on left (8-grid), image on right (4-grid)
function CardsLeftImageRightSection({ section, cards, settings }) {
  const sideImage = settings.sideImage || ''
  const backgroundColor = settings.backgroundColor || '#f3f4f6'

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
     <section className="py-8" style={{ backgroundColor, minHeight: '450px', maxHeight: '450px' }}>
      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center">
        <div className="grid grid-cols-12 gap-6 w-full">
          {/* 3 Cards - 8 columns */}
          <div className="col-span-8 grid grid-cols-3 gap-6">
            {cards.slice(0, 3).map((card) => (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="p-4 bg-white rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col"
                style={{ minHeight: '380px', maxHeight: '380px' }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                    {card.name}
                  </h3>
                  {card.details && (
                    <p className="text-xs mb-3 line-clamp-2 text-gray-600">
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
                
                {card.image && (
                  <div className="mt-3 relative h-40 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </Link>
            ))}
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

// Cards Right + Image Left Section - image on left (4-grid), 3 cards on right (8-grid)
function CardsRightImageLeftSection({ section, cards, settings }) {
  const sideImage = settings.sideImage || ''
  const backgroundColor = settings.backgroundColor || '#f3f4f6'

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
                <img src={getFullImageUrl(sideImage)} alt={section.name} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* 3 Cards - 8 columns */}
          <div className="col-span-8 grid grid-cols-3 gap-6">
            {cards.slice(0, 3).map((card) => (
              <Link
                key={card._id}
                to={card.linkUrl || '#'}
                className="p-4 bg-white rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col"
                style={{ minHeight: '380px', maxHeight: '380px' }}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                    {card.name}
                  </h3>
                  {card.details && (
                    <p className="text-xs mb-3 line-clamp-2 text-gray-600">
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
                
                {card.image && (
                  <div className="mt-3 relative h-40 flex-shrink-0 overflow-hidden rounded-lg">
                    <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full object-cover" />
                  </div>
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

// Simple Cards Section - 5 cards with optional background color
function SimpleCardsSection({ section, cards, settings }) {
  const backgroundColor = settings.backgroundColor || '#f3f4f6'

  return (
    <>
     <h2 className="text-2xl mx-5 font-bold mb-2 mt-4 text-start text-gray-800">{section.name}</h2>
     {section.description && (
       <p className="text-sm text-gray-600 mx-5 mb-4">{section.description}</p>
     )}
     <section className="py-8" style={{ backgroundColor, minHeight: '450px', maxHeight: '450px' }}>
      <div className="max-w-[1920px] mx-auto px-4 h-full flex items-center">
        <div className="flex gap-6 flex-nowrap w-full justify-center">
          {cards.slice(0, 5).map((card) => (
            <Link
              key={card._id}
              to={card.linkUrl || '#'}
              className="p-4 bg-white rounded-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group overflow-hidden relative flex flex-col flex-shrink-0"
              style={{ 
                width: 'calc(20% - 19.2px)', 
                minWidth: 'calc(20% - 19.2px)',
                minHeight: '380px',
                maxHeight: '380px',
              }}
            >
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 group-hover:text-gray-900 line-clamp-2 text-gray-800">
                  {card.name}
                </h3>
                {card.details && (
                  <p className="text-xs mb-3 line-clamp-2 text-gray-600">
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
              
              {card.image && (
                <div className="mt-3 relative h-40 flex-shrink-0 overflow-hidden rounded-lg">
                  <img src={getFullImageUrl(card.image)} alt={card.name} className="w-full h-full bg-cover" />
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

export default DynamicSection
