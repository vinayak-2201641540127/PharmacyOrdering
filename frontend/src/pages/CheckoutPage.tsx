import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { placeOrder } from '../api/ordersApi';
import { useCart } from '../context/CartContext';
import { getErrorMessage } from '../lib/errors';
import { formatCurrency } from '../lib/format';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { clearCart, items, totalAmount } = useCart();

  const [error, setError] = useState<string | null>(null);
  const [rxError, setRxError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setRxError(false);

    if (items.length === 0) {
      setError('Add at least one item to the cart before checking out.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const deliveryAddress = String(formData.get('deliveryAddress') ?? '');

    try {
      const order = await placeOrder({
        deliveryAddress,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      navigate(`/orders`);
    } catch (submitError) {
      const errorMsg = getErrorMessage(submitError, 'Unable to place the order.');
      setError(errorMsg);
      // Let's deduce an Rx block if the API complains about prescriptions
      if (errorMsg.toLowerCase().includes('prescription')) {
        setRxError(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-root">
      
      {/* ── Payment & Delivery Panel ── */}
      <section className="panel-checkout">
        <h2>Delivery & Payment</h2>
        
        <form onSubmit={handleSubmit} id="checkout-form">
          <div className="input-block">
            <label htmlFor="deliveryAddress">Delivery Address</label>
            <textarea
              className="input-box"
              id="deliveryAddress"
              name="deliveryAddress"
              placeholder="Flat, street, landmark, city, pin code..."
              required
              spellCheck={false}
            />
          </div>

          <div className="payment-divider">Secure Payment</div>

          <div className="input-block">
            <label htmlFor="ccName">Name on Card</label>
            <input className="input-box" id="ccName" type="text" placeholder="John Doe" required />
          </div>

          <div className="input-block">
            <label htmlFor="ccNum">Card Number</label>
            <div className="cc-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              <input className="input-box" id="ccNum" type="text" placeholder="0000 0000 0000 0000" maxLength={19} required />
            </div>
          </div>

          <div className="form-row">
            <div className="input-block">
              <label htmlFor="ccExp">Expiry (MM/YY)</label>
              <input className="input-box" id="ccExp" type="text" placeholder="12/28" maxLength={5} required />
            </div>
            <div className="input-block">
              <label htmlFor="ccCvc">CVC</label>
              <input className="input-box" id="ccCvc" type="password" placeholder="123" maxLength={4} required />
            </div>
          </div>

          {error && (
            <div className="form-error" style={{ marginTop: '1.25rem', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span style={{ fontWeight: 600 }}>Checkout Blocked</span>
              </div>
              <span style={{ lineHeight: 1.5 }}>{error}</span>
              {rxError && (
                <Link to="/upload" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  marginTop: '0.25rem', padding: '0.5rem 1rem', background: '#fff',
                  color: 'var(--text-error)', borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', border: '1px solid currentColor'
                }}>
                  Upload Prescription Now
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Link>
              )}
            </div>
          )}
        </form>
      </section>

      {/* ── Receipt Panel ── */}
      <section className="panel-receipt">
        <h3>Order Summary</h3>
        
        {items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginTop: '2rem' }}>
            Your cart is currently empty. Add medicines from the catalog to proceed.
          </p>
        ) : (
          <div className="receipt-list">
            {items.map((item) => (
              <div className="receipt-item" key={item.productId}>
                <div className="receipt-item-info">
                  <strong>{item.name}</strong>
                  <span>Qty: {item.quantity}</span>
                  {item.requiresPrescription && (
                    <span style={{ color: 'var(--hcl-teal)', fontSize: '0.75em', marginTop: '4px' }}>
                      Rx required validation
                    </span>
                  )}
                </div>
                <div className="receipt-item-price">
                  {formatCurrency(item.price * item.quantity)}
                </div>
              </div>
            ))}
            
            <div className="receipt-total">
              <span>Total to pay</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>
          </div>
        )}

        <button 
          className="btn-lock" 
          disabled={isSubmitting || items.length === 0} 
          type="submit" 
          form="checkout-form"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          {isSubmitting ? 'Authenticating...' : `Pay ${formatCurrency(totalAmount)}`}
        </button>
      </section>

    </div>
  );
}
