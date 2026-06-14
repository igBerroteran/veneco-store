'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Cargar carrito desde localStorage al montar
  useEffect(() => {
    const timer = setTimeout(() => {
      const storedCart = localStorage.getItem('veneco_cart');
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart));
        } catch (e) {
          console.error('Error al parsear el carrito guardado:', e);
        }
      }
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('veneco_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number) => {
    setCartItems((prevItems) => {
      // Buscar si ya existe el producto con la misma talla
      const existingItemIndex = prevItems.findIndex(
        (i) => i.productId === item.productId && i.size === item.size
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { ...item, quantity }];
    });
    setIsCartOpen(true); // Abrir el carrito al agregar un producto
  };

  const removeFromCart = (productId: string, size: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.productId === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Evitar problemas de hidratación en Next.js devolviendo el proveedor solo después de montar
  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}
