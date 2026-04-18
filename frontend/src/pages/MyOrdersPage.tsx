import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../api/ordersApi';
import StatusPill from '../components/StatusPill';
import { getErrorMessage } from '../lib/errors';
import { formatCurrency, formatDateTime } from '../lib/format';
import type { OrderResponse } from '../types/api';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const nextOrders = await fetchMyOrders();
        setOrders(nextOrders);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Unable to load order history.'));
      }
    };

    void loadOrders();
  }, []);

  return (
    <section className="page-grid">
      <div className="panel">
        <p className="eyebrow">Order History</p>
        <h2>Track placed orders and order-level status</h2>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="table-list">
          {orders.map((order) => (
            <article className="list-card" key={order.orderId}>
              <div className="list-card__row">
                <div>
                  <strong>Order #{order.orderId}</strong>
                  <p className="muted-label">{formatDateTime(order.createdAt)}</p>
                </div>
                <StatusPill status={order.status} />
              </div>
              <p>{order.deliveryAddress}</p>
              <div className="list-card__row">
                <span>{formatCurrency(order.totalAmount)}</span>
                <Link className="inline-link" to={`/orders/${order.orderId}`}>
                  View details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
