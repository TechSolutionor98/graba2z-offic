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
    const existingItem = cartItems.find((item) => item._id === product._id)
    const finalPrice = product.offerPrice && product.offerPrice > 0 ? product.offerPrice : product.price
    
    if (existingItem) {
      // Item exists, update quantity
      const updatedItems = cartItems.map((item) =>
        item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item
      )
      setCartItems(updatedItems)
      showToast(`Updated ${product.name} quantity in cart`, "success")
    } else {
      // Item doesn't exist, add new item
      const newItem = {
        ...product,
        price: finalPrice,           // The price we're charging (offer price or base price)
        originalPrice: product.price,    // Store original price for display
        basePrice: product.price,        // Store base price for calculations
        offerPrice: product.offerPrice || 0, // Store offer price for reference (0 if null)
        quantity
      }
      setCartItems([...cartItems, newItem])
      showToast(`Added ${product.name} to cart`, "success")
    }

    // Push add to cart event to data layer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'add_to_cart',
      'ecommerce': {
        'currency': 'AED',
        'value': finalPrice * quantity,
        'items': [{
          'item_id': product._id,
          'item_name': product.name,
          'item_category': product.parentCategory?.name || product.category?.name || 'Uncategorized',
          'item_brand': product.brand?.name || 'Unknown',
          'price': finalPrice,
          'quantity': quantity
        }]
      }
    });

    console.log('Add to cart tracked:', product.name, quantity); // For debugging
  }

  const removeFromCart = (productId) => {
    const product = cartItems.find((item) => item._id === productId)
    
    if (product) {
      // Push remove from cart event to data layer
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        'event': 'remove_from_cart',
        'ecommerce': {
          'currency': 'AED',
          'value': product.price * product.quantity,
          'items': [{
            'item_id': product._id,
            'item_name': product.name,
            'item_category': product.parentCategory?.name || product.category?.name || 'Uncategorized',
            'item_brand': product.brand?.name || 'Unknown',
            'price': product.price,
            'quantity': product.quantity
          }]
        }
      });
      
      console.log('Remove from cart tracked:', product.name); // For debugging
    }
    
    setCartItems(cartItems.filter((item) => item._id !== productId))
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
