import { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Star, ChevronLeft, ChevronRight, Truck, Check, ChevronDown } from 'lucide-react';
import { useCart } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../data/products';
import { useCatalog } from '../context/CatalogContext';
import { Badge, StarRating, Button } from './ui';

interface Props {
  product: Product | null;
  onClose: () => void;
}

const reviewsData = [
  { name: 'Lori Barnett', rating: 5, date: '02 May', text: 'Absolutely love this product! It has transformed my skin routine completely. Would 100% recommend to everyone.' },
  { name: 'Philip Douglas', rating: 4, date: '29 April', text: 'The Scandinavian-inspired design is both subtle and effective. Great value for the quality you get.' },
  { name: 'Sarah M.', rating: 5, date: '15 April', text: 'This moisturizer has completely transformed my skin. I noticed a visible difference in just 2 weeks!' },
];

const ratingBreakdown = [
  { stars: 5, count: 2227, label: '★★★★★' },
  { stars: 4, count: 502, label: '★★★★' },
  { stars: 3, count: 33, label: '★★★' },
  { stars: 2, count: 12, label: '★★' },
  { stars: 1, count: 8, label: '★' },
];

export default function ProductModal({ product, onClose }: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeReviewFilter, setActiveReviewFilter] = useState('All');
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  const { products } = useCatalog();

  const similar = products.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  useEffect(() => {
    setActiveImg(0);
    setSelectedVariants({});
    setQty(1);
    setShowFullDesc(false);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;

    const previousOverflow = document.body.style.overflow;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  if (!product) return null;

  const imgs = product.images || [product.image];
  const wished = wishlist.includes(product.id);
  const totalReviews = ratingBreakdown.reduce((s, r) => s + r.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto flex-1">
          {/* Top section: image gallery + product info */}
          <div className="flex flex-col md:flex-row gap-0">
            {/* Left: Thumbnail strip + main image */}
            <div className="md:w-[55%] flex flex-col sm:flex-row gap-0 bg-[var(--secondary)]">
              {/* Thumbnail strip */}
              {imgs.length > 1 && (
                <div className="flex sm:flex-col gap-2 p-3 sm:p-3 overflow-x-auto sm:overflow-y-auto scrollbar-hide sm:w-20 flex-shrink-0">
                  {imgs.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-14 h-14 sm:w-full sm:aspect-square rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[var(--primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="relative flex-1 aspect-square sm:aspect-auto overflow-hidden">
                <img
                  src={imgs[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {imgs.length > 1 && (
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <button onClick={() => setActiveImg(i => (i - 1 + imgs.length) % imgs.length)} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow text-sm hover:bg-white transition-colors"><ChevronLeft size={16} /></button>
                    <button onClick={() => setActiveImg(i => (i + 1) % imgs.length)} className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow text-sm hover:bg-white transition-colors"><ChevronRight size={16} /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product details */}
            <div className="md:w-[45%] flex flex-col p-5 sm:p-6 overflow-y-auto">
              {/* Breadcrumb */}
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Home / {product.category} / <span className="text-[var(--foreground)]">{product.brand}</span>
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(product.rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth={1.5} />
                  ))}
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">{product.rating}</span>
                <span className="text-xs text-[var(--muted-foreground)]">({product.reviews.toLocaleString()} reviews)</span>
              </div>

              {/* Name */}
              <h2 className="font-display text-2xl leading-tight text-[var(--foreground)] mb-3">{product.name}</h2>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-base text-[var(--muted-foreground)] line-through">${product.originalPrice.toFixed(2)}</span>
                )}
                {product.originalPrice && (
                  <Badge variant="danger">Save ${(product.originalPrice - product.price).toFixed(2)}</Badge>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image })}
                  disabled={!product.inStock}
                  className="flex-1 border-2 border-[var(--primary)] text-[var(--primary)] font-semibold rounded-[var(--radius)] py-2.5 text-sm hover:bg-[var(--rose-light)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={15} /> Add to Cart
                </button>
                <button
                  onClick={() => addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image })}
                  disabled={!product.inStock}
                  className="flex-1 bg-[var(--primary)] text-white font-semibold rounded-[var(--radius)] py-2.5 text-sm hover:bg-[#9E5569] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Buy it now
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-11 rounded-[var(--radius)] border-2 flex items-center justify-center transition-all flex-shrink-0 ${wished ? 'border-[var(--primary)] bg-[var(--rose-light)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
                >
                  <Heart size={17} fill={wished ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Variants (color swatches if multiple, or pill selectors) */}
              {product.variants?.map(variant => (
                <div key={variant.label} className="mb-4">
                  <div className="text-xs font-semibold mb-2 text-[var(--muted-foreground)] uppercase tracking-wide">
                    {variant.label}: <span className="text-[var(--foreground)] font-medium normal-case tracking-normal">{selectedVariants[variant.label] || variant.options[0]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.label]: opt }))}
                        className={`px-3 py-1.5 rounded-full text-xs border-2 transition-all font-medium ${(selectedVariants[variant.label] || variant.options[0]) === opt ? 'border-[var(--primary)] bg-[var(--rose-light)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Delivery */}
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-4 py-3 border-t border-b border-[var(--border)]">
                <Truck size={14} className="text-[var(--primary)] flex-shrink-0" />
                <span>Free delivery on orders over $35 · 2–5 business days</span>
              </div>

              {/* Stock */}
              <div className={`flex items-center gap-2 text-sm mb-4 ${product.inStock ? product.stock < 10 ? 'text-amber-600' : 'text-emerald-600' : 'text-red-600'}`}>
                {product.inStock ? (
                  <><Check size={14} />{product.stock < 10 ? `Only ${product.stock} left in stock — order soon!` : `In Stock (${product.stock} units)`}</>
                ) : (
                  <><X size={14} />Currently out of stock</>
                )}
              </div>

              {/* Description */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1.5">Description:</p>
                <p className={`text-sm text-[var(--muted-foreground)] leading-relaxed ${!showFullDesc ? 'line-clamp-3' : ''}`}>
                  {product.description}
                </p>
                <button onClick={() => setShowFullDesc(s => !s)} className="text-xs text-[var(--primary)] mt-1 hover:underline">
                  {showFullDesc ? 'Show less' : 'See full description'}
                </button>
              </div>

              {/* Brand */}
              <div className="border-t border-[var(--border)] pt-3">
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Brand:</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)]">{product.brand[0]}</div>
                  <div>
                    <div className="text-sm font-semibold">{product.brand}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => <Star key={i} size={10} fill="#F59E0B" stroke="none" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar items */}
          {similar.length > 0 && (
            <div className="px-5 sm:px-6 py-5 border-t border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-3">Similar items:</h3>
              <div className="grid grid-cols-4 gap-3">
                {similar.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      // Re-open modal for similar product — parent handles this via onClose + re-open
                      onClose();
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('open-product-modal', { detail: p }));
                      }, 100);
                    }}
                    className="group text-left"
                  >
                    <div className="aspect-square bg-[var(--secondary)] rounded-xl overflow-hidden mb-2">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <p className="text-xs font-bold">${p.price.toFixed(2)}</p>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">{p.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="px-5 sm:px-6 py-5 border-t border-[var(--border)]">
            <h3 className="text-base font-bold mb-4">Reviews</h3>

            {/* Rating summary */}
            <div className="flex items-start gap-6 mb-5">
              <div className="text-center flex-shrink-0">
                <div className="text-5xl font-bold leading-none">{product.rating}</div>
                <div className="flex justify-center mt-1.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} fill={i < Math.round(product.rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth={1.5} />
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                {ratingBreakdown.map(r => (
                  <div key={r.stars} className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--muted-foreground)] w-8 text-right flex-shrink-0">{r.label.slice(0, 2)}</span>
                    <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(r.count / totalReviews) * 100}%` }} />
                    </div>
                    <span className="text-[var(--muted-foreground)] w-10 flex-shrink-0">({r.count.toLocaleString()})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {['All', '★★★★★', '★★★★', '★★★', '★★', '★'].map((f, i) => (
                <button
                  key={f}
                  onClick={() => setActiveReviewFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${activeReviewFilter === f ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]'}`}
                >
                  {f} {i > 0 && <span className="opacity-70">({ratingBreakdown[5 - i]?.count.toLocaleString()})</span>}
                </button>
              ))}
            </div>

            {/* Review list */}
            <div className="flex flex-col gap-5">
              {reviewsData.map((review, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-xs font-bold text-[var(--primary)] flex-shrink-0 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${i === 0 ? '1544005313-94ddf0286df2' : '1472099645785-5658abf4ff4e'}?w=80&h=80&fit=crop&auto=format`}
                      alt={review.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, j) => (
                            <Star key={j} size={12} fill={j < review.rating ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth={1.5} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">{review.date}</span>
                    </div>
                    <div className="text-xs font-semibold mb-1">{review.name}</div>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
