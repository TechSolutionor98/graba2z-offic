"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import { getFullImageUrl } from "../utils/imageUtils"

const BannerSlider = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [banners.length, isAutoPlaying])

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  if (!banners || banners.length === 0) {
    return (
      <section className="relative bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 overflow-hidden h-[500px] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">No Banners Available</h1>
          <p className="text-xl">Please add hero banners from admin panel</p>
        </div>
      </section>
    )
  }

  const currentBanner = banners[currentSlide]

  // Helper function to render banner content
  const renderBannerContent = () => {
    const content = (
      <>
        <img
          src={getFullImageUrl(currentBanner.image) || "/placeholder.svg"}
          alt={currentBanner.title || "Banner"}
          className="w-full h-full cover"
        />
        {/* Optional subtle overlay for better navigation visibility */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </>
    )

    // Check if banner has a valid link
    const hasValidLink = currentBanner.buttonLink && currentBanner.buttonLink.trim() !== ""

    if (hasValidLink) {
      const link = currentBanner.buttonLink.trim()
      // Check if it's an external link
      const isExternal = link.startsWith("http://") || link.startsWith("https://")
      
      if (isExternal) {
        return (
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="absolute inset-0 cover cursor-pointer"
          >
            {content}
          </a>
        )
      } else {
        return (
          <Link 
            to={link} 
            className="absolute inset-0 cover cursor-pointer"
          >
            {content}
          </Link>
        )
      }
    }

    // No link, just render the content
    return (
      <div className="absolute inset-0 cover">
        {content}
      </div>
    )
  }

  return (
    <section
      className="relative w-full h-[170px] sm:h-[250px] md:h-[300px] lg:h-[310px] cover"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Full Banner Image - Clickable if link exists */}
      {renderBannerContent()}

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-3 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-all z-10 hidden sm:block"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-3 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full transition-all z-10 hidden sm:block"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}



      {/* Slide Indicators */}
      {/* {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10 hidden sm:flex">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide
                ? "bg-white"
                : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
            />
          ))}
        </div>
      )} */}

    </section>
  )
}

export default BannerSlider
