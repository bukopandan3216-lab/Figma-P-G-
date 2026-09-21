import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Package, Heart, Settings, LogOut, ChevronRight, MapPin, CreditCard,
  Eye, EyeOff, Sparkles, Plus, Trash2, Edit2, Check, X, Smartphone, ArrowLeft
} from 'lucide-react';
import { Button, Input, Badge, Modal } from '../../components/ui';
import { useCart } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import CustomerNav from '../../components/CustomerNav';
import { useToast, ToastContainer } from '../../components/ui';
import { supabase } from '../../lib/supabase';

// ─── Login Page ───────────────────────────────────────────────────────────────
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from || '/';
  const goBack = () => window.history.length > 1 ? navigate(-1) : navigate('/');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) navigate(destination, { replace: true });
    else setError(result.error || 'Login failed.');
  };

  const handleSocialLogin = async (provider: 'Google' | 'Facebook') => {
    setLoading(true); setError('');
    const result = await socialLogin(provider);
    setLoading(false);
    if (result.ok) navigate(destination, { replace: true });
    else setError(result.error || `${provider} sign in failed.`);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <div className="hidden lg:block flex-1 bg-gradient-to-br from-[#2C1810] to-[#4A2030] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 40% 60%, #B5697A 0%, transparent 60%)' }} />
        <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1200&fit=crop&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" />
        <div className="relative z-10 p-12 flex flex-col justify-end h-full">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center"><Sparkles size={16} className="text-white" /></div>
            <span className="font-display text-xl text-white">P&G Beauty</span>
          </div>
          <h2 className="font-display text-4xl text-white mb-3">Beauty that speaks to you.</h2>
          <p className="text-white/70 text-sm max-w-xs">AI-powered recommendations tailored to your unique beauty profile.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
            <span className="font-display text-xl">P&G Beauty</span>
          </div>
          <div className="flex items-center justify-between gap-4 mb-1">
            <h1 className="font-display text-3xl">Welcome back</h1>
            <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label="Go back">
              <ArrowLeft size={15} aria-hidden="true" /> Back
            </button>
          </div>
          <p className="text-[var(--muted-foreground)] text-sm mb-8">Sign in to your account</p>
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[var(--radius)] text-sm text-red-700 flex items-center gap-2">
              <X size={14} className="flex-shrink-0" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
                <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">{showPw ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <div className="flex justify-end"><Link to="/forgot-password" className="text-xs text-[var(--primary)] hover:underline">Forgot password?</Link></div>
            <Button type="submit" size="lg" className="w-full" loading={loading}>Sign In</Button>
            <div className="relative flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted-foreground)]">or continue with</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={() => handleSocialLogin('Google')} disabled={loading}><span className="font-bold text-sm text-[#4285F4]">G</span> Google</Button>
              <Button type="button" variant="outline" onClick={() => handleSocialLogin('Facebook')} disabled={loading}><span className="font-bold text-sm">f</span> Facebook</Button>
            </div>
            <div className="text-center text-sm text-[var(--muted-foreground)]">
              Don't have an account? <Link to="/register" className="text-[var(--primary)] font-medium hover:underline">Create one</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const { register, socialLogin } = useAuth();
  const navigate = useNavigate();
  const goBack = () => window.history.length > 1 ? navigate(-1) : navigate('/');

  const handleSocialRegister = async (provider: 'Google' | 'Facebook') => {
    setLoading(true); setError('');
    const result = await socialLogin(provider);
    setLoading(false);
    if (result.ok) navigate('/quiz');
    else setError(result.error || `${provider} sign up failed.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!agreed) { setError('Please agree to the Terms of Service.'); return; }
    setLoading(true); setError('');
    const result = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password });
    setLoading(false);
    if (result.ok) navigate('/quiz');
    else setError(result.error || 'Registration failed.');
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
          <span className="font-display text-xl">P&G Beauty</span>
        </div>
        <div className="flex items-center justify-between gap-4 mb-1">
          <h1 className="font-display text-3xl">Create your account</h1>
          <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label="Go back">
            <ArrowLeft size={15} aria-hidden="true" /> Back
          </button>
        </div>
        <p className="text-[var(--muted-foreground)] text-sm mb-8">Get personalized beauty recommendations</p>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[var(--radius)] text-sm text-red-700 flex items-center gap-2">
            <X size={14} className="flex-shrink-0" />{error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="Maria" value={form.firstName} onChange={set('firstName')} />
            <Input label="Last Name" placeholder="Santos" value={form.lastName} onChange={set('lastName')} />
          </div>
          <Input label="Email" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} />
          <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} hint="At least 8 characters" />
          <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} />
          <label className="flex items-start gap-2.5 cursor-pointer text-sm text-[var(--muted-foreground)]">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-[var(--primary)]" />
            I agree to the <a href="#" className="text-[var(--primary)] underline">Terms of Service</a> and <a href="#" className="text-[var(--primary)] underline">Privacy Policy</a>
          </label>
          <Button type="submit" size="lg" className="w-full" loading={loading}>Create Account & Take Beauty Quiz</Button>
          <div className="relative flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted-foreground)]">or sign up with</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => handleSocialRegister('Google')} disabled={loading}><span className="font-bold text-sm text-[#4285F4]">G</span> Google</Button>
            <Button type="button" variant="outline" onClick={() => handleSocialRegister('Facebook')} disabled={loading}><span className="font-bold text-sm">f</span> Facebook</Button>
          </div>
          <div className="text-center text-sm text-[var(--muted-foreground)]">
            Already have an account? <Link to="/login" className="text-[var(--primary)] font-medium hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Forgot Password ──────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center"><Sparkles size={14} className="text-white" /></div>
          <span className="font-display text-xl">P&G Beauty</span>
        </div>
        {!sent ? (
          <>
            <h1 className="font-display text-3xl mb-1">Reset password</h1>
            <p className="text-[var(--muted-foreground)] text-sm mb-8">Enter your email and we'll send a reset link.</p>
            <div className="flex flex-col gap-4">
              <Input label="Email" type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              <Button className="w-full" onClick={() => email && setSent(true)}>Send Reset Link</Button>
              <Link to="/login" className="text-center text-sm text-[var(--primary)] hover:underline">Back to sign in</Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✉️</span></div>
            <h2 className="font-semibold text-lg mb-2">Check your inbox</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-1">A password reset link has been sent to</p>
            <p className="font-medium text-sm mb-6">{email}</p>
            <Link to="/login"><Button variant="outline">Back to Sign In</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Account Settings ─────────────────────────────────────────────────────────
export function AccountPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const { user, logout, updateUser } = useAuth();
  const { toasts, add: addToast, remove } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { id: 'profile', label: 'Profile', icon: <Settings size={16} /> },
    { id: 'orders', label: 'My Orders', icon: <Package size={16} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={16} /> },
    { id: 'payment', label: 'Payment Methods', icon: <CreditCard size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl mb-8">My Account</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 flex-shrink-0">
            <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-4">
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-sm font-bold text-[var(--primary)]">
                  {user?.initials || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-sm">{user?.firstName} {user?.lastName}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{user?.email}</div>
                </div>
              </div>
              <nav className="flex flex-col gap-0.5">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => setActiveSection(item.id)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium transition-all text-left ${activeSection === item.id ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'}`}>
                    {item.icon}{item.label}
                  </button>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius)] text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-2">
                  <LogOut size={16} />Sign Out
                </button>
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">
            {activeSection === 'profile' && <ProfileSection user={user} updateUser={updateUser} addToast={addToast} />}
            {activeSection === 'orders' && <OrdersSection addToast={addToast} />}
            {activeSection === 'wishlist' && <WishlistSection />}
            {activeSection === 'addresses' && <AddressesSection addToast={addToast} />}
            {activeSection === 'payment' && <PaymentSection addToast={addToast} />}
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection({ user, updateUser, addToast }: any) {
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '', birthday: user?.birthday || '' });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = () => {
    updateUser({ firstName: form.firstName, lastName: form.lastName, phone: form.phone, birthday: form.birthday, initials: `${form.firstName[0]}${form.lastName[0]}`.toUpperCase() });
    addToast('success', 'Profile updated successfully!');
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
      <h2 className="font-semibold mb-5">Profile Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <Input label="First Name" value={form.firstName} onChange={set('firstName')} />
        <Input label="Last Name" value={form.lastName} onChange={set('lastName')} />
        <Input label="Email" type="email" value={form.email} disabled className="col-span-2 opacity-60" />
        <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+63 912 345 6789" />
        <Input label="Birthday" type="date" value={form.birthday} onChange={set('birthday')} />
      </div>
      <Button className="mt-6" onClick={save}>Save Changes</Button>
    </div>
  );
}

