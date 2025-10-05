

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const LOCAL_KEY = "cart";

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Cart parse error:", e);
      return [];
    }
  });

  // persist (no heavy debounce for now)
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart:", e);
    }
  }, [cart]);

  // sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (!e) return;
      // some browsers send null key on clear; handle carefully
      if (e.key && e.key === LOCAL_KEY) {
        try {
          setCart(e.newValue ? JSON.parse(e.newValue) : []);
        } catch (err) {
          console.error("Failed to parse storage event:", err);
          setCart([]);
        }
      }
      // if e.key === null -> full clear, but we don't rely on that here
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, []);

  // helpers — use uuid as canonical key
  const giveme = useCallback(() => console.log(cart), [cart]);
  const isInCart = useCallback((uuid) => !!cart.find(item => item.product_id === uuid), [cart]);

  const addToCart = useCallback((product, quantity = 1) => {
    
    if (!product || !product.uuid) return;
    const newproduct={};
    newproduct.product_id=product.uuid;
    newproduct.price=product.price;
    newproduct.original_price=product.original_price;
    newproduct.discount=product.discount;
    newproduct.Product_images=product.Product_images;
    newproduct.title=product.title;
    newproduct.Currency=product.Currency;
    newproduct.slug=product.slug;
    if(product.discount===true){newproduct.cost_per_one=product.price}else{newproduct.cost_per_one=product.original_price};
    
    const q = Number(quantity) || 1;
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.uuid);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.uuid ? { ...i, quantity: (Number(i.quantity) || 0) + q } : i
        );
      }
      return [...prev, { ...newproduct, quantity: q }];
    });
  }, []);

  const removeFromCart = useCallback((uuid) => {
    if (!uuid) return;
    setCart(prev => prev.filter(item => item.product_id !== uuid));
  }, []);

  const updateQuantity = useCallback((uuid, quantity) => {
    if (!uuid) return;
    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) {
      removeFromCart(uuid);
      return;
    }
    setCart(prev => prev.map(item => item.product_id === uuid ? { ...item, quantity: q } : item));
  }, [removeFromCart]);

  const increment = useCallback((uuid, step = 1) => {
    if (!uuid) return;
    const s = Number(step) || 1;
    setCart(prev => prev.map(i => i.product_id === uuid ? { ...i, quantity: (Number(i.quantity) || 0) + s } : i));
  }, []);

  const decrement = useCallback((uuid, step = 1) => {
    if (!uuid) return;
    const s = Number(step) || 1;
    setCart(prev =>
      prev
        .map(i => {
          if (i.product_id !== uuid) return i;
          const newQ = (Number(i.quantity) || 0) - s;
          return newQ > 0 ? { ...i, quantity: newQ } : null;
        })
        .filter(Boolean)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getTotalItems = useCallback(() => cart.reduce((acc, i) => acc + Number(i.quantity || 0), 0), [cart]);

  const getTotalPrice = useCallback((priceField = "price") =>
    cart.reduce((acc, i) => acc + (Number(i[priceField] ?? 0) * Number(i.quantity ?? 0)), 0)
  , [cart]);

  const setCartFromServer = useCallback((serverCart = [], merge = true) => {
    if (!Array.isArray(serverCart)) return;
    if (!merge) {
      setCart(serverCart);
      return;
    }
    setCart(prev => {
      const map = new Map();
      prev.forEach(i => i && i.product_id && map.set(i.product_id, { ...i }));
      serverCart.forEach(i => {
        if (!i || !i.uuid) return;
        const existing = map.get(i.uuid);
        const qty = Number(i.quantity) || 0;
        if (existing) {
          map.set(i.uuid, { ...existing, quantity: (Number(existing.quantity) || 0) + qty });
        } else {
          map.set(i.uuid, { ...i, quantity: qty });
        }
      });
      return Array.from(map.values());
    });
  }, []);

  const value = useMemo(() => ({
    cart,
    giveme,
    isInCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    increment,
    decrement,
    clearCart,
    getTotalItems,
    getTotalPrice,
    setCartFromServer,
  }), [cart, giveme, isInCart, addToCart, removeFromCart, updateQuantity, increment, decrement, clearCart, getTotalItems, getTotalPrice, setCartFromServer]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
