import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { useToast } from '../components/common/Toast';
import { Database } from '../services/database';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('mr_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const { success, warning, error } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('mr_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const addToCart = (product: Product, qty: number = 1) => {
    if (product.stockQuantity <= 0) {
      error(`O perfume "${product.name}" está temporariamente esgotado.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.stockQuantity) {
          warning(`Limite de estoque atingido para "${product.name}" (${product.stockQuantity} unidades disponíveis).`);
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: product.stockQuantity } : item
          );
        }
        success(`Quantidade de "${product.name}" atualizada na sacola!`);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      success(`"${product.name}" adicionado à Sacola de Luxo!`);
      return [...prev, { product, quantity: Math.min(qty, product.stockQuantity) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    success('Item removido da sacola.');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (quantity > item.product.stockQuantity) {
            warning(`Estoque máximo disponível: ${item.product.stockQuantity} unidades.`);
            return { ...item, quantity: item.product.stockQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const res = await Database.validateCoupon(code, subtotal);
    if (res.valid) {
      setAppliedCoupon(code.trim().toUpperCase());
      setDiscountPercent(res.discountPercent);
      success(res.message);
      return true;
    } else {
      error(res.message);
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
  const discount = (subtotal * discountPercent) / 100;
  const shipping = subtotal >= 1500 || subtotal === 0 ? 0 : 85;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
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
