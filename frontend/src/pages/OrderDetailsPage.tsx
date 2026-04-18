import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchOrderById } from '../api/ordersApi';
import StatusPill from '../components/StatusPill';
import { getErrorMessage } from '../lib/errors';
import { formatCurrency, formatDateTime } from '../lib/format';
import type { OrderResponse } from '../types/api';

export default function OrderDetailsPage() {
  const { orderId = '' } = useParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const nextOrder = await fetchOrderById(orderId);
        setOrder(nextOrder);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Unable to load the order.'));
      }
    };

    void loadOrder();
  }, [orderId]);

  return (
    <section className="page-grid">
      <div className="panel">
        <p className="eyebrow">Order Summary</p>
        <h2>Review line items, address, and placement status</h2>

        {error ? <p className="form-error">{error}</p> : null}

        {order ? (
          <>
            <div className="list-card">
              <div className="list-card__row">
                <strong>Order #{order.orderId}</strong>
                <StatusPill status={order.status} />
              </div>
              <p className="muted-label">Placed on {formatDateTime(order.createdAt)}</p>
              <p>{order.deliveryAddress}</p>
              <strong>{formatCurrency(order.totalAmount)}</strong>
            </div>

            <div className="table-list">
              {order.items.map((item) => (
                <article className="list-card" key={item.productId}>
                  <div className="list-card__row">
                    <strong>{item.productName}</strong>
                    <span>{formatCurrency(item.lineTotal)}</span>
                  </div>
                  <p className="muted-label">
                    {item.quantity} x {formatCurrency(item.unitPrice)}
                  </p>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
