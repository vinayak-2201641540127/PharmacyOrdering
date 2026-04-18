import { useDeferredValue, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../api/productsApi';
import { getErrorMessage } from '../lib/errors';
import type { Product } from '../types/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const nextProducts = await fetchProducts(deferredSearch.trim() || undefined);
        setProducts(nextProducts);
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Unable to load products.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, [deferredSearch]);

  return (
    <section className="page-grid">
      <div className="panel panel--hero">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Search stocked medicines and route restricted items through prescription review</h2>
        </div>
        <label className="search-box">
          <span>Search medicines</span>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Paracetamol, insulin, cough syrup..."
            type="search"
            value={search}
          />
        </label>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {isLoading ? <p className="muted-label">Loading products...</p> : null}

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!isLoading && products.length === 0 ? (
        <div className="panel empty-state">
          <h3>No medicines matched your search.</h3>
          <p>Try a broader query or clear the search input.</p>
        </div>
      ) : null}
    </section>
  );
}
