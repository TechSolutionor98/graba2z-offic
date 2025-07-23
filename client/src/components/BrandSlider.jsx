// import React, { useState, useEffect } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
//   const [brandIndex, setBrandIndex] = useState(initialIndex);
//   const [visibleCount, setVisibleCount] = useState(8);

//   useEffect(() => {
//     const updateVisible = () => {
//       if (window.innerWidth < 768) setVisibleCount(4);
//       else if (window.innerWidth < 1024) setVisibleCount(6);
//       else setVisibleCount(8);
//     };
//     updateVisible();
//     window.addEventListener("resize", updateVisible);
//     return () => window.removeEventListener("resize", updateVisible);
//   }, []);

//   const totalBrands = brands.length;
//   const getVisibleBrands = () => {
//     if (!brands.length) return [];
//     let visible = [];
//     for (let i = 0; i < visibleCount; i++) {
//       visible.push(brands[(brandIndex + i) % totalBrands]);
//     }
//     return visible;
//   };
//   const handlePrevBrand = () => {
//     setBrandIndex((prev) => (prev - 1 + totalBrands) % totalBrands);
//   };
//   const handleNextBrand = () => {
//     setBrandIndex((prev) => (prev + 1) % totalBrands);
//   };

//   return (
//     <section className="bg-white py-8">
//       <div className="max-w-8xl mx-auto">
//         <div className="relative mb-6">
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">Featured Brands</h2>
//         </div>
//         <div className="relative mx-3 md:mx-5">
//           <div className="overflow-hidden relative">
//             <button
//               onClick={handlePrevBrand}
//               className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-100"
//               style={{ left: '-20px' }}
//               aria-label="Previous brands"
//             >
//               <ChevronLeft size={24} />
//             </button>
//             <div
//               className="flex transition-transform duration-300 ease-in-out"
//               style={{ width: `${visibleCount * 180}px` }}
//             >
//               {getVisibleBrands().map((brand, index) => (
//                 <div
//                   key={`${brand._id}-${index}`}
//                   className="flex-shrink-0"
//                   style={{ width: "180px" }}
//                 >
//                   <div className="px-2 md:px-3">
//                     <button
//                       onClick={() => onBrandClick && onBrandClick(brand.name)}
//                       className="flex flex-col items-center group transition-all duration-300 w-full"
//                     >
//                       <div className="w-22 h-22 md:w-26 md:h-26 lg:w-40 lg:h-40 overflow-hidden flex items-center justify-center">
//                         <img
//                           src={brand.logo || "/placeholder.svg"}
//                           alt={brand.name}
//                           className="w-full h-full "
//                         />
//                       </div>
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <button
//               onClick={handleNextBrand}
//               className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 shadow hover:bg-gray-100"
//               style={{ right: '-20px' }}
//               aria-label="Next brands"
//             >
//               <ChevronRight size={24} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BrandSlider; 




import React, { useState, useEffect, useRef } from "react";

const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
  const [brandIndex, setBrandIndex] = useState(initialIndex);
  const [visibleCount, setVisibleCount] = useState(8);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Responsive count update
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 768) setVisibleCount(3);
      else if (window.innerWidth < 1024) setVisibleCount(6);
      else setVisibleCount(8);
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setBrandIndex((prev) => (prev + 1) % brands.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [brands.length]);

  // Get visible brands in infinite loop
  const getVisibleBrands = () => {
    let visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(brands[(brandIndex + i) % brands.length]);
    }
    return visible;
  };

  // Dragging handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchStart = (e) => {
    isDragging.current = true;
    startX.current = e.touches[0].clientX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current) return;
    const x = e.touches[0].clientX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <section className="bg-white py-8">
      <div className="max-w-8xl mx-auto">
        <div className="relative mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">Featured Brands</h2>
        </div>
        <div className="relative mx-3 md:mx-5">
          <div
            className="flex overflow-x-hidden no-scrollbar space-x-3"
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {getVisibleBrands().map((brand, index) => (
              <div
                key={`${brand._id}-${index}`}
                className="flex-shrink-0"
                style={{ width: "180px" }}
              >
                <div className="px-2 md:px-3">
                  <button
                    onClick={() => onBrandClick && onBrandClick(brand.name)}
                    className="flex flex-col items-center group transition-all duration-300 w-full"
                  >
                    <div className="w-22 h-22 md:w-26 md:h-26 lg:w-40 lg:h-40 overflow-hidden flex items-center justify-center">
                      <img
                        src={brand.logo || "/placeholder.svg"}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandSlider;
