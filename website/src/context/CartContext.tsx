import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { collect } from "../lib/collection";
import { announce } from "../lib/announce";
import { findBySku, type Product } from "../data/products";

export type CartLine = { sku: string; qty: number };

type CartContextType = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  freeShippingOver: number;
  add: (product: Product, qty?: number) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  clear: () => void;
  itemsDetailed: Array<{ product: Product; qty: number; lineTotal: number }>;
};

const SHIPPING_FLAT = 4.9;
const FREE_SHIPPING_OVER = 35;
const STORAGE_KEY = "leones-cart-v1";

const CartContext = createContext<CartContextType | null>(null);

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return parsed.filter((l) => getProduct2(l.sku) && Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 50);
  } catch {
    return [];
  }
}

const getProduct2 = (sku: string) => findBySku(sku);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const api = useMemo<CartContextType>(() => {
    const itemsDetailed = lines
      .map((l) => {
        const product = getProduct2(l.sku)!;
        return { product, qty: l.qty, lineTotal: Math.round(product.price * l.qty * 100) / 100 };
      })
      .filter((x) => x.product);
    const subtotal = Math.round(itemsDetailed.reduce((s, x) => s + x.lineTotal, 0) * 100) / 100;
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FLAT;
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      shipping,
      total: Math.round((subtotal + shipping) * 100) / 100,
      freeShippingOver: FREE_SHIPPING_OVER,
      itemsDetailed,
      add: (product, qty = 1) => {
        collect(product.sku);
        announce(`${product.name} added to bag`);
        setLines((prev) => {
          const existing = prev.find((l) => l.sku === product.sku);
          if (existing) {
            return prev.map((l) => (l.sku === product.sku ? { ...l, qty: Math.min(50, l.qty + qty) } : l));
          }
          return [...prev, { sku: product.sku, qty: Math.min(50, Math.max(1, qty)) }];
        });
      },
      remove: (sku) => setLines((prev) => prev.filter((l) => l.sku !== sku)),
      setQty: (sku, qty) =>
        setLines((prev) =>
          qty < 1 ? prev.filter((l) => l.sku !== sku) : prev.map((l) => (l.sku === sku ? { ...l, qty: Math.min(50, qty) } : l))
        ),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}
