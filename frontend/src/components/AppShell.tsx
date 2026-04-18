import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import type { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { isAdmin, isAuthenticated, logout, user } = useAuth();
  const { totalItems } = useCart();
  const getNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <div className="app-frame">
      <header className="topbar">
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
      </header>

      <nav className="navbar">
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
      </nav>

      <main className="page-shell">{children}</main>
    </div>
  );
}
