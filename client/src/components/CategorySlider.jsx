// import React, { useState, useEffect, useRef } from "react"
// import { ChevronLeft, ChevronRight } from "lucide-react"

// const CategorySlider = ({ categories, onCategoryClick }) => {
//   const [categorySlide, setCategorySlide] = useState(0)
//   const [isTransitioning, setIsTransitioning] = useState(true)
//   const sliderRef = useRef(null)
//   const visibleCount = window.innerWidth >= 1024 ? 8 : window.innerWidth >= 768 ? 6 : 4
//   const total = categories.length

//   const nextCategorySlide = () => {
//     setIsTransitioning(true)
//     setCategorySlide((prev) => prev + 1)
//   }
//   const prevCategorySlide = () => {
//     setIsTransitioning(true)
//     setCategorySlide((prev) => prev - 1)
//   }

//   useEffect(() => {
//     if (total === 0) return;
//     if (categorySlide === total) {
//       setTimeout(() => {
//         setIsTransitioning(false)
//         setCategorySlide(0)
//       }, 300)
//     } else if (categorySlide === -1) {
//       setTimeout(() => {
//         setIsTransitioning(false)
//         setCategorySlide(total - 1)
//       }, 300)
//     } else {
//       setIsTransitioning(true)
//     }
//   }, [categorySlide, total])

//   return (
//     <section className="bg-white mb-5 mt-3 md:mt-4">
//       <div className="max-w-8xl lg:px-3">
//         <div className="flex items-center justify-between">
//           {/* Left Arrow */}
//           <button
//             onClick={prevCategorySlide}
//             className="text-black hover:text-gray-600 transition-opacity"
//           >
//             <ChevronLeft size={35} />
//           </button>
//           {/* Categories */}
//           <div className="flex-1 overflow-hidden">
//             <div
//               ref={sliderRef}
//               className="flex items-center gap-4 transition-transform duration-300 ease-in-out"
//               style={{
//                 transition: isTransitioning ? "transform 0.3s" : "none",
//                 width: `${((total * 2) / visibleCount) * 100}%`,
//                 transform: `translateX(-${(categorySlide + total) * (100 / (total * 2))}%)`,
//               }}
//               onTransitionEnd={() => {
//                 if (!isTransitioning) setIsTransitioning(true)
//               }}
//             >
//               {[...categories, ...categories].map((category, idx) => {
//                 if (!category || !category._id || !category.name) return null;
//                 return (
//                   <button
//                     key={`${category._id}-${idx}`}
//                     onClick={() => onCategoryClick(category.name)}
//                     className="flex flex-col items-center group transition-all flex-shrink-0 px-1"
//                     style={{
//                       width: `${100 / visibleCount}%`,
//                       maxWidth: "120px",
//                     }}
//                   >
//                     <div className="flex items-center justify-center">
//                       {category.image ? (
//                         <img
//                           src={category.image}
//                           alt={category.name}
//                           className="w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 object-cover"
//                         />
//                       ) : (
//                         <div className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
//                           <span className="text-lg md:text-2xl">📦</span>
//                         </div>
//                       )}
//                     </div>
//                     <span className="text-xs md:text-sm font-bold text-gray-700 text-center mt-1 max-w-16 md:max-w-none truncate">
//                       {category.name}
//                     </span>
//                   </button>
//                 )
//               })}
//             </div>
//           </div>
//           {/* Right Arrow */}
//           <button
//             onClick={nextCategorySlide}
//             className="text-black hover:text-gray-600 transition-opacity"
//           >
//             <ChevronRight size={35} />
//           </button>
//         </div>
//       </div>
//     </section>
//   )
// }

// export default CategorySlider 






//==========================================================================






import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CategorySlider = ({ categories = [], onCategoryClick }) => {
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(8); // default for desktop
  const [currentIndex, setCurrentIndex] = useState(0);

  // Update visible count based on screen size
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth >= 1280) {
        setVisibleCount(10); // extra large screens
      } else if (window.innerWidth >= 1024) {
        setVisibleCount(8); // large screens
      } else if (window.innerWidth >= 768) {
        setVisibleCount(6); // tablet
      } else {
        setVisibleCount(3); // mobile
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev - 1 < 0 ? categories.length - 1 : prev - 1
    );
  };

  // Compute visible items in order, as a loop
  const getVisibleCategories = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(categories[(currentIndex + i) % categories.length]);
    }
    return visible;
  };

  const visibleCategories = getVisibleCategories();

  return (
    <section className="bg-white mb-5 mt-3 md:mt-4">
      <div className="max-w-8xl lg:px-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="text-black hover:text-gray-600"
          >
            <ChevronLeft size={35} />
          </button>

          <div
            className="flex-1 overflow-hidden"
            ref={containerRef}
          >
            <div className="flex items-center lg:gap-10 xl:gap-[65px] transition-transform duration-300 ease-in-out">
              {visibleCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => onCategoryClick(category.name)}
                  className="flex flex-col items-center group flex-shrink-0 px-1"
                  style={{
                    width: `${100 / visibleCount}%`,
                    maxWidth: "120px",
                  }}
                >
                  <div className="flex items-center justify-center">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-14 h-14 md:w-20 md:h-20 lg:w-28 lg:h-28 object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-100">
                        <span className="text-lg md:text-2xl">📦</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-gray-700 text-center mt-1 truncate">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="text-black hover:text-gray-600"
          >
            <ChevronRight size={35} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
