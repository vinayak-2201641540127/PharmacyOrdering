import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { placeOrder } from '../api/ordersApi';
import { useCart } from '../context/CartContext';
import { getErrorMessage } from '../lib/errors';
import { formatCurrency } from '../lib/format';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { clearCart, items, removeItem, totalAmount, updateQuantity } = useCart();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Add at least one item to the cart before placing an order.');
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
      navigate(`/orders/${order.orderId}`);
    } catch (submitError) {
      setError(getErrorMessage(submitError, 'Unable to place the order.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="page-grid two-column-grid">
      <div className="panel">
        <p className="eyebrow">Checkout</p>
        <h2>Review basket and confirm delivery details</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Delivery address
            <textarea
              name="deliveryAddress"
              placeholder="Flat, street, landmark, city, pin code"
              required
              rows={5}
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Placing order...' : `Place order for ${formatCurrency(totalAmount)}`}
          </button>
        </form>
      </div>

      <div className="panel">
        <p className="eyebrow">Cart</p>
        <h2>Current basket</h2>
        {items.length === 0 ? (
          <div className="empty-state">
            <h3>Your cart is empty.</h3>
            <p>Add medicines from the product catalog to continue.</p>
          </div>
        ) : (
          <div className="table-list">
            {items.map((item) => (
              <article className="list-card" key={item.productId}>
                <div className="list-card__row">
                  <strong>{item.name}</strong>
                  <button className="ghost-button" onClick={() => removeItem(item.productId)} type="button">
                    Remove
                  </button>
                </div>
                <div className="quantity-row">
                  <label>
                    Qty
                    <input
                      min={1}
                      onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                      type="number"
                      value={item.quantity}
                    />
                  </label>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
                {item.requiresPrescription ? (
                  <p className="muted-label">This item requires an approved prescription before checkout.</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
