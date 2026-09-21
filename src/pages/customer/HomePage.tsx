import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, Shield, Truck } from 'lucide-react';
import type { Product } from '../../data/products';
import { useCatalog } from '../../context/CatalogContext';
import { useCart } from '../../context/AppContext';
import { Badge, Button, StarRating } from '../../components/ui';
import CustomerNav from '../../components/CustomerNav';
import ProductModal from '../../components/ProductModal';

function ProductCard({ product, onExpand }: { product: Product; onExpand: (p: Product) => void }) {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const wished = wishlist.includes(product.id);

  return (
    <div className="group bg-white rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-300">
      <div
        role="button"
        tabIndex={0}
        className="block w-full text-left relative aspect-square overflow-hidden bg-[var(--secondary)]"
        onClick={() => onExpand(product)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExpand(product); } }}
      >
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={product.badge === 'Almost Sold Out' ? 'warning' : product.badge === 'Sale' ? 'danger' : 'rose'}>{product.badge}</Badge>
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Out of Stock</span>
          </div>
        )}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wished ? '#B5697A' : 'none'} stroke="#B5697A" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <div className="text-xs text-[var(--muted-foreground)] mb-1 font-medium">{product.brand}</div>
        <button onClick={() => onExpand(product)} className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 hover:text-[var(--primary)] transition-colors leading-snug text-left w-full">{product.name}</button>
        <div className="flex items-center gap-1.5 mt-1.5">
          <StarRating rating={product.rating} />
          <span className="text-xs text-[var(--muted-foreground)]">({product.reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[var(--foreground)]">${product.price.toFixed(2)}</span>
            {product.originalPrice && <span className="text-xs text-[var(--muted-foreground)] line-through">${product.originalPrice.toFixed(2)}</span>}
          </div>
          <Button
            size="sm"
            onClick={e => { addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image }); }}
            disabled={!product.inStock}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const { products, categories, loading, error } = useCatalog();
  const trending = products.filter(p => p.badge === 'Almost Sold Out' || p.badge === 'Best Seller');
  const recommended = products.slice(0, 4);

  // Listen for events from ProductModal's "similar items" click
  useEffect(() => {
    const handler = (e: CustomEvent) => setModalProduct(e.detail);
    window.addEventListener('open-product-modal', handler as EventListener);
    return () => window.removeEventListener('open-product-modal', handler as EventListener);
  }, []);

  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-sm text-[var(--muted-foreground)]">Loading catalog...</div>;
  if (error) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center"><div><h1 className="font-display text-2xl mb-2">Catalog unavailable</h1><p className="text-sm text-[var(--muted-foreground)]">{error}</p></div></div>;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2C1810] via-[#4A2030] to-[#1B1530]">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #B5697A 0%, transparent 60%), radial-gradient(circle at 80% 30%, #D4A5B5 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-medium text-white/80 mb-6">
              <Sparkles size={12} />
              AI-Powered Beauty Recommendations
            </div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
              Your Skin,<br /><em className="text-[#E8A0B0] not-italic">Your Story.</em>
            </h1>
            <p className="text-white/70 text-lg max-w-md mb-8 leading-relaxed">
              Discover P&G's science-backed beauty products tailored to your unique skin type, lifestyle, and preferences.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/quiz">
                <Button size="lg" className="bg-[var(--primary)] hover:bg-[#9E5569]">Take Beauty Quiz <ArrowRight size={16} /></Button>
              </Link>
              <Link to="/for-you">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">Shop For You</Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-[var(--primary)]/20 blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format"
                alt="Beauty products"
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 z-20 bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--rose-light)] flex items-center justify-center">
                    <Zap size={14} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--foreground)]">AI Match</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">98% for your skin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="border-y border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Truck size={16} />, label: 'Free Shipping', sub: 'On orders over $35' },
            { icon: <Shield size={16} />, label: 'Dermatologist Tested', sub: 'All products certified' },
            { icon: <Sparkles size={16} />, label: 'AI Personalization', sub: 'Tailored to you' },
            { icon: <Zap size={16} />, label: 'Fast Delivery', sub: '2–5 business days' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--rose-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <div>
                <div className="text-xs font-semibold text-[var(--foreground)]">{item.label}</div>
                <div className="text-[11px] text-[var(--muted-foreground)]">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-medium text-[var(--primary)] tracking-widest uppercase mb-2">Shop By</div>
            <h2 className="font-display text-3xl">Category</h2>
          </div>
          <Link to="/category/all" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1 transition-colors">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.id}`} className="group relative overflow-hidden rounded-[var(--radius-xl)] aspect-[3/4] bg-[var(--secondary)] block">
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-sm">{cat.name}</h3>
                <p className="text-white/70 text-xs">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="bg-[var(--rose-light)]/40 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-medium text-[var(--primary)] tracking-widest uppercase mb-2">Don't Miss Out</div>
              <h2 className="font-display text-3xl">Trending & Almost Sold Out</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.concat(products.slice(0, 2)).map((p, index) => <ProductCard key={`${p.id}-${index}`} product={p} onExpand={setModalProduct} />)}
          </div>
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--primary)] to-[#8B4A5B] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white">
            <h2 className="font-display text-3xl md:text-4xl mb-3">Find Your Perfect Match</h2>
            <p className="text-white/80 max-w-md">Take our 2-minute beauty quiz and let our AI engine recommend products perfectly suited to your skin type and concerns.</p>
          </div>
          <Link to="/quiz" className="flex-shrink-0">
            <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-[var(--rose-light)]">
              Start Quiz <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Recommended */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-medium text-[var(--primary)] tracking-widest uppercase mb-2">Personalized</div>
            <h2 className="font-display text-3xl">Recommended For You</h2>
          </div>
          <Link to="/for-you" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] flex items-center gap-1 transition-colors">See all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recommended.map(p => <ProductCard key={p.id} product={p} onExpand={setModalProduct} />)}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          {[
            { title: 'Shop', links: ['Skin Care', 'Hair Care', 'Body Care', 'Personal Care'] },
            { title: 'Account', links: ['Login', 'Register', 'Orders', 'Wishlist'] },
            { title: 'Help', links: ['Contact Us', 'Shipping Policy', 'Returns', 'FAQ'] },
            { title: 'Company', links: ['About P&G', 'Sustainability', 'Careers', 'Press'] },
          ].map(col => (
            <div key={col.title}>
              <div className="font-semibold text-[var(--foreground)] mb-3">{col.title}</div>
              <ul className="flex flex-col gap-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center"><Sparkles size={10} className="text-white" /></div>
            <span className="text-sm font-display text-[var(--foreground)]">P&G Beauty</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">© 2026 Procter & Gamble. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
