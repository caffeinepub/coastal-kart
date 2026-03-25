import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { CartItem } from "../backend.d";

export interface CartEntry {
  productId?: number;
  customItemName?: string;
  itemName: string;
  estimatedPrice: number;
  quantity: number;
}

interface CartContextType {
  shopId: number | null;
  items: CartEntry[];
  addItem: (shopId: number, entry: CartEntry) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  estimatedSubtotal: number;
  toCartItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "coastal_kart_cart";

interface CartState {
  shopId: number | null;
  items: CartEntry[];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as CartState;
    } catch {
      // ignore
    }
    return { shopId: null, items: [] };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addItem = useCallback((shopId: number, entry: CartEntry) => {
    setCart((prev) => {
      if (prev.shopId !== null && prev.shopId !== shopId) {
        // different shop — clear first
        return { shopId, items: [entry] };
      }
      const existing = prev.items.findIndex(
        (i) =>
          (entry.productId !== undefined && i.productId === entry.productId) ||
          (entry.customItemName !== undefined &&
            i.customItemName === entry.customItemName),
      );
      if (existing >= 0) {
        const updated = [...prev.items];
        updated[existing] = {
          ...updated[existing],
          quantity: updated[existing].quantity + entry.quantity,
        };
        return { shopId, items: updated };
      }
      return { shopId, items: [...prev.items, entry] };
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setCart((prev) => {
      const updated = prev.items.filter((_, i) => i !== index);
      return { shopId: updated.length ? prev.shopId : null, items: updated };
    });
  }, []);

  const updateQuantity = useCallback((index: number, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const updated = prev.items.filter((_, i) => i !== index);
        return { shopId: updated.length ? prev.shopId : null, items: updated };
      }
      const updated = [...prev.items];
      updated[index] = { ...updated[index], quantity: qty };
      return { ...prev, items: updated };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ shopId: null, items: [] });
  }, []);

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const estimatedSubtotal = cart.items.reduce(
    (sum, i) => sum + i.estimatedPrice * i.quantity,
    0,
  );

  const toCartItems = useCallback((): CartItem[] => {
    return cart.items.map((i) => ({
      productId: i.productId,
      customItemName: i.customItemName,
      estimatedPrice: i.estimatedPrice,
      quantity: BigInt(i.quantity),
    }));
  }, [cart.items]);

  return (
    <CartContext.Provider
      value={{
        shopId: cart.shopId,
        items: cart.items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        estimatedSubtotal,
        toCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
