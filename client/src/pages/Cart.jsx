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

  // Delivery charge (free if cartTotal > 600)
  const deliveryCharge = selectedDelivery ? (cartTotal > 600 ? 0 : selectedDelivery.charge) : 0

  // Tax calculation
  let taxAmount = 0
  if (tax) {
    if (tax.type === "percentage") {
      taxAmount = ((cartTotal + deliveryCharge) * tax.rate) / 100
    } else {
      taxAmount = tax.rate
    }
  }

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

  const totalWithDeliveryTaxCoupon = cartTotal + deliveryCharge + taxAmount - couponDiscount

  const formatPrice = (price) => {
    return `AED ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  }

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
                {cartItems.map((item) => (
                  <li key={item._id} className="p-6">
                    {/* Mobile Card */}
                    <div className="block sm:hidden">
                      <div className="flex flex-row items-center">
                        <div className="w-30 h-20 flex-shrink-0 overflow-hidden rounded-md bg-white">
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full contain" />
                        </div>
                        <div className="flex-1 ml-4">
                          <h3 className="text-base font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.name.length > 50 ? item.name.slice(0, 20) + "..." : item.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">{item.brand?.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-between m-1 ">
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
                        <p className="text-lg font-medium text-gray-900 text-center">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-500 hover:text-red-700 flex items-center justify-center"
                        >
                          <Trash2 size={18} className="mr-2x  " />
                          
                        </button>
                      </div>
                    </div>
                    {/* Desktop Card (only visible on sm and up) */}
                    <div className="hidden sm:flex flex-col sm:flex-row ">
                      <div className="sm:w-40 sm:h-26 flex-shrink-0 overflow-hidden rounded-md mb-4 sm:mb-0 ">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full cover"
                        />
                      </div>
                      <div className="sm:ml-8 flex-1">
                        <div className="flex justify-between">
                          <div className="  mx-10 mt-5 mb-2 ">
                            <h3 className="text-lg font-medium text-gray-900 mt-2 whitespace-nowrap overflow-hidden text-ellipsis">
                              {item.name.length > 50 ? item.name.slice(0, 50) + "..." : item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">{item.brand?.name || 'N/A'}</p>
                          </div>
                          {/* <p className="text-lg font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p> */}
                        </div>
                        <div className="flex items-center justify-between mt-1 px-10 mx-10">
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
                          <p className="text-lg font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-red-500   hover:text-red-700 flex items-center"
                          >
                            <Trash2 size={18} className="mr-1x  " />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-black ">{formatPrice(cartTotal)}</span>
                </div>

                {/* Delivery Options */}
                {cartTotal <= 600 && (
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
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="text-gray-900">{deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}</span>
                </div>

                {/* Tax */}
                {tax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({tax.name})</span>
                    <span className="text-gray-900">{formatPrice(taxAmount)}</span>
                  </div>
                )}

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
                  <span className="text-gray-900">Total</span>
                  <span className="text-black hover:text-lime-500">{formatPrice(totalWithDeliveryTaxCoupon)}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/checkout"
                  className="w-full bg-lime-500  text-white font-medium py-3 px-4 rounded-md flex items-center justify-center"
                >
                  Proceed to Checkout
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