// ─── Orders Section ───────────────────────────────────────────────────────────
function OrdersSection({ addToast }: { addToast: (t: any, m: string) => void }) {
  const [tracking, setTracking] = useState<string | null>(null);
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    if (!user) return;
    void supabase.from('orders').select('id, created_at, status, total_amount, order_items(quantity, price_at_purchase, product_variants(products(name, image)))').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      setOrders((data || []).map((order: any) => ({ id: order.id, date: new Date(order.created_at).toLocaleDateString(), status: order.status, total: Number(order.total_amount), items: (order.order_items || []).map((item: any) => ({ name: item.product_variants?.products?.name || 'Product', qty: item.quantity, price: Number(item.price_at_purchase), image: item.product_variants?.products?.image || '' })) })));
    });
  }, [user?.id]);
  const trackingSteps = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  return (
    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
      <h2 className="font-semibold mb-5">My Orders</h2>
      {orders.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">No orders yet.</p>}
      <div className="flex flex-col gap-4">
        {orders.map(order => (
          <div key={order.id} className="border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--secondary)]">
              <div>
                <div className="text-sm font-semibold">{order.id}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{order.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={order.status === 'Delivered' ? 'success' : order.status === 'In Transit' ? 'info' : 'warning'}>{order.status}</Badge>
                <span className="font-bold text-sm">${order.total.toFixed(2)}</span>
              </div>
            </div>
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-t border-[var(--border)]">
                <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-[var(--radius)] bg-[var(--secondary)] flex-shrink-0" />
                <div className="flex-1"><div className="text-sm font-medium">{item.name}</div><div className="text-xs text-[var(--muted-foreground)]">Qty: {item.qty}</div></div>
                <span className="text-sm font-semibold">${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex gap-2 px-4 py-3 border-t border-[var(--border)]">
              <Button size="sm" variant="outline" onClick={() => setTracking(tracking === order.id ? null : order.id)}>
                {tracking === order.id ? 'Hide' : 'Track'} Order
              </Button>
              <Button size="sm" variant="ghost" onClick={() => addToast('success', 'Items added to cart!')}>Reorder</Button>
            </div>
            {tracking === order.id && (
              <div className="px-4 pb-4">
                <div className="flex items-center">
                  {trackingSteps.map((step, i) => {
                    const done = order.status === 'Delivered' ? i <= 4 : i <= 2;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? 'bg-[var(--primary)] text-white' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'}`}>{done ? <Check size={11} /> : i + 1}</div>
                          <span className="text-[9px] text-center text-[var(--muted-foreground)] leading-tight w-14">{step}</span>
                        </div>
                        {i < trackingSteps.length - 1 && <div className={`flex-1 h-0.5 mb-5 ${done && i < (order.status === 'Delivered' ? 4 : 2) ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Wishlist Section ─────────────────────────────────────────────────────────
function WishlistSection() {
  const { wishlist, addToCart, toggleWishlist } = useCart();
  const { products } = useCatalog();
  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  if (wishedProducts.length === 0) return (
    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6 text-center py-16">
      <Heart size={44} className="mx-auto text-[var(--muted-foreground)] opacity-20 mb-4" />
      <h3 className="font-semibold mb-1">Your wishlist is empty</h3>
      <p className="text-sm text-[var(--muted-foreground)] mb-4">Save products you love by clicking the heart icon.</p>
      <Link to="/"><Button>Explore Products</Button></Link>
    </div>
  );

  return (
    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
      <h2 className="font-semibold mb-5">Wishlist <span className="text-[var(--muted-foreground)] font-normal text-sm">({wishedProducts.length})</span></h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {wishedProducts.map(p => (
          <div key={p.id} className="group border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative aspect-square bg-[var(--secondary)] overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <button onClick={() => toggleWishlist(p.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                <Heart size={14} fill="#B5697A" className="text-[var(--primary)]" />
              </button>
            </div>
            <div className="p-3">
              <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{p.brand}</div>
              <div className="text-sm font-semibold line-clamp-2 mb-2 leading-snug">{p.name}</div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">${p.price.toFixed(2)}</span>
                <Button size="sm" onClick={() => addToCart({ id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image })} disabled={!p.inStock} className="text-xs">Add</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Addresses Section ────────────────────────────────────────────────────────
interface Address { id: string; label: string; name: string; line1: string; city: string; zip: string; phone: string; isDefault: boolean; }

function AddressesSection({ addToast }: any) {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: 'a1', label: 'Home', name: 'Maria Santos', line1: '123 Rizal Street, Barangay San Antonio', city: 'Makati City, Metro Manila', zip: '1220', phone: '+63 912 345 6789', isDefault: true },
    { id: 'a2', label: 'Office', name: 'Maria Santos', line1: '456 Ayala Avenue, Salcedo Village', city: 'Makati City, Metro Manila', zip: '1227', phone: '+63 912 345 6789', isDefault: false },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAddr, setEditAddr] = useState<Address | null>(null);
  const [form, setForm] = useState({ label: 'Home', name: '', line1: '', city: '', zip: '', phone: '' });

  const openAdd = () => { setEditAddr(null); setForm({ label: 'Home', name: '', line1: '', city: '', zip: '', phone: '' }); setModalOpen(true); };
  const openEdit = (a: Address) => { setEditAddr(a); setForm({ label: a.label, name: a.name, line1: a.line1, city: a.city, zip: a.zip, phone: a.phone }); setModalOpen(true); };

  const save = () => {
    if (editAddr) {
      setAddresses(prev => prev.map(a => a.id === editAddr.id ? { ...a, ...form } : a));
      addToast('success', 'Address updated!');
    } else {
      setAddresses(prev => [...prev, { id: `a${Date.now()}`, ...form, isDefault: prev.length === 0 }]);
      addToast('success', 'Address added!');
    }
    setModalOpen(false);
  };

  const remove = (id: string) => { setAddresses(prev => prev.filter(a => a.id !== id)); addToast('info', 'Address removed.'); };
  const setDefault = (id: string) => setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold">Delivery Addresses</h2>
        <Button size="sm" onClick={openAdd}><Plus size={14} /> Add Address</Button>
      </div>
      <div className="flex flex-col gap-3">
        {addresses.map(addr => (
          <div key={addr.id} className={`relative border-2 rounded-[var(--radius-lg)] p-4 transition-all ${addr.isDefault ? 'border-[var(--primary)] bg-[var(--rose-light)]/30' : 'border-[var(--border)]'}`}>
            {addr.isDefault && <div className="absolute top-3 right-3"><Badge variant="rose">Default</Badge></div>}
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} className="text-[var(--primary)]" />
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">{addr.label}</span>
            </div>
            <div className="text-sm font-semibold">{addr.name}</div>
            <div className="text-sm text-[var(--muted-foreground)] mt-0.5">{addr.line1}</div>
            <div className="text-sm text-[var(--muted-foreground)]">{addr.city} {addr.zip}</div>
            <div className="text-sm text-[var(--muted-foreground)]">{addr.phone}</div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="ghost" onClick={() => openEdit(addr)} className="text-xs"><Edit2 size={12} /> Edit</Button>
              {!addr.isDefault && <Button size="sm" variant="ghost" onClick={() => setDefault(addr.id)} className="text-xs">Set as Default</Button>}
              {!addr.isDefault && (
                <Button size="sm" variant="ghost" onClick={() => remove(addr.id)} className="text-xs text-red-500 hover:bg-red-50">
                  <Trash2 size={12} /> Remove
                </Button>
              )}
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">
            <MapPin size={32} className="mx-auto opacity-20 mb-2" />No addresses saved yet.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editAddr ? 'Edit Address' : 'Add New Address'}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Label</label>
            <select value={form.label} onChange={set('label')} className="w-full rounded-[var(--radius)] border border-[var(--border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]">
              {['Home', 'Office', 'Other'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <Input label="Full Name" value={form.name} onChange={set('name')} placeholder="Maria Santos" />
          <Input label="Street Address" value={form.line1} onChange={set('line1')} placeholder="123 Rizal St., Barangay San Antonio" />
          <Input label="City & Province" value={form.city} onChange={set('city')} placeholder="Makati City, Metro Manila" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ZIP Code" value={form.zip} onChange={set('zip')} placeholder="1220" />
            <Input label="Phone" value={form.phone} onChange={set('phone')} placeholder="+63 912 345 6789" />
          </div>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={save} className="flex-1">{editAddr ? 'Save Changes' : 'Add Address'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Payment Methods Section ──────────────────────────────────────────────────
type PaymentType = 'gcash' | 'paymaya' | 'credit' | 'debit';

interface PaymentMethod {
  id: string;
  type: PaymentType;
  label: string;
  detail: string;
  isDefault: boolean;
}

function PaymentSection({ addToast }: any) {
  const [methods, setMethods] = useState<PaymentMethod[]>([
    { id: 'pm1', type: 'credit', label: 'Visa ending in 4242', detail: 'Expires 08/28', isDefault: true },
    { id: 'pm2', type: 'gcash', label: 'GCash', detail: '+63 912 345 6789', isDefault: false },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [addType, setAddType] = useState<PaymentType>('gcash');
  const [form, setForm] = useState({ phone: '', cardName: '', cardNumber: '', expiry: '', cvv: '' });

  const paymentIcons: Record<PaymentType, string> = {
    gcash: '💙', paymaya: '💚', credit: '💳', debit: '🏧'
  };
  const paymentColors: Record<PaymentType, string> = {
    gcash: 'bg-blue-50 text-blue-600 border-blue-200',
    paymaya: 'bg-green-50 text-green-700 border-green-200',
    credit: 'bg-[var(--rose-light)] text-[var(--primary)] border-[var(--primary)]/20',
    debit: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const remove = (id: string) => { setMethods(prev => prev.filter(m => m.id !== id)); addToast('info', 'Payment method removed.'); };
  const setDefault = (id: string) => setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));

  const addMethod = () => {
    let label = '', detail = '';
    if (addType === 'gcash') { label = 'GCash'; detail = form.phone; }
    else if (addType === 'paymaya') { label = 'PayMaya'; detail = form.phone; }
    else if (addType === 'credit') { label = `Visa ending in ${form.cardNumber.slice(-4) || '0000'}`; detail = `Expires ${form.expiry}`; }
    else { label = `Debit ending in ${form.cardNumber.slice(-4) || '0000'}`; detail = `Expires ${form.expiry}`; }
    setMethods(prev => [...prev, { id: `pm${Date.now()}`, type: addType, label, detail, isDefault: prev.length === 0 }]);
    addToast('success', 'Payment method added!');
    setModalOpen(false);
    setForm({ phone: '', cardName: '', cardNumber: '', expiry: '', cvv: '' });
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold">Payment Methods</h2>
        <Button size="sm" onClick={() => setModalOpen(true)}><Plus size={14} /> Add Method</Button>
      </div>
      <div className="flex flex-col gap-3">
        {methods.map(m => (
          <div key={m.id} className={`relative border-2 rounded-[var(--radius-lg)] p-4 transition-all ${m.isDefault ? 'border-[var(--primary)] bg-[var(--rose-light)]/20' : 'border-[var(--border)]'}`}>
            {m.isDefault && <div className="absolute top-3 right-3"><Badge variant="rose">Default</Badge></div>}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-[var(--radius)] border flex items-center justify-center text-xl flex-shrink-0 ${paymentColors[m.type]}`}>
                {paymentIcons[m.type]}
              </div>
              <div>
                <div className="text-sm font-semibold">{m.label}</div>
                <div className="text-xs text-[var(--muted-foreground)]">{m.detail}</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {!m.isDefault && <Button size="sm" variant="ghost" onClick={() => setDefault(m.id)} className="text-xs">Set as Default</Button>}
              <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="text-xs text-red-500 hover:bg-red-50"><Trash2 size={12} /> Remove</Button>
            </div>
          </div>
        ))}
        {methods.length === 0 && (
          <div className="text-center py-10 text-[var(--muted-foreground)] text-sm">
            <CreditCard size={32} className="mx-auto opacity-20 mb-2" />No payment methods saved yet.
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Payment Method">
        <div className="flex flex-col gap-4">
          {/* Type selector */}
          <div>
            <label className="text-sm font-medium block mb-2">Payment Type</label>
            <div className="grid grid-cols-2 gap-2">
              {([['gcash', '💙 GCash'], ['paymaya', '💚 PayMaya'], ['credit', '💳 Credit Card'], ['debit', '🏧 Debit Card']] as [PaymentType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setAddType(type)}
                  className={`p-3 border-2 rounded-[var(--radius)] text-sm font-medium transition-all text-left ${addType === type ? 'border-[var(--primary)] bg-[var(--rose-light)]/40 text-[var(--primary)]' : 'border-[var(--border)] hover:border-[var(--primary)]/40'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Form based on type */}
          {(addType === 'gcash' || addType === 'paymaya') && (
            <>
              <div className={`p-3 rounded-[var(--radius)] border flex items-center gap-2 text-sm ${addType === 'gcash' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                <Smartphone size={14} />
                Link your {addType === 'gcash' ? 'GCash' : 'PayMaya'} account via mobile number.
              </div>
              <Input label="Mobile Number" placeholder="+63 912 345 6789" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </>
          )}
          {(addType === 'credit' || addType === 'debit') && (
            <>
              <Input label="Cardholder Name" placeholder="Maria Santos" value={form.cardName} onChange={e => setForm(p => ({ ...p, cardName: e.target.value }))} />
              <Input label="Card Number" placeholder="1234 5678 9012 3456" value={form.cardNumber} onChange={e => setForm(p => ({ ...p, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Expiry (MM/YY)" placeholder="08 / 28" value={form.expiry} onChange={e => setForm(p => ({ ...p, expiry: e.target.value }))} />
                <Input label="CVV" placeholder="123" value={form.cvv} onChange={e => setForm(p => ({ ...p, cvv: e.target.value.slice(0, 4) }))} />
              </div>
            </>
          )}
          <div className="flex gap-3 mt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={addMethod} className="flex-1">Add Payment Method</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Wishlist Page (standalone) ───────────────────────────────────────────────
export function WishlistPage() {
  const { wishlist, addToCart, toggleWishlist } = useCart();
  const { products } = useCatalog();
  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl mb-8">My Wishlist <span className="text-[var(--muted-foreground)] text-xl font-normal font-sans">({wishedProducts.length})</span></h1>
        {wishedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={56} className="mx-auto text-[var(--muted-foreground)] opacity-20 mb-4" />
            <h2 className="font-semibold text-lg mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Save products you love to your wishlist.</p>
            <Link to="/"><Button>Explore Products</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishedProducts.map(p => (
              <div key={p.id} className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden group">
                <div className="relative aspect-square bg-[var(--secondary)] overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button onClick={() => toggleWishlist(p.id)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                    <Heart size={14} fill="#B5697A" className="text-[var(--primary)]" />
                  </button>
                </div>
                <div className="p-3">
                  <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{p.brand}</div>
                  <Link to={`/product/${p.id}`} className="text-sm font-semibold line-clamp-2 hover:text-[var(--primary)] transition-colors">{p.name}</Link>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm">${p.price.toFixed(2)}</span>
                    <Button size="sm" onClick={() => addToCart({ id: p.id, name: p.name, brand: p.brand, price: p.price, image: p.image })} disabled={!p.inStock} className="text-xs">Add to Cart</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Orders Page (standalone) ─────────────────────────────────────────────────
export function OrdersPage() {
  const { toasts, add: addToast, remove } = useToast();
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <ToastContainer toasts={toasts} onRemove={remove} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl mb-8">Order History</h1>
        <OrdersSection addToast={addToast} />
      </div>
    </div>
  );
}
