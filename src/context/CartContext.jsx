import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

// Helper function to get current user ID from token
const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.user_id || payload.id || String(payload.identity);
  } catch {
    return null;
  }
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    // Check if user changed
    const storedUserId = localStorage.getItem('cartUserId');
    const currentUserId = getUserId();

    // Clear cart if user changed or logged out
    if (storedUserId && storedUserId !== currentUserId) {
      localStorage.removeItem('cart');
      setCartItems([]);
    }

    // Set current user ID
    if (currentUserId) {
      localStorage.setItem('cartUserId', currentUserId);
    } else {
      localStorage.removeItem('cartUserId');
    }

    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Filter out any invalid items (missing bakery info)
        const validCart = parsedCart.filter(item => {
          const isValid = item.bakery_id && item.bakery_name && item.bakery_name !== "Unknown Bakery";
          if (!isValid) {
            console.warn("Removing invalid cart item:", item);
          }
          return isValid;
        });
        setCartItems(validCart);
        
        // If items were removed, save the cleaned cart
        if (validCart.length !== parsedCart.length) {
          localStorage.setItem("cart", JSON.stringify(validCart));
        }
      } catch (err) {
        console.error("Error loading cart:", err);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prev) => {
      // Check if item already exists in cart
      const existingIndex = prev.findIndex(
        (i) =>
          i.id === item.id &&
          i.type === item.type &&
          i.bakery_id === item.bakery_id
      );

      if (existingIndex >= 0) {
        // Update quantity if item exists
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        // Add new item
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId, type, bakery_id) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === itemId && item.type === type && item.bakery_id === bakery_id)
      )
    );
  };

  const updateQuantity = (itemId, type, bakery_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, type, bakery_id);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId && item.type === type && item.bakery_id === bakery_id
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.type === "product" ? item.price : item.sale_price;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCartOnLogout = () => {
    localStorage.removeItem('cart');
    localStorage.removeItem('cartUserId');
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        clearCartOnLogout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
