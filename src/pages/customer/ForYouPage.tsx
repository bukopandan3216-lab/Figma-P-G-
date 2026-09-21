import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Brain } from 'lucide-react';
import { useCatalog } from '../../context/CatalogContext';
import { useAuth } from '../../context/AuthContext';
import { recommendProducts } from '../../lib/recommendations';
import { useCart } from '../../context/AppContext';
import { Button, StarRating, Badge } from '../../components/ui';
import CustomerNav from '../../components/CustomerNav';

const reasons = [
  'Matches your Combination skin type',
  'Targets your Dark Spots concern',
  'Highly rated by users with similar profiles',
  'P&G Dermatologist recommended',
];

export default function ForYouPage() {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { products, loading, error } = useCatalog();
  const { user } = useAuth();
  const [forYou, setForYou] = useState(products);
  useEffect(() => { if (products.length) void recommendProducts(user?.id || null, products).then(results => setForYou(results.map(result => result.product))); }, [products, user?.id]);
  const topPick = forYou[0];

  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-sm text-[var(--muted-foreground)]">Loading recommendations...</div>;
  if (error || !topPick) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center"><p className="text-sm text-[var(--muted-foreground)]">{error || 'No recommendations available yet.'}</p></div>;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[var(--rose-light)] to-[var(--secondary)] py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} className="text-[var(--primary)]" />
              <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-widest">AI-Powered</span>
            </div>
            <h1 className="font-display text-4xl mb-3">Curated Just for You</h1>
            <p className="text-[var(--muted-foreground)] max-w-md">Based on your beauty quiz results and purchase history, our AI has handpicked these products for your skin and hair profile.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Combination Skin', 'Anti-Aging', 'Dark Spots', 'Frizz Control'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white border border-[var(--border)] rounded-full text-xs text-[var(--muted-foreground)]">{tag}</span>
              ))}
            </div>
          </div>
          <Link to="/quiz" className="flex-shrink-0">
            <Button variant="outline" className="border-[var(--primary)] text-[var(--primary)]">Retake Quiz <ArrowRight size={14} /></Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Top Pick */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[var(--primary)]" />
            <h2 className="font-semibold">Your #1 Match</h2>
          </div>
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden flex flex-col sm:flex-row">
            <div className="sm:w-48 aspect-square sm:aspect-auto bg-[var(--secondary)] flex-shrink-0 overflow-hidden">
              <img src={topPick.image} alt={topPick.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="rose">98% Match</Badge>
                <Badge variant="success">Best Seller</Badge>
              </div>
              <div className="text-sm text-[var(--muted-foreground)] mb-1">{topPick.brand}</div>
              <h3 className="font-display text-2xl mb-2">{topPick.name}</h3>
              <StarRating rating={topPick.rating} />
              <p className="text-sm text-[var(--muted-foreground)] mt-2 mb-4 max-w-lg">{topPick.description}</p>
              <div className="mb-4">
                <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">Why we picked this for you:</div>
                <ul className="flex flex-col gap-1">
                  {reasons.map(r => (
                    <li key={r} className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] flex-shrink-0" />{r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">${topPick.price.toFixed(2)}</span>
                <Button onClick={() => addToCart({ id: topPick.id, name: topPick.name, brand: topPick.brand, price: topPick.price, image: topPick.image })}>Add to Cart</Button>
                <Link to={`/product/${topPick.id}`}><Button variant="outline">View Details</Button></Link>
              </div>
            </div>
          </div>
        </div>

        {/* All recommendations */}
        <div>
          <h2 className="font-display text-2xl mb-6">More Recommendations</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {forYou.slice(1).map((product, idx) => (
              <div key={product.id} className="group bg-white rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-square overflow-hidden bg-[var(--secondary)]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2"><Badge variant="rose" className="text-[10px]">{95 - idx * 3}% Match</Badge></div>
                </div>
                <div className="p-3">
                  <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{product.brand}</div>
                  <Link to={`/product/${product.id}`} className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 hover:text-[var(--primary)] transition-colors leading-snug">{product.name}</Link>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={product.rating} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
                    <Button size="sm" onClick={() => addToCart({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.image })} disabled={!product.inStock} className="text-xs px-2.5">Add</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
