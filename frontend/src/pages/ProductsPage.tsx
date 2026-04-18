import { useDeferredValue, useState, useEffect } from 'react';
import { fetchProducts } from '../api/productsApi';
import type { Product } from '../types/api';
import ProductCard from '../components/ProductCard';
import { getErrorMessage } from '../lib/errors';
import './ProductsPage.css';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load products.'));
      }
    };
    void loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
    product.description.toLowerCase().includes(deferredSearch.toLowerCase())
  );

  return (
    <div className="products-root">
      
      {/* ── Hero / Search Container ── */}
      <section className="catalogue-hero">
        <div className="hero-header">
          <p className="hero-eyebrow">Medical Catalog</p>
          <h2 className="hero-title">Find your medications</h2>
          <p className="hero-subtitle">
            Search our comprehensive inventory. Regulated medications will automatically be routed through our secure prescription verification gateway.
          </p>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            className="search-input"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, category, or symptoms..."
            type="search"
            value={search}
            spellCheck={false}
          />
        </div>
      </section>

      {/* ── Error Banner ── */}
      {error && (
        <div className="form-error" style={{ marginBottom: '2rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{error}</span>
        </div>
      )}

      {/* ── Product Grid ── */}
      <section className="product-grid" aria-label="Product listings">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {/* ── Empty State ── */}
      {!error && filteredProducts.length === 0 && products.length > 0 ? (
        <div className="empty-state">
          <h3>No medications matched your search.</h3>
          <p>Please double-check your spelling or try a more generic term.</p>
        </div>
      ) : null}

    </div>
  );
}
