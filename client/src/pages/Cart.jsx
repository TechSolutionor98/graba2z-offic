"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { Trash2, Minus, Plus, ShoppingBag, Package } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import axios from "axios"

import config from "../config/config"

const Cart = () => {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    removeBundleFromCart,
    updateQuantity,
    getGroupedCartItems,
    deliveryOptions,
    setDeliveryOptions,
    selectedDelivery,
    setSelectedDelivery,
    tax,
    setTax,
    coupon,
    setCoupon,
    couponDiscount,
    setCouponDiscount,
  } = useCart()

  const [couponInput, setCouponInput] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  // Add debugging
  useEffect(() => {
    console.log('Cart component - cartItems updated:', cartItems)
    console.log('Cart component - cartTotal:', cartTotal)
  }, [cartItems, cartTotal])

  const { grouped, standaloneItems } = getGroupedCartItems()

  // Add debugging for grouped items
  useEffect(() => {
    console.log('Cart component - grouped items:', grouped)
    console.log('Cart component - standalone items:', standaloneItems)
    console.log('Cart component - bundle groups keys:', Object.keys(grouped))
  }, [grouped, standaloneItems])

  useEffect(() => {
    // Fetch delivery options
    const fetchDeliveryOptions = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/delivery-charges`)
        setDeliveryOptions(data)
        if (!selectedDelivery && data.length > 0) {
          setSelectedDelivery(data[0])
        }
      } catch (err) {
        console.error('Error fetching delivery options:', err)
      }
    }
    // Fetch tax
    const fetchTax = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/tax`)
        // Use first active tax
        if (data && data.length > 0) setTax(data[0])
      } catch (err) {
        console.error('Error fetching tax:', err)
      }
    }
    fetchDeliveryOptions()
    fetchTax()
  }, [])

  useEffect(() => {
    if (cartItems.length > 0) {
      // Push view cart event to data layer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'view_cart',
        'ecommerce': {
          'currency': 'AED',
          'value': cartTotal,
          'items': cartItems.map(item => ({
            'item_id': item._id,
            'item_name': item.name,
            'item_category': item.parentCategory?.name || item.category?.name || 'Uncategorized',
            'item_brand': item.brand?.name || 'Unknown',
            'price': item.price,
            'quantity': item.quantity
          }))
        }
      });
      
      console.log('View cart tracked, items:', cartItems.length);
    }
  }, [cartItems, cartTotal]);

  const handleQuantityChange = (productId, newQuantity, bundleId = null) => {
    updateQuantity(productId, newQuantity, bundleId)
  }

  // UPDATED: Function to remove single item from bundle - Now removes entire bundle
  const removeItemFromBundle = (itemId, bundleId) => {
    // Remove the entire bundle when any item is removed
    removeBundleFromCart(bundleId)
  }

  // Delivery charge (free if cartTotal > 500)
  const deliveryCharge = selectedDelivery ? (cartTotal > 500 ? 0 : selectedDelivery.charge) : 0

  // Tax is included in prices, no separate calculation needed
  const taxAmount = 0

  // Coupon logic
  const handleApplyCoupon = async () => {
    setCouponLoading(true)
    setCouponError("")
    try {
      const cartApiItems = cartItems.map(item => ({ product: item._id, qty: item.quantity }))
      const { data } = await axios.post(`${config.API_URL}/api/coupons/validate`, {
        code: couponInput,
        cartItems: cartApiItems,
      })
      setCoupon(data.coupon)
      setCouponDiscount(data.discountAmount)
      setCouponError("")
    } catch (err) {
      setCoupon(null)
      setCouponDiscount(0)
      setCouponError(err.response?.data?.message || "Invalid coupon")
    } finally {
      setCouponLoading(false)
    }
  }

  const formatPrice = (price) => {
    return `AED ${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  // FIXED: Proper pricing calculation for bundle items
  const getItemPrice = (item) => {
    // If it's a bundle item with bundle price, use that
    if (item.isBundleItem && item.bundlePrice) {
      return item.bundlePrice
    }
    // If it has bundle discount, apply 25% discount
    if (item.bundleDiscount && item.originalPrice) {
      return item.originalPrice * 0.75 // 25% discount
    }
    // Otherwise use offer price or regular price
    return item.offerPrice && item.offerPrice > 0 ? item.offerPrice : item.price
  }

  // FIXED: Calculate actual item total with proper pricing
  const getItemTotal = (item) => {
    const itemPrice = getItemPrice(item)
    return itemPrice * item.quantity
  }

  // FIXED: Helper function to get pricing details for an item
  const getItemPricingDetails = (item) => {
    const originalPrice = Number(item.originalPrice || item.basePrice || item.price) || 0
    const currentPrice = getItemPrice(item)
    
    const savings = originalPrice > currentPrice ? originalPrice - currentPrice : 0
    const discountPercentage = savings > 0 ? Math.round((savings / originalPrice) * 100) : 0
    
    return {
      basePrice: originalPrice,
      currentPrice: currentPrice,
      savings,
      discountPercentage,
      hasDiscount: savings > 0,
      isBundleDiscount: item.bundleDiscount || false
    }
  }

  // FIXED: Calculate cart totals properly
  const calculateCartTotals = useMemo(() => {
    let totalBasePrice = 0
    let totalCurrentPrice = 0
    let totalSavings = 0
    
    cartItems.forEach(item => {
      const pricingDetails = getItemPricingDetails(item)
      totalBasePrice += pricingDetails.basePrice * item.quantity
      totalCurrentPrice += pricingDetails.currentPrice * item.quantity
      totalSavings += pricingDetails.savings * item.quantity
    })
    
    return {
      totalBasePrice,
      totalCurrentPrice,
      totalSavings
    }
  }, [cartItems])

  // FIXED: Calculate bundle totals properly
  const calculateBundleTotals = (bundleItems) => {
    let bundleBaseTotal = 0
    let bundleCurrentTotal = 0
    let bundleSavings = 0
    
    bundleItems.forEach(item => {
      const pricingDetails = getItemPricingDetails(item)
      bundleBaseTotal += pricingDetails.basePrice * item.quantity
      bundleCurrentTotal += pricingDetails.currentPrice * item.quantity
      bundleSavings += pricingDetails.savings * item.quantity
    })
    
    return {
      total: bundleCurrentTotal,
      savings: bundleSavings,
      baseTotal: bundleBaseTotal
    }
  }

  const cartTotals = calculateCartTotals
  const totalWithDeliveryTaxCoupon = cartTotals.totalCurrentPrice + deliveryCharge + taxAmount - couponDiscount

  // Render individual item component
  const renderItem = (item, isInBundle = false, bundleId = null) => {
    const pricingDetails = getItemPricingDetails(item)
    const itemTotal = getItemTotal(item)
    
    return (
      <li key={`${item._id}-${bundleId || 'standalone'}`} className="p-3">
        {/* Mobile Card */}
        <div className="block sm:hidden">
          <div className="flex flex-row items-center mb-3">
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-white">
              <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 ml-4">
              <h3 className="text-base font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                {item.name.length > 30 ? item.name.slice(0, 25) + "..." : item.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{item.brand?.name || 'N/A'}</p>
              {isInBundle && (
                <p className="mt-1 text-xs text-lime-600 font-medium">
                  {item.bundleDiscount ? "Bundle Item (25% OFF)" : "Bundle Item"}
                </p>
              )}
            </div>
          </div>
          
          {/* Pricing Details */}
          <div className="mb-3 p-2 bg-gray-50 rounded">
            {pricingDetails.hasDiscount ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="line-through text-gray-500">{formatPrice(pricingDetails.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Our Price:</span>
                  <span className="text-red-600 font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">You Save:</span>
                  <span className="text-green-600 font-medium">
                    {formatPrice(pricingDetails.savings)} ({pricingDetails.discountPercentage}%)
                    {pricingDetails.isBundleDiscount && " (Bundle Discount)"}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price:</span>
                <span className="text-red-600 font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="flex items-center border rounded-md w-max">
              <button
                onClick={() => handleQuantityChange(item._id, item.quantity - 1, bundleId)}
                className="px-3 py-1 text-gray-600 hover:text-blue-600"
                disabled={item.quantity === 1}
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-1 border-l border-r">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item._id, item.quantity + 1, bundleId)}
                className="px-3 py-1 text-gray-600 hover:text-blue-600"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">
                {formatPrice(itemTotal)}
              </p>
              {pricingDetails.hasDiscount && (
                <p className="text-xs text-green-600">
                  Save {formatPrice(pricingDetails.savings * item.quantity)}
                </p>
              )}
            </div>
            <button
              onClick={() => isInBundle ? removeItemFromBundle(item._id, bundleId) : removeFromCart(item._id)}
              className="text-red-500 hover:text-red-700 flex items-center justify-center"
              title={isInBundle ? "Remove entire bundle" : "Remove from cart"}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Desktop Card */}
        <div className="hidden sm:flex flex-col sm:flex-row">
          <div className="sm:w-40 sm:h-26 flex-shrink-0 overflow-hidden rounded-md mb-4 sm:mb-0">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="sm:ml-8 flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {item.name.length > 60 ? item.name.slice(0, 60) + "..." : item.name}
                </h3>
                <p className="text-sm text-gray-500 mb-1">{item.brand?.name || 'N/A'}</p>
                {isInBundle && (
                  <p className="text-xs text-lime-600 font-medium mb-2">
                    {item.bundleDiscount ? "Bundle Item (25% OFF)" : "Bundle Item"}
                  </p>
                )}
                
                {/* Pricing Details */}
                <div className="bg-gray-50 p-3 rounded mb-3 max-w-xl">
                  {pricingDetails.hasDiscount ? (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Original Price:</span>
                        <span className="line-through text-gray-500">{formatPrice(pricingDetails.basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Our Price:</span>
                        <span className="text-red-600 font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">You Save:</span>
                        <span className="text-green-600 font-medium">
                          {formatPrice(pricingDetails.savings)} ({pricingDetails.discountPercentage}%)
                          {pricingDetails.isBundleDiscount && " (Bundle Discount)"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="text-red-600 font-medium">{formatPrice(pricingDetails.currentPrice)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity - 1, bundleId)}
                  className="px-3 py-1 text-gray-600 hover:text-blue-600"
                  disabled={item.quantity === 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-1 border-l border-r">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item._id, item.quantity + 1, bundleId)}
                  className="px-3 py-1 text-gray-600 hover:text-blue-600"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-right ml-4">
                <p className="text-xl font-bold text-gray-900">
                  {formatPrice(itemTotal)}
                </p>
                {pricingDetails.hasDiscount && (
                  <p className="text-sm text-green-600 font-medium">
                    Total Save: {formatPrice(pricingDetails.savings * item.quantity)}
                  </p>
                )}
              </div>
              <button
                onClick={() => isInBundle ? removeItemFromBundle(item._id, bundleId) : removeFromCart(item._id)}
                className="text-red-500 hover:text-red-700 flex items-center"
                title={isInBundle ? "Remove entire bundle" : "Remove from cart"}
              >
                <Trash2 size={18} className="mr-2" />
              </button>
            </div>
          </div>
        </div>
      </li>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <Link to="/" className="px-2 py-2 lg:px-5 lg:py-2 text-sm font-medium text-white bg-lime-600 rounded-md">
          Continue Shopping
        </Link>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link to="/" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Render Bundles First */}
            {Object.values(grouped).map((bundle) => {
              const bundleTotals = calculateBundleTotals(bundle.items)
              
              return (
                <div key={bundle.bundleId} className="bg-white rounded-lg shadow-sm border-2 border-lime-200 mb-6">
                  {/* Bundle Header */}
                  <div className="bg-lime-50 px-6 py-3 border-b border-lime-200">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Package className="text-lime-600 mr-2" size={20} />
                        <h3 className="text-lg font-semibold text-lime-800">Frequently Bought Together</h3>
                      </div>
                      <button
                        onClick={() => removeBundleFromCart(bundle.bundleId)}
                        className="text-red-500 hover:text-red-700 text-sm flex items-center"
                        title="Remove entire bundle"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Remove Bundle
                      </button>
                    </div>
                    <div className="text-sm text-lime-600 mt-1">
                      Bundle Total: {formatPrice(bundleTotals.total)} | You Save: {formatPrice(bundleTotals.savings)}
                    </div>
                    <div className="text-xs text-lime-700 mt-1">
                      ⓘ Removing any item will remove the entire bundle
                    </div>
                  </div>

                  {/* Bundle Items */}
                  <ul className="divide-y divide-gray-200">
                    {bundle.items.map((item) => renderItem(item, true, bundle.bundleId))}
                  </ul>
                </div>
              )
            })}

            {/* Render Standalone Items */}
            {standaloneItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {Object.keys(grouped).length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Individual Items</h3>
                  </div>
                )}
                <ul className="divide-y divide-gray-200">
                  {standaloneItems.map((item) => renderItem(item, false, null))}
                </ul>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md shadow-lime-500 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4">
                {/* Detailed Price Breakdown */}
                {cartTotals.totalSavings > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Original Price</span>
                      <span className="text-gray-500 line-through">{formatPrice(cartTotals.totalBasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discounted Price</span>
                      <span className="text-red-600 font-medium">{formatPrice(cartTotals.totalCurrentPrice)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">Total Savings</span>
                      <span className="font-medium">- {formatPrice(cartTotals.totalSavings)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-black font-medium">{formatPrice(cartTotals.totalCurrentPrice)}</span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Simple subtotal when no discounts */}
                {cartTotals.totalSavings <= 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-black">{formatPrice(cartTotals.totalCurrentPrice)}</span>
                  </div>
                )}

                {/* Delivery Options */}
                {cartTotals.totalCurrentPrice <= 500 && (
                  <div className="mb-2">
                    <span className="text-gray-600 block mb-1">Delivery Options</span>
                    {deliveryOptions.length > 0 ? (
                      <select
                        className="w-full border rounded px-2 py-1"
                        value={selectedDelivery?._id || ""}
                        onChange={e => {
                          const found = deliveryOptions.find(opt => opt._id === e.target.value)
                          setSelectedDelivery(found)
                        }}
                      >
                        {deliveryOptions.map(opt => (
                          <option key={opt._id} value={opt._id}>
                            {opt.name} ({formatPrice(opt.charge)}) - {opt.deliveryTime}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-500">No delivery options</span>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}</span>
                </div>

                {/* VAT included note */}
                <div className="flex justify-between">
                  <span className="text-gray-600 text-sm">VAT Included</span>
                  <span className="text-gray-600 text-sm">✓</span>
                </div>

                {/* Coupon */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    className="border rounded px-2 py-1 flex-1"
                    placeholder="Enter coupon code"
                    value={coupon ? coupon.code : couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    disabled={!!coupon}
                  />
                  {!coupon ? (
                    <button
                      className="bg-lime-500 text-white px-3 py-1 rounded disabled:opacity-50"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput}
                    >
                      {couponLoading ? "Applying..." : "Apply"}
                    </button>
                  ) : (
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => {
                        setCoupon(null);
                        setCouponDiscount(0);
                        setCouponInput("");
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {couponError && <div className="text-red-500 text-xs mt-1">{couponError}</div>}
                {coupon && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Coupon: {coupon.code}</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between font-medium">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-black hover:text-lime-500">{formatPrice(totalWithDeliveryTaxCoupon)}</span>
                </div>
              </div>

              {/* Free shipping message */}
              {cartTotals.totalCurrentPrice < 500 && cartTotals.totalCurrentPrice > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                  You are just {formatPrice(500 - cartTotals.totalCurrentPrice)} away from free shipping. Shop more to get free and express delivery.
                  </p>
                </div>
              )}

              {cartTotals.totalCurrentPrice >= 500 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium">
                    🎉 You qualify for free shipping!
                  </p>
                </div>
              )}

              <div className="mt-6">
                {/* Terms and Privacy Policy */}
                <div className="mb-4">
                  <label className="flex items-start space-x-2 text-sm text-gray-600">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded border-gray-300 text-lime-500 focus:ring-lime-500" 
                      defaultChecked 
                    />
                    <span>
                      I agree to our{' '}
                      <Link to="/terms" className="text-lime-600 hover:text-lime-700 underline">
                        Terms of use
                      </Link>
                      {' '}&{' '}
                      <Link to="/privacy" className="text-lime-600 hover:text-lime-700 underline">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                <Link
                  to="/checkout"
                  className="w-full bg-lime-500 hover:bg-lime-600 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart