import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/format';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addItem(product);
  };

  const getStockLabel = () => {
    if (product.stockQuantity === 0) return <p className="rx-card-stock none">Out of stock</p>;
    if (product.stockQuantity < 20) return <p className="rx-card-stock low">Only {product.stockQuantity} remaining</p>;
    return <p className="rx-card-stock">In stock</p>;
  };

  return (
    <article className="rx-card">
      
      <div className="rx-card-header">
        <h3 className="rx-card-title">{product.name}</h3>
        {product.requiresPrescription ? (
          <span className="rx-pill rx-pill--warning" title="Prescription Required">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            Rx
          </span>
        ) : null}
      </div>

      <p className="rx-card-desc">{product.description}</p>

      <div className="rx-card-footer">
        <div className="rx-card-price-row">
          <p className="rx-card-price">{formatCurrency(product.price)}</p>
          {getStockLabel()}
        </div>

        <button
          className="rx-add-btn"
          disabled={product.stockQuantity < 1}
          onClick={handleAddToCart}
          type="button"
          aria-label={`Add ${product.name} to cart`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {product.stockQuantity < 1 ? 'Unavailable' : 'Add to cart'} 
        </button>
      </div>

    </article>
  );
}
