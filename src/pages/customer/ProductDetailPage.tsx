import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ChevronLeft, ChevronRight, Star, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { useCart } from '../../context/AppContext';
import { Badge, Button, StarRating, Tabs, Breadcrumb } from '../../components/ui';
import CustomerNav from '../../components/CustomerNav';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { products, loading, error } = useCatalog();
  const product = products.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [tab, setTab] = useState('Description');
  const [qty, setQty] = useState(1);
  const { addToCart, wishlist, toggleWishlist } = useCart();
  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-sm text-[var(--muted-foreground)]">Loading product...</div>;
  if (error || !product) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center"><p className="text-sm text-[var(--muted-foreground)]">{error || 'Product not found.'}</p></div>;
  const wished = wishlist.includes(product.id);
  const imgs = product.images || [product.image];
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: product.category, href: `/category/${product.category.toLowerCase().replace(' ', '-')}` }, { label: product.name }]} />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square bg-[var(--secondary)] rounded-[var(--radius-xl)] overflow-hidden">
              <img src={imgs[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              {imgs.length > 1 && (
                <>
                  <button onClick={() => setActiveImg(i => (i - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"><ChevronLeft size={18} /></button>
                  <button onClick={() => setActiveImg(i => (i + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"><ChevronRight size={18} /></button>
                </>
              )}
              {product.badge && <div className="absolute top-4 left-4"><Badge variant="rose">{product.badge}</Badge></div>}
            </div>
            {imgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`flex-shrink-0 w-16 h-16 rounded-[var(--radius)] overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[var(--primary)]' : 'border-transparent hover:border-[var(--muted)]'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-[var(--primary)] mb-1">{product.brand}</div>
            <h1 className="font-display text-3xl text-[var(--foreground)] leading-tight mb-3">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={product.rating} />
              <span className="text-sm text-[var(--muted-foreground)]">{product.rating} ({product.reviews.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-[var(--muted-foreground)] line-through">${product.originalPrice.toFixed(2)}</span>
                  <Badge variant="danger">Save ${(product.originalPrice - product.price).toFixed(2)}</Badge>
                </>
              )}
            </div>

            {/* Stock status */}
            <div className={`flex items-center gap-2 mb-5 text-sm ${product.inStock ? product.stock < 10 ? 'text-amber-600' : 'text-emerald-600' : 'text-red-600'}`}>
              {product.inStock ? (
                <><Check size={14} /> {product.stock < 10 ? `Only ${product.stock} left in stock!` : 'In Stock'}</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Out of Stock</>
              )}
            </div>

            {/* Variants */}
            {product.variants?.map(variant => (
              <div key={variant.label} className="mb-5">
                <div className="text-sm font-semibold mb-2">{variant.label}: <span className="font-normal text-[var(--muted-foreground)]">{selectedVariants[variant.label] || variant.options[0]}</span></div>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.label]: opt }))}
                      className={`px-4 py-1.5 rounded-full text-sm border-2 transition-all ${(selectedVariants[variant.label] || variant.options[0]) === opt ? 'border-[var(--primary)] text-[var(--primary)] font-medium' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)]'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-10 flex items-center justify-center hover:bg-[var(--secondary)] transition-colors text-lg font-medium">−</button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-9 h-10 flex items-center justify-center hover:bg-[var(--secondary)] transition-colors text-lg font-medium">+</button>
              </div>
              <Button
                size="lg"
                className="flex-1"
                disabled={!product.inStock}
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image });
                }}
              >
                <ShoppingBag size={16} /> Add to Cart
              </Button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-[var(--radius)] border-2 transition-all ${wished ? 'border-[var(--primary)] bg-[var(--rose-light)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'}`}
              >
                <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Benefits */}
            <div className="flex flex-col gap-2 mt-4 p-4 bg-[var(--secondary)] rounded-[var(--radius-lg)]">
              {[
                { icon: <Truck size={14} />, text: 'Free shipping on orders over $35' },
                { icon: <Shield size={14} />, text: 'Dermatologist tested & approved' },
                { icon: <RotateCcw size={14} />, text: '30-day hassle-free returns' },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                  <span className="text-[var(--primary)]">{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs tabs={['Description', 'How to Use', 'Ingredients', 'Reviews']} active={tab} onChange={setTab} />
          <div className="mt-6 p-2">
            {tab === 'Description' && (
              <div className="prose prose-sm max-w-2xl text-[var(--muted-foreground)] leading-relaxed">
                <p>{product.description}</p>
                <ul className="mt-4 flex flex-col gap-1.5">
                  {product.tags.map(tag => <li key={tag} className="flex items-center gap-2"><Check size={14} className="text-[var(--primary)]" /><span className="capitalize">{tag}</span></li>)}
                </ul>
              </div>
            )}
            {tab === 'How to Use' && (
              <div className="max-w-lg space-y-3">
                {['Apply a small amount to clean, dry skin', 'Massage gently in circular motions', 'Use morning and evening for best results', 'Follow with SPF during daytime use'].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-[var(--muted-foreground)]">
                    <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            )}
            {tab === 'Ingredients' && (
              <p className="text-sm text-[var(--muted-foreground)] max-w-2xl leading-relaxed">Water, Glycerin, Niacinamide, Dimethicone, Cetyl Alcohol, Stearyl Alcohol, Glyceryl Stearate, PEG-100 Stearate, Tocopheryl Acetate, Carbomer, Sodium Hydroxide, Disodium EDTA, Methylparaben, Propylparaben.</p>
            )}
            {tab === 'Reviews' && (
              <div className="flex flex-col gap-6 max-w-2xl">
                <div className="flex items-center gap-4 p-4 bg-[var(--secondary)] rounded-[var(--radius-lg)]">
                  <div className="text-center">
                    <div className="text-4xl font-bold font-display">{product.rating}</div>
                    <StarRating rating={product.rating} />
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">{product.reviews.toLocaleString()} reviews</div>
                  </div>
                </div>
                {[
                  { name: 'Sarah M.', rating: 5, date: 'Sep 12, 2026', text: 'This moisturizer has completely transformed my skin. I\'ve noticed a visible difference in just 2 weeks!' },
                  { name: 'Jennifer K.', rating: 4, date: 'Aug 28, 2026', text: 'Great product, lightweight and absorbs quickly. The price point is excellent for the quality.' },
                  { name: 'Maria L.', rating: 5, date: 'Aug 14, 2026', text: 'My dermatologist recommended this and I couldn\'t be happier. Perfect for my combination skin.' },
                ].map((review, i) => (
                  <div key={i} className="flex flex-col gap-2 border-b border-[var(--border)] pb-5 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold flex items-center justify-center">{review.name[0]}</div>
                        <span className="text-sm font-medium">{review.name}</span>
                      </div>
                      <span className="text-xs text-[var(--muted-foreground)]">{review.date}</span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="text-sm text-[var(--muted-foreground)]">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* You may also like */}
        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-2xl mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden hover:shadow-md transition-all">
                  <div className="aspect-square bg-[var(--secondary)] overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{p.brand}</div>
                    <div className="text-sm font-semibold line-clamp-2 leading-snug">{p.name}</div>
                    <div className="text-sm font-bold mt-1">${p.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky ATC bar (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] p-4 flex items-center gap-3 md:hidden z-30">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-[var(--muted-foreground)] truncate">{product.name}</div>
          <div className="font-bold">${product.price.toFixed(2)}</div>
        </div>
        <Button disabled={!product.inStock} onClick={() => addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image })}>
          <ShoppingBag size={15} /> Add to Cart
        </Button>
      </div>
    </div>
  );
}
