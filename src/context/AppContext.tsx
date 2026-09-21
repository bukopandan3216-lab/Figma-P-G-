import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  qty: number;
  variant?: string;
}

interface AppCtx {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  cartCount: number;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCart([]);
      setWishlist([]);
      return;
    }
    void Promise.all([
      supabase.from('cart_items').select('product_id, quantity, variant_id, products(id, name, price, image, brands(name))').eq('user_id', user.id),
      supabase.from('wishlist_items').select('product_id').eq('user_id', user.id),
    ]).then(([cartResult, wishlistResult]) => {
      setCart((cartResult.data || []).map((row: any) => ({
        id: row.product_id,
        name: row.products?.name || 'Product',
        brand: row.products?.brands?.name || '',
        price: Number(row.products?.price || 0),
        image: row.products?.image || '',
        qty: row.quantity,
        variant: row.variant_id || undefined,
      })));
      setWishlist((wishlistResult.data || []).map((row: any) => row.product_id));
    });
  }, [user?.id]);

  const addToCart = (item: Omit<CartItem, 'qty'>) => {
    const existing = cart.find(i => i.id === item.id);
    const nextQuantity = (existing?.qty || 0) + 1;
    setCart(prev => {
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    if (user) void supabase.from('cart_items').upsert({ user_id: user.id, product_id: item.id, quantity: nextQuantity }, { onConflict: 'user_id,product_id' });
  };
  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
    if (user) void supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', id);
  };
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) removeFromCart(id);
    else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
      if (user) void supabase.from('cart_items').update({ quantity: qty, updated_at: new Date().toISOString() }).eq('user_id', user.id).eq('product_id', id);
    }
  };
  const toggleWishlist = (id: string) => {
    const exists = wishlist.includes(id);
    setWishlist(prev => exists ? prev.filter(w => w !== id) : [...prev, id]);
    if (user) {
      if (exists) void supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', id);
      else void supabase.from('wishlist_items').insert({ user_id: user.id, product_id: id });
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{ cart, addToCart, removeFromCart, updateQty, cartCount, cartTotal, wishlist, toggleWishlist }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart outside AppProvider');
  return ctx;
}
