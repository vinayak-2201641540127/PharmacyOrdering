import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/format';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article className="product-card">
      <div className="product-card__header">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
        {product.requiresPrescription ? <span className="pill pill-warning">Rx Required</span> : null}
      </div>

      <div className="product-card__footer">
        <div>
          <strong>{formatCurrency(product.price)}</strong>
          <p>{product.stockQuantity} units in stock</p>
        </div>
        <button
          className="primary-button"
          disabled={product.stockQuantity < 1}
          onClick={() => addItem(product)}
          type="button"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
