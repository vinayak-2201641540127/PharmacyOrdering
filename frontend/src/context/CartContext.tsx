import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '../types/api';
import type { CartItem } from '../types/cart';

interface CartContextValue {
  addItem: (product: Product) => void;
  clearCart: () => void;
  items: CartItem[];
  removeItem: (productId: number) => void;
  totalAmount: number;
  totalItems: number;
  updateQuantity: (productId: number, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const value: CartContextValue = {
    addItem: (product) => {
      setItems((currentItems) => {
        const existingItem = currentItems.find((item) => item.productId === product.id);

        if (existingItem) {
          return currentItems.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: Math.min(item.quantity + 1, product.stockQuantity) }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            name: product.name,
            price: product.price,
            productId: product.id,
            quantity: 1,
            requiresPrescription: product.requiresPrescription,
          },
        ];
      });
    },
    clearCart: () => setItems([]),
    items,
    removeItem: (productId) =>
      setItems((currentItems) => currentItems.filter((item) => item.productId !== productId)),
    totalAmount: items.reduce((total, item) => total + item.price * item.quantity, 0),
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    updateQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item,
        ),
      );
    },
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
};
