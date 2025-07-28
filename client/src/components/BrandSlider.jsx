
// import React, { useState, useEffect, useRef } from "react";

// const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
//   const [brandIndex, setBrandIndex] = useState(initialIndex);
//   const [visibleCount, setVisibleCount] = useState(8);
//   const sliderRef = useRef(null);
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const scrollLeft = useRef(0);

//   // Responsive count update
//   useEffect(() => {
//     const updateVisible = () => {
//       if (window.innerWidth < 768) setVisibleCount(3);
//       else if (window.innerWidth < 1024) setVisibleCount(6);
//       else if (window.innerWidth < 1536) setVisibleCount(8);
//       else setVisibleCount(10); // 10 logos on 2XL screens (1536px and above)
//     };
//     updateVisible();
//     window.addEventListener("resize", updateVisible);
//     return () => window.removeEventListener("resize", updateVisible);
//   }, []);

//   // Auto-scroll
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setBrandIndex((prev) => (prev + 1) % brands.length);
//     }, 3000);
//     return () => clearInterval(interval);
//   }, [brands.length]);

//   // Get visible brands in infinite loop
//   const getVisibleBrands = () => {
//     let visible = [];
//     for (let i = 0; i < visibleCount; i++) {
//       visible.push(brands[(brandIndex + i) % brands.length]);
//     }
//     return visible;
//   };

//   // Dragging handlers
//   const handleMouseDown = (e) => {
//     isDragging.current = true;
//     startX.current = e.pageX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };

//   const handleMouseLeave = () => {
//     isDragging.current = false;
//   };

//   const handleMouseUp = () => {
//     isDragging.current = false;
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const x = e.pageX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   const handleTouchStart = (e) => {
//     isDragging.current = true;
//     startX.current = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };

//   const handleTouchMove = (e) => {
//     if (!isDragging.current) return;
//     const x = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   const handleTouchEnd = () => {
//     isDragging.current = false;
//   };

//   return (
//     <section className="bg-white py-8">
//       <div className="max-w-8xl mx-auto">
//         <div className="relative mb-6">
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">Featured Brands</h2>
//         </div>
//         <div className="relative mx-3 md:mx-5">
//           <div
//             className="flex overflow-x-hidden no-scrollbar space-x-2"
//             ref={sliderRef}
//             onMouseDown={handleMouseDown}
//             onMouseLeave={handleMouseLeave}
//             onMouseUp={handleMouseUp}
//             onMouseMove={handleMouseMove}
//             onTouchStart={handleTouchStart}
//             onTouchMove={handleTouchMove}
//             onTouchEnd={handleTouchEnd}
//           >
//             {getVisibleBrands().map((brand, index) => (
//               <div
//                 key={`${brand._id}-${index}`}
//                 className="flex-shrink-0"
//                 style={{ width: "180px" }}
//               >
//                 <div className="px-2 md:px-3">
//                   <button
//                     onClick={() => onBrandClick && onBrandClick(brand.name)}
//                     className="flex flex-col items-center group transition-all duration-300 w-full"
//                   >
//                     <div className="w-22 h-22 md:w-26 md:h-26 lg:w-40 lg:h-40 overflow-hidden flex items-center justify-center ">
//                       <img
//                         src={brand.logo || "/placeholder.svg"}
//                         alt={brand.name}
//                         className="w-full h-full object-contain"
//                       />
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BrandSlider;


// =============

// import React, { useState, useEffect, useRef } from "react";

// const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
//   const [brandIndex, setBrandIndex] = useState(initialIndex);
//   const [visibleCount, setVisibleCount] = useState(8);
//   const [isMobile, setIsMobile] = useState(false);
//   const sliderRef = useRef(null);
//   const isDragging = useRef(false);
//   const startX = useRef(0);
//   const scrollLeft = useRef(0);

//   // Update visible count + isMobile on resize
//   useEffect(() => {
//     const updateVisible = () => {
//       const width = window.innerWidth;
//       if (width < 768) {
//         setVisibleCount(brands.length); // Show all on mobile
//         setIsMobile(true);
//       } else {
//         setIsMobile(false);
//         if (width < 1024) setVisibleCount(6);
//         else if (width < 1536) setVisibleCount(8);
//         else setVisibleCount(10);
//       }
//     };
//     updateVisible();
//     window.addEventListener("resize", updateVisible);
//     return () => window.removeEventListener("resize", updateVisible);
//   }, [brands.length]);

//   // Auto-scroll effect (mobile scrollLeft / desktop brandIndex)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (isMobile && sliderRef.current) {
//         const container = sliderRef.current;
//         const scrollAmount = 180 + 8; // card width + spacing

//         // If end reached, scroll back to start
//         if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 1) {
//           container.scrollTo({ left: 0, behavior: "smooth" });
//         } else {
//           container.scrollBy({ left: scrollAmount, behavior: "smooth" });
//         }
//       } else {
//         // Desktop: use brandIndex logic
//         setBrandIndex((prev) => (prev + 1) % brands.length);
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [brands.length, isMobile]);

