import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { Filter, ChevronDown, X } from "lucide-react"
import type { Product } from "../../data/products"
import { useCatalog } from "../../context/CatalogContext"
import { useCart } from "../../context/AppContext"
import {
  Badge,
  Button,
  StarRating,
  Checkbox,
  RangeSlider,
  Breadcrumb,
} from "../../components/ui"
import CustomerNav from "../../components/CustomerNav"
import ProductModal from "../../components/ProductModal"

const brands = ["Olay", "Pantene", "Head & Shoulders", "Secret", "Ivory"]
const sortOptions = [
  "Featured",
  "Price: Low to High",
  "Price: High to Low",
  "Top Rated",
  "Newest",
]

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>()
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
  const [sort, setSort] = useState("Featured")
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const { addToCart, wishlist, toggleWishlist } = useCart()
  const { products, loading, error } = useCatalog()
  const maxPrice = Math.ceil(Math.max(...products.map((product) => product.price), 0))

  useEffect(() => {
    const handler = (e: CustomEvent) => setModalProduct(e.detail)
    window.addEventListener("open-product-modal", handler as EventListener)
    return () =>
      window.removeEventListener("open-product-modal", handler as EventListener)
  }, [])

  useEffect(() => {
    if (maxPrice > 0) setPriceRange([0, maxPrice])
  }, [maxPrice])

  if (loading) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center text-sm text-[var(--muted-foreground)]">Loading catalog...</div>
  if (error) return <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center"><p className="text-sm text-[var(--muted-foreground)]">{error}</p></div>

  const categoryName =
    id === "skin-care"
      ? "Skin Care"
      : id === "hair-care"
        ? "Hair Care"
        : id === "body-care"
          ? "Body Care"
          : "All Products"

  let filtered = products.filter((p) => {
    const matchesCat =
      id === "all" ||
      id === undefined ||
      p.category.toLowerCase().replace(" ", "-") === id ||
      p.category
        .toLowerCase()
        .replace(/\s+/g, "-")
        .includes((id || "").replace("-care", ""))
    const matchesBrand =
      selectedBrands.length === 0 || selectedBrands.includes(p.brand)
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
    return matchesCat && matchesBrand && matchesPrice
  })

  if (sort === "Price: Low to High")
    filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === "Price: High to Low")
    filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sort === "Top Rated")
    filtered = [...filtered].sort((a, b) => b.rating - a.rating)

  const toggleBrand = (b: string) =>
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    )

  const FilterPanel = () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Brand</h3>
        <div className="flex flex-col gap-2">
          {brands.map((b) => (
            <Checkbox
              key={b}
              checked={selectedBrands.includes(b)}
              onChange={() => toggleBrand(b)}
              label={b}
            />
          ))}
        </div>
      </div>
      <div className="h-px bg-[var(--border)]" />
      <RangeSlider
        min={0}
        max={maxPrice}
        value={priceRange}
        onChange={setPriceRange}
        label="Price Range"
      />
      <div className="h-px bg-[var(--border)]" />
      <div>
        <h3 className="text-sm font-semibold mb-3">Availability</h3>
        <div className="flex flex-col gap-2">
          <Checkbox checked={false} onChange={() => {}} label="In Stock Only" />
          <Checkbox checked={false} onChange={() => {}} label="On Sale" />
        </div>
      </div>
      {selectedBrands.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedBrands([])}
          
        >
          <X size={14} /> Clear Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Breadcrumb
          items={[{ label: "Home", href: "/" }, { label: categoryName }]}
        />
        <div className="flex items-center justify-between mt-4 mb-6">
          <h1 className="font-display text-3xl">{categoryName}</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(true)}
              className="md:hidden flex items-center gap-2 px-3 py-2 text-sm border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--secondary)]"
            >
              <Filter size={14} /> Filter
            </button>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-[var(--border)] rounded-[var(--radius)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer"
              >
                {sortOptions.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-24 bg-white rounded-[var(--radius-xl)] border border-[var(--border)] p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Filter size={15} /> Filters
              </h2>
              <FilterPanel />
            </div>
          </aside>

          {filterOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setFilterOpen(false)}
              />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-5">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold">Filters</h2>
                  <button onClick={() => setFilterOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                <FilterPanel />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              {filtered.length} products
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-[var(--muted-foreground)]">
                <Filter size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No products match your filters</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setSelectedBrands([])
                    setPriceRange([0, maxPrice])
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-[var(--radius-xl)] border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <button
                      className="block w-full relative aspect-square overflow-hidden bg-[var(--secondary)]"
                      onClick={() => setModalProduct(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.badge && (
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant={
                              product.badge === "Almost Sold Out"
                                ? "warning"
                                : product.badge === "Sale"
                                  ? "danger"
                                  : "rose"
                            }
                            className="text-[10px]"
                          >
                            {product.badge}
                          </Badge>
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-xs font-medium text-[var(--muted-foreground)]">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleWishlist(product.id)
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill={
                            wishlist.includes(product.id) ? "#B5697A" : "none"
                          }
                          stroke="#B5697A"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </button>
                    <div className="p-3">
                      <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5 font-medium">
                        {product.brand}
                      </div>
                      <button
                        onClick={() => setModalProduct(product)}
                        className="text-sm font-semibold text-[var(--foreground)] line-clamp-2 hover:text-[var(--primary)] transition-colors leading-snug text-left w-full"
                      >
                        {product.name}
                      </button>
                      <div className="flex items-center gap-1 mt-1">
                        <StarRating rating={product.rating} />
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          ({product.reviews.toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <span className="text-sm font-bold">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-[10px] text-[var(--muted-foreground)] line-through ml-1">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            addToCart({
                              id: product.id,
                              name: product.name,
                              brand: product.brand,
                              price: product.price,
                              image: product.image,
                            })
                          }
                          disabled={!product.inStock}
                          className="text-xs px-2.5 py-1"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
