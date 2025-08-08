"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronDown, Minus, X, Filter as FilterIcon } from "lucide-react"
import axios from "axios"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useCart } from "../context/CartContext"
import HomeStyleProductCard from "../components/HomeStyleProductCard"
import productCache from "../services/productCache"
import { generateShopURL, parseShopURL, findCategoryByIdentifier, findSubcategoryByIdentifier, createSlug } from "../utils/urlUtils"

import config from "../config/config"
import 'rc-slider/assets/index.css';
import Slider from 'rc-slider';

const API_BASE_URL = `${config.API_URL}`



const bounceStyle = {
  animation: "bounce 1s infinite",
}
const bounceKeyframes = `
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}`
if (typeof document !== "undefined" && !document.getElementById("bounce-keyframes")) {
  const style = document.createElement("style")
  style.id = "bounce-keyframes"
  style.innerHTML = bounceKeyframes
  document.head.appendChild(style)
}

const PriceFilter = ({ min, max, onApply, initialRange }) => {
  const [range, setRange] = useState(initialRange || [min, max]);
  const [inputMin, setInputMin] = useState(range[0]);
  const [inputMax, setInputMax] = useState(range[1]);

  const handleSliderChange = (values) => {
    setRange(values);
    setInputMin(values[0]);
    setInputMax(values[1]);
  };

  const handleInputMin = (e) => {
    const value = e.target.value;
    // If input is empty, set to empty string to allow clearing
    if (value === "") {
      setInputMin("");
    } else if (!isNaN(value)) {
      // Only update if it's a valid number
      const numericValue = Number(value);
      setInputMin(numericValue);
      setRange([numericValue, range[1]]);
    }
  };

  const handleInputMax = (e) => {
    const value = e.target.value;
    // If input is empty, set to empty string to allow clearing
    if (value === "") {
      setInputMax("");
    } else if (!isNaN(value)) {
      // Only update if it's a valid number
      const numericValue = Number(value);
      setInputMax(numericValue);
      setRange([range[0], numericValue]);
    }
  };

  const handleMinFocus = (e) => {
    // Always clear the input on focus for better UX
    setInputMin("");
  };

  const handleMaxFocus = (e) => {
    // Always clear the input on focus for better UX
    setInputMax("");
  };

  const handleApply = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    // Ensure we have valid numbers before applying
    const minValue = inputMin === "" ? 0 : Number(inputMin);
    const maxValue = inputMax === "" ? max : Number(inputMax);
    onApply([minValue, maxValue]);
  };

  return (
    <div className="">

      <Slider
        range
        min={min}
        max={max}
        value={range}
        onChange={handleSliderChange}
        trackStyle={[{ backgroundColor: '#84cc16' }]} // lime-500
        handleStyle={[
          { backgroundColor: '#84cc16', borderColor: '#84cc16' },
          { backgroundColor: '#84cc16', borderColor: '#84cc16' },
        ]}
        railStyle={{ backgroundColor: '#e5e7eb' }}
      />
      <div className="flex justify-between mt-4 mb-2 text-xs font-semibold">
        <span>MIN</span>
        <span>MAX</span>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMin}
          min={min}
          max={inputMax}
          onChange={handleInputMin}
          onFocus={handleMinFocus}
          onBlur={() => {
            // When input loses focus, if it's empty, set it to 0
            if (inputMin === "") {
              setInputMin(0);
            }
          }}
        />
        <input
          type="number"
          className="w-1/2 border rounded px-2 py-1 text-center focus:border-lime-500 focus:ring-lime-500"
          value={inputMax}
          min={inputMin}
          max={max}
          onChange={handleInputMax}
          onFocus={handleMaxFocus}
          onBlur={() => {
            // When input loses focus, if it's empty, set it to max
            if (inputMax === "") {
              setInputMax(max);
            }
          }}
        />
      </div>
      <button
        type="button"
        className="w-full bg-white border border-lime-500 text-lime-600 rounded py-2 font-semibold hover:bg-lime-50 hover:text-lime-700 hover:border-lime-600 transition"
        onClick={handleApply}
      >
        Apply
      </button>
    </div>
  );
};

