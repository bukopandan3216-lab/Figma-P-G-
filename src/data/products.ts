export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  description: string;
  tags: string[];
  inStock: boolean;
  stock: number;
  variants?: { label: string; options: string[] }[];
  variantId?: string;
  badge?: string;
}
