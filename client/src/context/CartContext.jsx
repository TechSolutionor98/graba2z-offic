
"use client"

import { createContext, useState, useEffect, useContext } from "react"
import { useToast } from "./ToastContext"

const CartContext = createContext()

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cart")
    return storedCart ? JSON.parse(storedCart) : []
  })
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [deliveryOptions, setDeliveryOptions] = useState([])
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [tax, setTax] = useState(null)
  const [coupon, setCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const { showToast } = useToast()

  useEffect(() => {
    // Update localStorage when cart changes
    localStorage.setItem("cart", JSON.stringify(cartItems))

    // Update cart count
    const count = cartItems.reduce((total, item) => total + item.quantity, 0)
    setCartCount(count)

    // Update cart total - this is the single source of truth
    const total = cartItems.reduce((total, item) => {
      const itemPrice = typeof item.price === "number" ? item.price : Number.parseFloat(item.price) || 0
      const itemQuantity = typeof item.quantity === "number" ? item.quantity : Number.parseInt(item.quantity) || 0
      return total + itemPrice * itemQuantity
    }, 0)
    setCartTotal(total)
  }, [cartItems])

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item._id === product._id)

      if (existingItemIndex > -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        }
        showToast(`Updated ${product.name} quantity in cart`, "success")
        return updatedItems
      } else {
        // Item doesn't exist, add new item
        showToast(`Added ${product.name} to cart`, "success")
        return [...prevItems, { ...product, quantity }]
      }
    })
  }

  const removeFromCart = (productId) => {
    const product = cartItems.find((item) => item._id === productId)
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== productId))
    if (product) {
      showToast(`Removed ${product.name} from cart`, "success")
    }
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = cartItems.find((item) => item._id === productId)
    setCartItems((prevItems) => prevItems.map((item) => (item._id === productId ? { ...item, quantity } : item)))
    if (product) {
      showToast(`Updated ${product.name} quantity`, "success")
    }
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem("cart")
    showToast("Cart cleared", "success")
  }

  // Calculate final total with delivery charges
  const calculateFinalTotal = (deliveryCharge = 0) => {
    return cartTotal + deliveryCharge - couponDiscount
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal, // This is the authoritative cart total
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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
        calculateFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
