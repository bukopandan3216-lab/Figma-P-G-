import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Check, CreditCard, MapPin, Package } from 'lucide-react';
import { useCart } from '../../context/AppContext';
import { Button, Input, Stepper, Breadcrumb } from '../../components/ui';
import CustomerNav from '../../components/CustomerNav';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../lib/catalog';

const STEPS = ['Shipping', 'Payment', 'Confirmation'];

export default function CartCheckoutPage() {
  const [view, setView] = useState<'cart' | 'checkout'>('cart');
  const [step, setStep] = useState(0);
  const { cart, removeFromCart, updateQty, cartTotal, cartCount } = useCart();
  const { user } = useAuth();

  const [shipping, setShipping] = useState({ name: '', email: '', phone: '', address: '', city: '', zip: '', country: 'Philippines' });
  const [payment, setPayment] = useState({ card: '', expiry: '', cvv: '', name: '' });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash_on_delivery'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const placeOrder = async () => {
    if (!user || cart.length === 0) return;
    if (!shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.zip) {
      setError('Complete your shipping information before continuing.');
      return;
    }
    if (paymentMethod === 'card' && (!payment.name || !payment.card || !payment.expiry || !payment.cvv)) {
      setError('Complete the card details before placing the order.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      const order = await createOrder({
        customerId: user.id,
        items: cart.map(item => ({ productId: item.id, quantity: item.qty, unitPrice: item.price, variant: item.variant })),
        shipping,
        paymentMethod,
      });
      setOrderNumber(order.order_number);
      setStep(2);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'cart') return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
        <h1 className="font-display text-3xl mt-4 mb-8">Shopping Cart</h1>
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={56} className="mx-auto text-[var(--muted-foreground)] opacity-30 mb-4" />
            <h2 className="font-semibold text-lg mb-2">Your cart is empty</h2>
            <p className="text-[var(--muted-foreground)] text-sm mb-6">Add some products to get started.</p>
            <Link to="/"><Button>Continue Shopping</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-3">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-[var(--radius-xl)] border border-[var(--border)]">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-[var(--radius-lg)] bg-[var(--secondary)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[var(--muted-foreground)] mb-0.5">{item.brand}</div>
                    <div className="text-sm font-semibold line-clamp-2">{item.name}</div>
                    {item.variant && <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{item.variant}</div>}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--secondary)] text-sm font-medium">−</button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-[var(--secondary)] text-sm font-medium">+</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">${(item.price * item.qty).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-5 h-fit sticky top-24">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Subtotal ({cartCount} items)</span><span>${cartTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Shipping</span><span className="text-emerald-600">{cartTotal >= 35 ? 'Free' : '$4.99'}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted-foreground)]">Tax</span><span>${(cartTotal * 0.12).toFixed(2)}</span></div>
              </div>
              <div className="border-t border-[var(--border)] pt-3 mb-4">
                <div className="flex justify-between font-bold text-base"><span>Total</span><span>${(cartTotal + (cartTotal >= 35 ? 0 : 4.99) + cartTotal * 0.12).toFixed(2)}</span></div>
              </div>
              {cartTotal < 35 && <p className="text-xs text-[var(--muted-foreground)] mb-3">Add ${(35 - cartTotal).toFixed(2)} more for free shipping!</p>}
              <Button className="w-full" size="lg" onClick={() => setView('checkout')}>Proceed to Checkout</Button>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
                <CreditCard size={12} /> Secure checkout
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Checkout flow
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <CustomerNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-3xl mb-8">Checkout</h1>
        <Stepper steps={STEPS} current={step} />
        {error && <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-[var(--radius)] text-sm text-red-700">{error}</div>}

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {step === 0 && (
              <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin size={16} className="text-[var(--primary)]" /> Shipping Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="Maria Santos" value={shipping.name} onChange={e => setShipping(p => ({ ...p, name: e.target.value }))} className="col-span-2" />
                  <Input label="Email" type="email" placeholder="maria@email.com" value={shipping.email} onChange={e => setShipping(p => ({ ...p, email: e.target.value }))} />
                  <Input label="Phone" placeholder="+63 912 345 6789" value={shipping.phone} onChange={e => setShipping(p => ({ ...p, phone: e.target.value }))} />
                  <Input label="Street Address" placeholder="123 Rizal St." value={shipping.address} onChange={e => setShipping(p => ({ ...p, address: e.target.value }))} className="col-span-2" />
                  <Input label="City" placeholder="Makati City" value={shipping.city} onChange={e => setShipping(p => ({ ...p, city: e.target.value }))} />
                  <Input label="ZIP Code" placeholder="1220" value={shipping.zip} onChange={e => setShipping(p => ({ ...p, zip: e.target.value }))} />
                </div>
                <Button className="mt-6 w-full" onClick={() => setStep(1)}>Continue to Payment</Button>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><CreditCard size={16} className="text-[var(--primary)]" /> Payment Details</h2>
                <div className="flex gap-2 mb-4">
                  <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 border rounded-[var(--radius)] px-3 py-2 text-sm ${paymentMethod === 'card' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)]'}`}>Card payment</button>
                  <button type="button" onClick={() => setPaymentMethod('cash_on_delivery')} className={`flex-1 border rounded-[var(--radius)] px-3 py-2 text-sm ${paymentMethod === 'cash_on_delivery' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-[var(--border)]'}`}>Cash on delivery</button>
                </div>
                <div className="flex flex-col gap-4">
                  {paymentMethod === 'card' && <>
                    <p className="text-xs text-[var(--muted-foreground)]">Card details are sent to the payment provider and are never stored in P&G Beauty.</p>
                    <Input label="Cardholder Name" placeholder="Maria Santos" value={payment.name} onChange={e => setPayment(p => ({ ...p, name: e.target.value }))} />
                    <Input label="Card Number" placeholder="1234 5678 9012 3456" value={payment.card} onChange={e => setPayment(p => ({ ...p, card: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Expiry" placeholder="MM / YY" value={payment.expiry} onChange={e => setPayment(p => ({ ...p, expiry: e.target.value }))} />
                      <Input label="CVV" placeholder="123" value={payment.cvv} onChange={e => setPayment(p => ({ ...p, cvv: e.target.value }))} />
                    </div>
                  </>}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                    <Button className="flex-1" onClick={placeOrder} loading={submitting}>Place Order</Button>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <h2 className="font-display text-2xl mb-2">Order Confirmed!</h2>
                <p className="text-[var(--muted-foreground)] text-sm mb-1">Order #{orderNumber}</p>
                <p className="text-[var(--muted-foreground)] text-sm mb-6">A confirmation email has been sent to {shipping.email || 'your email'}.</p>
                <div className="bg-[var(--secondary)] rounded-[var(--radius-lg)] p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2"><Package size={14} className="text-[var(--primary)]" /> Estimated Delivery</div>
                  <p className="text-sm text-[var(--muted-foreground)]">Sept 24–26, 2026</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">Shipping to {shipping.address || 'your address'}</p>
                </div>
                <div className="flex gap-3">
                  <Link to="/orders" className="flex-1"><Button variant="outline" className="w-full">Track Order</Button></Link>
                  <Link to="/" className="flex-1"><Button className="w-full">Continue Shopping</Button></Link>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-[var(--border)] rounded-[var(--radius-xl)] p-4">
              <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
              <div className="flex flex-col gap-2 mb-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <img src={item.image} alt="" className="w-8 h-8 object-cover rounded bg-[var(--secondary)] flex-shrink-0" />
                    <span className="flex-1 truncate">{item.name}</span>
                    <span className="font-medium flex-shrink-0">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--border)] pt-3 text-sm">
                <div className="flex justify-between font-bold"><span>Total</span><span>${(cartTotal * 1.12).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
