import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../api/ordersApi';
import StatusPill from '../components/StatusPill';
import { getErrorMessage } from '../lib/errors';
import { formatCurrency, formatDateTime } from '../lib/format';
import type { OrderResponse } from '../types/api';
import './MyOrdersPage.css';

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
    <div className="orders-page-root">
      
      <section className="orders-hero">
        <p className="eyebrow">My History</p>
        <h2>Status Tracking & Complete Order Log</h2>
      </section>

      {error ? (
        <div className="form-error" style={{ margin: '0 2rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{error}</span>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No orders have been placed yet.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <article className="order-card" key={order.orderId}>
              
              <div className="order-header">
                <div>
                  <h3 className="order-id">Order #{order.orderId}</h3>
                  <p className="order-date">{formatDateTime(order.createdAt)}</p>
                </div>
                <StatusPill status={order.status} />
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <p>{order.deliveryAddress}</p>
                </div>
                <div className="detail-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <p>{order.items?.length || 0} Item{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
                
                <Link className="view-btn" to={`/orders/${order.orderId}`}>
                  View details
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>
              </div>

            </article>
          ))}
        </div>
      )}

    </div>
  );
}
