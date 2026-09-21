import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchCategories, fetchProducts, type CatalogCategory } from '../lib/catalog';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Product } from '../data/products';

interface CatalogContextValue {
  products: Product[];
  categories: CatalogCategory[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextProducts, nextCategories] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(nextProducts);
      setCategories(nextCategories);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : (cause as { message?: string })?.message || 'Unable to load catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  return <CatalogContext.Provider value={{ products, categories, loading, error, refresh }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error('useCatalog outside CatalogProvider');
  return context;
}
