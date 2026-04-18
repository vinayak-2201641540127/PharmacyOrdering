import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AdminPrescriptionsPage from './pages/AdminPrescriptionsPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ProductsPage from './pages/ProductsPage';
import UploadPrescriptionPage from './pages/UploadPrescriptionPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<AppShell />}>
              <Route path="/" element={<Navigate replace to="/products" />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/upload" element={<ProtectedRoute><UploadPrescriptionPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:orderId" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
              <Route
                path="/admin/prescriptions"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPrescriptionsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate replace to="/products" />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