//   // Get visible brands for desktop only
//   const getVisibleBrands = () => {
//     const visible = [];
//     for (let i = 0; i < visibleCount; i++) {
//       visible.push(brands[(brandIndex + i) % brands.length]);
//     }
//     return visible;
//   };

//   // Mouse drag (desktop)
//   const handleMouseDown = (e) => {
//     isDragging.current = true;
//     startX.current = e.pageX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };
//   const handleMouseLeave = () => (isDragging.current = false);
//   const handleMouseUp = () => (isDragging.current = false);
//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;
//     e.preventDefault();
//     const x = e.pageX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   // Touch drag (mobile)
//   const handleTouchStart = (e) => {
//     if (!isMobile) return;
//     isDragging.current = true;
//     startX.current = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     scrollLeft.current = sliderRef.current.scrollLeft;
//   };

//   const handleTouchMove = (e) => {
//     if (!isMobile || !isDragging.current) return;
//     const x = e.touches[0].clientX - sliderRef.current.offsetLeft;
//     const walk = (x - startX.current) * 1.2;
//     sliderRef.current.scrollLeft = scrollLeft.current - walk;
//   };

//   const handleTouchEnd = () => {
//     isDragging.current = false;
//   };

//   return (
//     <section className="bg-white py-8">
//       <div className="max-w-8xl mx-auto">
//         <div className="relative mb-6">
//           <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
//             Featured Brands
//           </h2>
//         </div>
//         <div className="relative mx-3 md:mx-5">
//           <div
//             className="flex overflow-x-hidden no-scrollbar space-x-2"
//             ref={sliderRef}
//             onMouseDown={handleMouseDown}
//             onMouseLeave={handleMouseLeave}
//             onMouseUp={handleMouseUp}
//             onMouseMove={handleMouseMove}
//             onTouchStart={handleTouchStart}
//             onTouchMove={handleTouchMove}
//             onTouchEnd={handleTouchEnd}
//           >
//             {(isMobile ? brands : getVisibleBrands()).map((brand, index) => (
//               <div
//                 key={`${brand._id}-${index}`}
//                 className="flex-shrink-0"
//                 style={{ width: "180px" }}
//               >
//                 <div className="px-2 md:px-3">
//                   <button
//                     onClick={() => onBrandClick && onBrandClick(brand.name)}
//                     className="flex flex-col items-center group transition-all duration-300 w-full"
//                   >
//                     <div className="w-22 h-22 md:w-26 md:h-26 lg:w-40 lg:h-40 overflow-hidden flex items-center justify-center">
//                       <img
//                         src={brand.logo || "/placeholder.svg"}
//                         alt={brand.name}
//                         className="w-full h-full object-contain"
//                       />
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default BrandSlider;


// =================


import React, { useState, useEffect, useRef } from "react";

const BrandSlider = ({ brands = [], onBrandClick, initialIndex = 0 }) => {
  const [brandIndex, setBrandIndex] = useState(initialIndex);
  const [visibleCount, setVisibleCount] = useState(8);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const duplicatedBrands = [...brands, ...brands]; // for infinite scroll

  // Update visible count + isMobile
  useEffect(() => {
    const updateVisible = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setVisibleCount(brands.length);
        setIsMobile(true);
      } else {
        setIsMobile(false);
        if (width < 1024) setVisibleCount(6);
        else if (width < 1536) setVisibleCount(8);
        else setVisibleCount(10);
      }
    };
    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, [brands.length]);

  // Auto-scroll with smooth loop (mobile) or index (desktop)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMobile && sliderRef.current) {
        const container = sliderRef.current;
        const scrollAmount = 180 + 8; // width + margin
        const midpoint = (container.scrollWidth / 2) - container.offsetWidth;

        if (container.scrollLeft >= midpoint) {
          // Reset instantly to start of original brands (no animation)
          container.scrollLeft = 0;
        } else {
          // Scroll to next brand smoothly
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      } else {
        // Desktop: brand index logic
        setBrandIndex((prev) => (prev + 1) % brands.length);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [brands.length, isMobile]);

  // Get visible brands for desktop
  const getVisibleBrands = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(brands[(brandIndex + i) % brands.length]);
    }
    return visible;
  };

  // Mouse (desktop) scroll
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };
  const handleMouseLeave = () => (isDragging.current = false);
  const handleMouseUp = () => (isDragging.current = false);
  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.2;
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Touch (mobile) scroll
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    isDragging.current = true;
    startX.current = e.touches[0].clientX - sliderRef.current.offsetLeft;
    scrollLeft.current = sliderRef.current.scrollLeft;
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging.current) return;
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 text-center">
            Featured Brands
          </h2>
        </div>
        <div className="relative mx-3 md:mx-5">
          <div
            className="flex overflow-x-hidden no-scrollbar space-x-2"
            ref={sliderRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {(isMobile ? duplicatedBrands : getVisibleBrands()).map((brand, index) => (
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
