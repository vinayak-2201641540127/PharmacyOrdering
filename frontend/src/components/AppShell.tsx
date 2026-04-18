import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './AppShell.css';

export default function AppShell() {
  const { isAdmin, isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();

  const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <div className="app-frame">

      {/* ── Top bar ── */}
      <header className="topbar">
        <div className="shell-container topbar-inner">
          <div>
            <p className="eyebrow">HCL Pharma</p>
            <h1>Online Pharmacy Ordering</h1>
          </div>

          <div className="topbar-actions">
            {isAuthenticated && user ? (
              <div className="user-chip">
                <span>{user.fullName}</span>
                <span>{user.role}</span>
              </div>
            ) : (
              <span className="muted-label">Secure patient and admin workflows</span>
            )}
          </div>
        </div>
      </header>

      {/* ── Navigation strip ── */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="shell-container navbar-inner">
          <NavLink className={getNavLinkClassName} to="/products">
            Products
          </NavLink>

          <NavLink className={getNavLinkClassName} to="/upload">
            Prescription Upload
          </NavLink>

          <NavLink className={getNavLinkClassName} to="/orders">
            My Orders
          </NavLink>

          <NavLink className={getNavLinkClassName} to="/checkout">
            Checkout ({totalItems})
          </NavLink>

          {isAdmin ? (
            <NavLink className={getNavLinkClassName} to="/admin/prescriptions">
              Review Queue
            </NavLink>
          ) : null}

          <div className="nav-spacer" />

          {isAuthenticated ? (
            <button className="ghost-button" onClick={logout} type="button">
              Log out
            </button>
          ) : (
            <NavLink className={getNavLinkClassName} to="/login">
              Login
            </NavLink>
          )}
        </div>
      </nav>

      {/* ── Page content ── */}
      <main className="page-shell">
        <div className="shell-container">
          <Outlet />
        </div>
      </main>

    </div>
  );
}