const Shop = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const { addToCart } = useCart()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedBrands, setSelectedBrands] = useState([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [maxPrice, setMaxPrice] = useState(10000)
  const [sortBy, setSortBy] = useState("newest")
  const [brandSearch, setBrandSearch] = useState("")
  const [subCategories, setSubCategories] = useState([])
  const [selectedSubCategories, setSelectedSubCategories] = useState([])
  const [stockFilters, setStockFilters] = useState({ inStock: false, outOfStock: false, onSale: false })
  const [minPrice, setMinPrice] = useState(0);

  // Filter panel states
  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showCategoryFilter, setShowCategoryFilter] = useState(true)
  const [showBrandFilter, setShowBrandFilter] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [productsToShow, setProductsToShow] = useState(20)
  const [delayedLoading, setDelayedLoading] = useState(false)
  const fetchTimeout = useRef();
  const loadingTimeout = useRef();

  // Load and filter products using cache
  const loadAndFilterProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the productCache service instead of direct API call
      const allProducts = await productCache.getProducts();

      if (!allProducts || allProducts.length === 0) {
        setError("No products available");
        setLoading(false);
        return;
      }

      // Apply filters
      const stockStatusFilters = []
      if (stockFilters.inStock) stockStatusFilters.push('inStock')
      if (stockFilters.outOfStock) stockStatusFilters.push('outOfStock')
      if (stockFilters.onSale) stockStatusFilters.push('onSale')

      const filters = {
        parent_category: selectedCategory !== "all" ? selectedCategory : null,
        category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
        brand: selectedBrands.length > 0 ? selectedBrands : null,
        search: searchQuery || null,
        priceRange: priceRange,
        stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
        sortBy: sortBy
      };

      const filteredProducts = productCache.filterProducts(allProducts, filters);

      if (filteredProducts.length > 0) {
        const prices = filteredProducts.map((p) => p.price || 0);
        const minProductPrice = Math.min(...prices);
        const max = Math.max(...prices);
        setMaxPrice(max);
        // Only reset price range if it matches the default (user hasn't changed it)
        if (priceRange[0] === 0 && priceRange[1] === 10000) {
          setPriceRange([minProductPrice, max]);
        }
        // Save minProductPrice in state for use in PriceFilter
        setMinPrice(minProductPrice);
      }

      setProducts(filteredProducts);
      setLoading(false);
    } catch (err) {
      setError("Error loading products");
      setLoading(false);
    }
  };

  // Filter products from cache without API calls (for instant filtering)
  const filterProductsFromCache = async () => {
    try {
      // Get cached products
      const allProducts = await productCache.getProducts();
      if (!allProducts || allProducts.length === 0) {
        await loadAndFilterProducts();
        return;
      }



      // Apply filters
      const stockStatusFilters = []
      if (stockFilters.inStock) stockStatusFilters.push('inStock')
      if (stockFilters.outOfStock) stockStatusFilters.push('outOfStock')
      if (stockFilters.onSale) stockStatusFilters.push('onSale')

      const filters = {
        parent_category: selectedCategory !== "all" ? selectedCategory : null,
        category: selectedSubCategories.length > 0 ? selectedSubCategories[0] : null,
        brand: selectedBrands.length > 0 ? selectedBrands : null,
        search: searchQuery || null,
        priceRange: priceRange,
        stockStatus: stockStatusFilters.length > 0 ? stockStatusFilters : null,
        sortBy: sortBy
      };

      const filteredProducts = productCache.filterProducts(allProducts, filters);

      if (filteredProducts.length > 0) {
        const prices = filteredProducts.map((p) => p.price || 0);
        const minProductPrice = Math.min(...prices);
        const max = Math.max(...prices);
        setMaxPrice(max);
        // Only reset price range if it matches the default (user hasn't changed it)
        if (priceRange[0] === 0 && priceRange[1] === 10000) {
          setPriceRange([minProductPrice, max]);
        }
        // Save minProductPrice in state for use in PriceFilter
        setMinPrice(minProductPrice);
      }

      setProducts(filteredProducts);

    } catch (err) {
      // Fallback to API if cache fails
      await loadAndFilterProducts();
    }
  };

  // Fetch categories and brands on mount
  useEffect(() => {
    fetchCategories()
    fetchBrands()
    fetchBanners()
    loadAndFilterProducts()
  }, [])

  // Filter products from cache when filters change (no API calls)
  useEffect(() => {
    if (fetchTimeout.current) clearTimeout(fetchTimeout.current);

    fetchTimeout.current = setTimeout(() => {
      filterProductsFromCache();
    }, 100); // 100ms debounce for instant filtering
    return () => {
      clearTimeout(fetchTimeout.current);
    };
  }, [selectedCategory, selectedBrands, searchQuery, priceRange, selectedSubCategories, stockFilters, sortBy]);

  // 1. On URL or categories change: set selectedCategory from the slug.
  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search);
    if (categories.length > 0) {
      const foundCategory = categories.find(
        cat => cat._id === urlParams.parentCategory || cat.slug === urlParams.parentCategory || createSlug(cat.name) === urlParams.parentCategory
      );
      setSelectedCategory(foundCategory ? foundCategory._id : "all");
    }
  }, [location.pathname, location.search, categories]);

  // 2. On selectedCategory change: fetch subcategories for that category.
  useEffect(() => {
    if (selectedCategory && selectedCategory !== "all") {
      fetchSubCategories();
    } else {
      setSubCategories([]);
      setSelectedSubCategories([]);
    }
  }, [selectedCategory]);

  // 3. On subCategories or URL change: set selectedSubCategories from the slug.
  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search);
    if (subCategories.length > 0 && urlParams.subcategory) {
      const foundSubcategory = subCategories.find(
        sub => sub._id === urlParams.subcategory || sub.slug === urlParams.subcategory || createSlug(sub.name) === urlParams.subcategory
      );
      setSelectedSubCategories(foundSubcategory ? [foundSubcategory._id] : []);
    } else {
      setSelectedSubCategories([]);
    }
  }, [location.pathname, location.search, subCategories]);

  // 4. On URL or brands change: set selectedBrands from the URL parameter
  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search);
    if (brands.length > 0 && urlParams.brand) {
      const foundBrand = brands.find(
        brand => brand.name === urlParams.brand || createSlug(brand.name) === createSlug(urlParams.brand)
      );
      if (foundBrand) {
        setSelectedBrands([foundBrand._id]);
      } else {
        setSelectedBrands([]);
      }
    }
  }, [location.pathname, location.search, brands]);

  // Add useEffect hook to parse search parameter from URL and update searchQuery state
  useEffect(() => {
    const urlParams = parseShopURL(location.pathname, location.search);
    if (urlParams.search) {
      setSearchQuery(urlParams.search);
    }
  }, [location.pathname, location.search]);

  // Debug: Log all loaded categories and subcategories
  useEffect(() => {
    if (categories.length > 0) {
      console.log('All loaded categories:', categories.map(c => ({ name: c.name, slug: c.slug, _id: c._id })));
    }
  }, [categories]);

  useEffect(() => {
    if (subCategories.length > 0) {
      console.log('All loaded subcategories:', subCategories.map(s => ({ name: s.name, slug: s.slug, _id: s._id })));
    }
  }, [subCategories]);

  // Reset productsToShow when filters change or products are refetched
  useEffect(() => {
    setProductsToShow(20)
  }, [selectedCategory, selectedBrands, searchQuery, priceRange, selectedSubCategories, stockFilters, products.length])

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/categories`)

      // Filter to only show parent categories
      const validCategories = data.filter((cat) => {
        const isValid =
          cat &&
          typeof cat === "object" &&
          cat.name &&
          typeof cat.name === "string" &&
          cat.name.trim() !== "" &&
          cat.isActive !== false &&
          !cat.isDeleted &&
          !cat.name.match(/^[0-9a-fA-F]{24}$/) && // Not an ID
          !cat.parentCategory // Only include categories without a parent

        return isValid
      })

      setCategories(validCategories)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/brands`)

      // Filter and validate brands
      const validBrands = data.filter((brand) => {
        const isValid =
          brand &&
          typeof brand === "object" &&
          brand.name &&
          typeof brand.name === "string" &&
          brand.name.trim() !== "" &&
          brand.isActive !== false &&
          !brand.name.match(/^[0-9a-fA-F]{24}$/) // Not an ID

        return isValid
      })

      setBrands(validBrands)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchBanners = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/banners`)
      setBanners(data)
    } catch (err) {
      // Handle error silently
    }
  }

  const fetchSubCategories = async () => {
    try {
      const catObj = categories.find((cat) => cat._id === selectedCategory)
      if (!catObj) return

      const { data } = await axios.get(`${API_BASE_URL}/api/subcategories?category=${catObj._id}`)

      // Filter and validate subcategories
      const validSubCategories = data.filter((subCat) => {
        const isValid =
          subCat &&
          typeof subCat === "object" &&
          subCat.name &&
          typeof subCat.name === "string" &&
          subCat.name.trim() !== "" &&
          subCat.isActive !== false &&
          !subCat.isDeleted &&
          !subCat.name.match(/^[0-9a-fA-F]{24}$/) // Not an ID

        return isValid
      })

      setSubCategories(validSubCategories)
    } catch (err) {
      // Handle error silently
    }
  }

  const filteredBrands = brands.filter((brand) => brand.name.toLowerCase().includes(brandSearch.toLowerCase()))

  // When a parent category is selected, clear subcategory selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedSubCategories([])

    // Find the category object to get its name for URL generation
    const categoryObj = categories.find(cat => cat._id === categoryId);
    const categoryName = categoryObj ? categoryObj.name : categoryId;

    // Generate SEO-friendly URL
    const url = generateShopURL({
      parentCategory: categoryId !== "all" ? categoryName : null,
      brand: selectedBrands.length > 0 ? brands.find(b => b._id === selectedBrands[0])?.name : null,
      search: searchQuery || null
    });

    navigate(url);
  }

  // When a subcategory is selected, set both parent and subcategory in the filter
  const handleSubCategoryChange = (subCatId) => {
    setSelectedSubCategories([subCatId]);
    // Find the parent category for this subcategory
    const subcatObj = subCategories.find((sub) => sub._id === subCatId);
    // category could be either an object or a string
    let parentId;
    if (subcatObj) {
      parentId = typeof subcatObj.category === "object" ? subcatObj.category._id : subcatObj.category;
    } else {
      parentId = selectedCategory;
    }
    setSelectedCategory(parentId);

    // Find the category and subcategory objects to get their names for URL generation
    const categoryObj = categories.find(cat => cat._id === parentId);
    const subcategoryObj = subCategories.find(sub => sub._id === subCatId);

    const categoryName = categoryObj ? categoryObj.name : parentId;
    const subcategoryName = subcategoryObj ? subcategoryObj.name : subCatId;

    // Generate SEO-friendly URL
    const url = generateShopURL({
      parentCategory: parentId !== "all" ? categoryName : null,
      subcategory: subcategoryName,
      brand: selectedBrands.length > 0 ? brands.find(b => b._id === selectedBrands[0])?.name : null,
      search: searchQuery || null
    });

    // Debug log for subcategory change
    console.log('handleSubCategoryChange called with:', { subCatId, parentId, subcatObj, url, subCategories });
    navigate(url);
  }

  const handleBrandChange = (brandId) => {
    setSelectedBrands((prev) => (prev.includes(brandId) ? prev.filter((b) => b !== brandId) : [...prev, brandId]))

    // Update URL with brand filter
    const newSelectedBrands = selectedBrands.includes(brandId)
      ? selectedBrands.filter((b) => b !== brandId)
      : [...selectedBrands, brandId];

    const categoryObj = categories.find(cat => cat._id === selectedCategory);
    const subcategoryObj = selectedSubCategories.length > 0
      ? subCategories.find(sub => sub._id === selectedSubCategories[0])
      : null;

    const url = generateShopURL({
      parentCategory: selectedCategory !== "all" ? (categoryObj?.name || selectedCategory) : null,
      subcategory: subcategoryObj?.name || (selectedSubCategories[0] || null),
      brand: newSelectedBrands.length > 0 ? brands.find(b => b._id === newSelectedBrands[0])?.name : null,
      search: searchQuery || null
    });

    navigate(url);
  }

  const handleStockFilterChange = (key) => {
    setStockFilters((prev) => {
      // For radio buttons, only one can be selected at a time
      const newState = { inStock: false, outOfStock: false, onSale: false }
      newState[key] = true
      return newState
    })
  }

  // Handle search query changes and update URL
  const handleSearchChange = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);

    // Update URL with search query
    const categoryObj = categories.find(cat => cat._id === selectedCategory);
    const subcategoryObj = selectedSubCategories.length > 0
      ? subCategories.find(sub => sub._id === selectedSubCategories[0])
      : null;

    const url = generateShopURL({
      parentCategory: selectedCategory !== "all" ? (categoryObj?.name || selectedCategory) : null,
      subcategory: subcategoryObj?.name || (selectedSubCategories[0] || null),
      brand: selectedBrands.length > 0 ? brands.find(b => b._id === selectedBrands[0])?.name : null,
      search: newSearchQuery || null
    });

    navigate(url);
  }

  const clearAllFilters = () => {
    setSelectedCategory("all")
    setSelectedBrands([])
    setSelectedSubCategories([])
    setPriceRange([0, maxPrice])
    setSearchQuery("")
    setStockFilters({ inStock: false, outOfStock: false, onSale: false })
    navigate("/shop")
  }

  // Show loading only on initial load, not on filter changes
  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <img src="/g.png" alt="Loading..." style={{ width: 180, height: 180, animation: 'bounce 1s infinite' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  // Add debug log before rendering
  console.log('Products being rendered:', products)

  // Get selected subcategory object
  const selectedSubCategoryObj = subCategories.find(
    (sub) => sub._id === selectedSubCategories[0]
  );

  // 1. Add a handler for sort dropdown
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Button */}
        <div className="block md:hidden mb-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white rounded font-semibold shadow hover:bg-lime-600 transition"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FilterIcon size={20} />
            Filter
          </button>
        </div>
        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-40" onClick={() => setIsMobileFilterOpen(false)}></div>
            {/* Drawer */}
            <div className="relative bg-white w-80 max-w-full h-full shadow-xl p-6 overflow-y-auto ml-auto animate-slideInRight">
              <button
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsMobileFilterOpen(false)}
                aria-label="Close filter"
              >
                <X size={24} />
              </button>
              {/* Filter Content (copied from sidebar) */}
              <div className="space-y-6 mt-6">
                {/* Price Filter */}
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowPriceFilter(!showPriceFilter)}
                    className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                  >
                    Price Range
                    {showPriceFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showPriceFilter && (
                    <div className="mt-4 space-y-4">
                      <PriceFilter
                        min={minPrice}
                        max={maxPrice}
                        initialRange={priceRange}
                        onApply={(range) => setPriceRange(range)}
                      />
                    </div>
                  )}
                </div>
                {/* Categories Filter */}
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                  >
                    Categories
                    {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showCategoryFilter && (
                    <div className="mt-4 space-y-2">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleCategoryChange("all")}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="category-group"
                            checked={selectedCategory === "all"}
                            readOnly
                            className="absolute opacity-0 w-0 h-0"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${selectedCategory === "all"
                            ? 'border-lime-600 bg-lime-600'
                            : 'border-gray-300'
                            }`}>
                            {selectedCategory === "all" && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">All Categories</span>
                      </div>

                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className="flex items-center cursor-pointer"
                          onClick={() => handleCategoryChange(category._id)}
                        >
                          <div className="relative flex items-center">
                            <input
                              type="radio"
                              name="category-group"
                              checked={selectedCategory === category._id}
                              readOnly
                              className="absolute opacity-0 w-0 h-0"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${selectedCategory === category._id
                              ? 'border-lime-600 bg-lime-600'
                              : 'border-gray-300'
                              }`}>
                              {selectedCategory === category._id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Subcategories Filter */}
                {subCategories.length > 0 && (
                  <div className="border-b pb-4">
                    <button className="flex items-center justify-between w-full text-left font-medium text-gray-900">
                      {categories.find((cat) => cat._id === selectedCategory)?.name} Subcategories
                    </button>
                    <div className="mt-4 space-y-2">
                      {subCategories.map((subcat) => (
                        <div
                          key={subcat._id}
                          className="flex items-center cursor-pointer"
                          onClick={() => handleSubCategoryChange(subcat._id)}
                        >
                          <div className="relative flex items-center">
                            <input
                              type="radio"
                              name="subcategory-group"
                              checked={selectedSubCategories[0] === subcat._id}
                              readOnly
                              className="absolute opacity-0 w-0 h-0"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${selectedSubCategories[0] === subcat._id
                              ? 'border-lime-600 bg-lime-600'
                              : 'border-gray-300'
                              }`}>
                              {selectedSubCategories[0] === subcat._id && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-gray-700">{subcat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {brands.length > 0 && (
                  <div className="border-b pb-4">
                    <button
                      onClick={() => setShowBrandFilter(!showBrandFilter)}
                      className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                    >
                      Brands
                      {showBrandFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showBrandFilter && (
                      <div className="mt-4 space-y-3">
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={16}
                          />
                          <input
                            type="text"
                            placeholder="Search brands"
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {filteredBrands.map((brand) => (
                            <div
                              key={brand._id}
                              className="flex items-center cursor-pointer"
                              onClick={() => handleBrandChange(brand._id)}
                            >
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  checked={selectedBrands.includes(brand._id)}
                                  readOnly
                                  className="absolute opacity-0 w-0 h-0"
                                />
                                <div className={`w-4 h-4 border-2 flex items-center justify-center mr-2 ${selectedBrands.includes(brand._id)
                                  ? 'border-lime-600 bg-lime-600'
                                  : 'border-gray-300 rounded'
                                  }`}>
                                  {selectedBrands.includes(brand._id) && (
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className="text-sm text-gray-700">{brand.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stock/On Sale Filter */}
                <div className="border-b pb-4">
                  <button className="flex items-center justify-between w-full text-left font-medium text-gray-900">
                    Stock Status
                  </button>
                  <div className="mt-4 space-y-2">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleStockFilterChange("inStock")}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="stock-group"
                          checked={stockFilters.inStock}
                          readOnly
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${stockFilters.inStock
                          ? 'border-lime-600 bg-lime-600'
                          : 'border-gray-300'
                          }`}>
                          {stockFilters.inStock && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">In Stock</span>
                    </div>

                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleStockFilterChange("outOfStock")}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="stock-group"
                          checked={stockFilters.outOfStock}
                          readOnly
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${stockFilters.outOfStock
                          ? 'border-lime-600 bg-lime-600'
                          : 'border-gray-300'
                          }`}>
                          {stockFilters.outOfStock && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">Out of Stock</span>
                    </div>

                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleStockFilterChange("onSale")}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="stock-group"
                          checked={stockFilters.onSale}
                          readOnly
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${stockFilters.onSale
                          ? 'border-lime-600 bg-lime-600'
                          : 'border-gray-300'
                          }`}>
                          {stockFilters.onSale && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">On Sale</span>
                    </div>
                  </div>
                </div>

                {/* Brands Filter */}

              </div>
            </div>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters (hidden on mobile) */}
          <div className="lg:w-1/4 hidden md:block">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Search */}
              <div>
                {/* <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products..."
                                    value={searchQuery}
                onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div> */}
              </div>

              {/* Price Filter */}
              <div className="border-b pb-4">
                <button
                  onClick={() => setShowPriceFilter(!showPriceFilter)}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                >
                  Price Range
                  {showPriceFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                </button>
                {showPriceFilter && (
                  <div className="mt-4 space-y-4">
                    <PriceFilter
                      min={minPrice} // Use true minimum product price for the slider and input
                      max={maxPrice}
                      initialRange={priceRange}
                      onApply={(range) => setPriceRange(range)}
                    />
                  </div>
                )}
              </div>

              {/* Categories Filter */}
              <div className="border-b pb-4">
                <button
                  onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                >
                  Categories
                  {showCategoryFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                </button>
                {showCategoryFilter && (
                  <div className="mt-4 space-y-2">
                    <div
                      className="flex items-center cursor-pointer"
                      onClick={() => handleCategoryChange("all")}
                    >
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="category-group"
                          checked={selectedCategory === "all"}
                          readOnly
                          className="absolute opacity-0 w-0 h-0"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${selectedCategory === "all"
                          ? 'border-lime-600 bg-lime-600'
                          : 'border-gray-300'
                          }`}>
                          {selectedCategory === "all" && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-700">All Categories</span>
                    </div>

                    {categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center cursor-pointer"
                        onClick={() => handleCategoryChange(category._id)}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="category-group"
                            checked={selectedCategory === category._id}
                            readOnly
                            className="absolute opacity-0 w-0 h-0"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${selectedCategory === category._id
                            ? 'border-lime-600 bg-lime-600'
                            : 'border-gray-300'
                            }`}>
                            {selectedCategory === category._id && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subcategories Filter */}
              {subCategories.length > 0 && (
                <div className="border-b pb-4">
                  <button className="flex items-center justify-between w-full text-left font-medium text-gray-900">
                    {categories.find((cat) => cat._id === selectedCategory)?.name} Subcategories
                  </button>
                  <div className="mt-4 space-y-2">
                    {subCategories.map((subcat) => (
                      <div
                        key={subcat._id}
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSubCategoryChange(subcat._id)}
                      >
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            name="subcategory-group"
                            checked={selectedSubCategories[0] === subcat._id}
                            readOnly
                            className="absolute opacity-0 w-0 h-0"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${selectedSubCategories[0] === subcat._id
                            ? 'border-lime-600 bg-lime-600'
                            : 'border-gray-300'
                            }`}>
                            {selectedSubCategories[0] === subcat._id && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-700">{subcat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Brands Filter */}
              {brands.length > 0 && (
                <div className="border-b pb-4">
                  <button
                    onClick={() => setShowBrandFilter(!showBrandFilter)}
                    className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                  >
                    Brands
                    {showBrandFilter ? <Minus size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showBrandFilter && (
                    <div className="mt-4 space-y-3">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Search brands"
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {filteredBrands.map((brand) => (
                          <label key={brand._id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedBrands.includes(brand._id)}
                              onChange={() => handleBrandChange(brand._id)}
                              onClick={(e) => e.stopPropagation()} // Prevent event bubbling
                              className="mr-2 h-4 w-4 text-lime-600 focus:ring-lime-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-700">{brand.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stock/On Sale Filter */}
              <div className="border-b pb-4">
                <button className="flex items-center justify-between w-full text-left font-medium text-gray-900">
                  Stock
                </button>
                <div className="mt-4 space-y-2">
                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleStockFilterChange("inStock")}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="stock-group"
                        checked={stockFilters.inStock}
                        readOnly
                        className="absolute opacity-0 w-0 h-0"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${stockFilters.inStock
                        ? 'border-lime-600 bg-lime-600'
                        : 'border-gray-300'
                        }`}>
                        {stockFilters.inStock && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">In Stock</span>
                  </div>

                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleStockFilterChange("outOfStock")}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="stock-group"
                        checked={stockFilters.outOfStock}
                        readOnly
                        className="absolute opacity-0 w-0 h-0"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${stockFilters.outOfStock
                        ? 'border-lime-600 bg-lime-600'
                        : 'border-gray-300'
                        }`}>
                        {stockFilters.outOfStock && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">Out of Stock</span>
                  </div>

                  <div
                    className="flex items-center cursor-pointer"
                    onClick={() => handleStockFilterChange("onSale")}
                  >
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        name="stock-group"
                        checked={stockFilters.onSale}
                        readOnly
                        className="absolute opacity-0 w-0 h-0"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${stockFilters.onSale
                        ? 'border-lime-600 bg-lime-600'
                        : 'border-gray-300'
                        }`}>
                        {stockFilters.onSale && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">On Sale</span>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="pt-4">
                <button
                  onClick={clearAllFilters}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Category Banner - Show when specific category is selected and banner exists */}
            {banners.find((banner) => banner.category === selectedCategory && banner.isActive) && (
              <div className="mb-8">
                <div
                  className="relative rounded-lg overflow-hidden"
                  style={{
                    background:
                      banners.find((banner) => banner.category === selectedCategory && banner.isActive)
                        ?.backgroundColor || "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                    minHeight: "300px",
                  }}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-20 w-32 h-32 border-2 border-white rounded-full"></div>
                    <div className="absolute top-20 right-40 w-24 h-24 border border-white rounded-full"></div>
                    <div className="absolute bottom-20 right-10 w-40 h-40 border border-white rounded-full"></div>
                  </div>

                  <div className="relative z-10 flex items-center justify-between p-8 h-full">
                    <div className="flex-1 text-white">
                      <h2 className="text-4xl font-bold mb-4">
                        {banners.find((banner) => banner.category === selectedCategory && banner.isActive)?.title ||
                          `Shop ${categories.find((cat) => cat._id === selectedCategory)?.name}`}
                      </h2>
                      <p className="text-xl mb-6 opacity-90">
                        {banners.find((banner) => banner.category === selectedCategory && banner.isActive)
                          ?.description ||
                          `Discover our amazing collection of ${categories.find((cat) => cat._id === selectedCategory)?.name.toLowerCase()} products`}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold">
                          {products.length} Products Available
                        </span>
                      </div>
                    </div>
                    {banners.find((banner) => banner.category === selectedCategory && banner.isActive)?.image && (
                      <div className="flex-shrink-0 ml-8">
                        <img
                          src={banners.find((banner) => banner.category === selectedCategory && banner.isActive).image}
                          alt={categories.find((cat) => cat._id === selectedCategory)?.name}
                          className="w-64 h-48 cover rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {searchQuery.trim() ? (
                    <>Results for "{searchQuery.trim()}"</>
                  ) : selectedSubCategoryObj
                    ? selectedSubCategoryObj.name
                    : categories.find((cat) => cat._id === selectedCategory)?.name || "All Products"}
                </h1>
                <p className="text-gray-600 mt-1">{products.length} products found</p>
              </div>

              {/* Sort Dropdown */}
              <div className="mt-4 sm:mt-0">
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.slice(0, productsToShow).map((product) => (
                    <HomeStyleProductCard key={product._id} product={product} />
                  ))}
                </div>
                {productsToShow < products.length && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setProductsToShow((prev) => prev + 20)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors font-semibold"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No products found</div>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shop
