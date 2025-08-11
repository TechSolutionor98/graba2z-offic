"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"
import axios from "axios"

import config from "../config/config"

const Cart = () => {
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
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
        // handle error
      }
    }
    // Fetch tax
    const fetchTax = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/tax`)
        // Use first active tax
        if (data && data.length > 0) setTax(data[0])
      } catch (err) {
        // handle error
      }
    }
    fetchDeliveryOptions()
    fetchTax()
  }, [])

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity)
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
    return `AED ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

  // Helper function to get pricing details for an item
  const getItemPricingDetails = (item) => {
    const basePrice = Number(item.originalPrice || item.basePrice) || 0
    const currentPrice = Number(item.price) || 0
    const offerPrice = Number(item.offerPrice) || 0
    
    // Determine the actual prices to display
    let actualBasePrice = basePrice
    let actualCurrentPrice = currentPrice
    
    // If we have both base price and offer price, and offer price is valid
    if (basePrice > 0 && offerPrice > 0 && offerPrice < basePrice) {
      // We have a valid discount
      actualBasePrice = basePrice
      actualCurrentPrice = offerPrice
    } else if (basePrice > 0) {
      // No valid offer, use base price
      actualBasePrice = basePrice
      actualCurrentPrice = basePrice
    } else {
      // Fallback to current price
      actualBasePrice = currentPrice
      actualCurrentPrice = currentPrice
    }
    
    const savings = actualBasePrice > actualCurrentPrice ? actualBasePrice - actualCurrentPrice : 0
    const discountPercentage = savings > 0 ? Math.round((savings / actualBasePrice) * 100) : 0
    
    return {
      basePrice: actualBasePrice,
      currentPrice: actualCurrentPrice,
      savings,
      discountPercentage,
      hasDiscount: savings > 0
    }
  }

  // Calculate detailed cart totals
  const calculateCartTotals = () => {
    let totalBasePrice = 0
    let totalOfferPrice = 0
    let totalSavings = 0
    
    cartItems.forEach(item => {
      const pricingDetails = getItemPricingDetails(item)
      totalBasePrice += pricingDetails.basePrice * item.quantity
      totalOfferPrice += pricingDetails.currentPrice * item.quantity
      totalSavings += pricingDetails.savings * item.quantity
    })
    
    return {
      totalBasePrice,
      totalOfferPrice,
      totalSavings
    }
  }

  const cartTotals = calculateCartTotals()
  const totalSavings = cartTotals.totalSavings
  const totalWithDeliveryTaxCoupon = cartTotal + deliveryCharge + taxAmount - couponDiscount

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any watches to your cart yet.</p>
          <Link to="/" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white  rounded-lg shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => {
                  const pricingDetails = getItemPricingDetails(item)
                  
                  return (
                  <li key={item._id} className="p-3">
                    {/* Mobile Card */}
                    <div className="block sm:hidden">
                      <div className="flex flex-row items-center mb-3">
                        <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-white">
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full contain" />
                        </div>
                        <div className="flex-1 ml-4">
                          <h3 className="text-base font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.name.length > 30 ? item.name.slice(0, 25) + "..." : item.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">{item.brand?.name || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Pricing Details */}
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        {pricingDetails.hasDiscount ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Base Price:</span>
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
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:text-blue-600"
                            disabled={item.quantity === 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-1 border-l border-r">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:text-blue-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(pricingDetails.currentPrice * item.quantity)}
                          </p>
                          {pricingDetails.hasDiscount && (
                            <p className="text-xs text-green-600">
                              Save {formatPrice(pricingDetails.savings * item.quantity)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    {/* Desktop Card (only visible on sm and up) */}
                    <div className="hidden sm:flex flex-col sm:flex-row ">
                      <div className="sm:w-40 sm:h-26 flex-shrink-0 overflow-hidden rounded-md mb-4 sm:mb-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full cover"
                        />
                      </div>
                      <div className="sm:ml-8 flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 ">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {item.name.length > 60 ? item.name.slice(0, 60) + "..." : item.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">{item.brand?.name || 'N/A'}</p>
                            
                            {/* Pricing Details */}
                            <div className="bg-gray-50 p-3 rounded mb-3 max-w-xl ">
                              {pricingDetails.hasDiscount ? (
                                <>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Base Price:</span>
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
                          
                          {/* Total Price */}
                          {/* <div className="text-right ml-4 bg-red-300">
                            <p className="text-xl font-bold text-gray-900">
                              {formatPrice(pricingDetails.currentPrice * item.quantity)}
                            </p>
                            {pricingDetails.hasDiscount && (
                              <p className="text-sm text-green-600 font-medium">
                                Total Save: {formatPrice(pricingDetails.savings * item.quantity)}
                              </p>
                            )}
                          </div> */}
                        </div>
                        
                        <div className="flex items-center justify-between ">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:text-blue-600"
                              disabled={item.quantity === 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="px-4 py-1 border-l border-r">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:text-blue-600"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                            <div className="text-right ml-4">
                            <p className="text-xl font-bold text-gray-900">
                              {formatPrice(pricingDetails.currentPrice * item.quantity)}
                            </p>
                            {pricingDetails.hasDiscount && (
                              <p className="text-sm text-green-600 font-medium">
                                Total Save: {formatPrice(pricingDetails.savings * item.quantity)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 flex items-center "
                          >
                            <Trash2 size={18} className="mr-2" />
                          
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            {/* <div className="bg-white rounded-lg shadow-md  p-6"> */}
          <div className="bg-white rounded-lg shadow-md shadow-lime-500 p-6 ">

              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4">
                {/* Detailed Price Breakdown */}
                {cartTotals.totalBasePrice > cartTotals.totalOfferPrice && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price Total</span>
                      <span className="text-gray-500 line-through">{formatPrice(cartTotals.totalBasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Our Offer Price</span>
                      <span className="text-red-600 font-medium">{formatPrice(cartTotals.totalOfferPrice)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span className="font-medium">You Save</span>
                      <span className="font-medium">- {formatPrice(cartTotals.totalSavings)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-black font-medium">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Simple subtotal when no discounts */}
                {cartTotals.totalBasePrice <= cartTotals.totalOfferPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-black">{formatPrice(cartTotal)}</span>
                  </div>
                )}

                {/* Delivery Options */}
                {cartTotal <= 500 && (
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
              {cartTotal < 500 && cartTotal > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                  You are just {formatPrice(500 - cartTotal)} aways from free shipping. Shop more to get free and express delivery.
                  </p>
                </div>
              )}

              {cartTotal >= 500 && (
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

                <Link to="/" className="w-full text-center block mt-4 text-black hover:text-lime-500">
                  Continue Shopping
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
