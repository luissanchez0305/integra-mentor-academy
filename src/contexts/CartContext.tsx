import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (item: CartItem) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Retrieve cart items from local storage on initial load
    const savedCartItems = localStorage.getItem('cartItems');
    return savedCartItems ? JSON.parse(savedCartItems) : [];
  });

  useEffect(() => {
    // Save cart items to local storage whenever they change
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    console.log('item', item, user?.id);
    if (item.course.instructor_id === user?.id ) {
      return;
    }

    if (cartItems.find(i => i.course.id === item.course.id)) {
      return;
    }
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const removeFromCart = (item: CartItem) => {
    setCartItems((prevItems) => prevItems.filter(i => i.course.id !== item.course.id));
  };

  const clearCart = () => { 
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {   
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
