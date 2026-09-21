import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { CatalogProvider } from './context/CatalogContext';
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute';

// Customer pages
import HomePage from './pages/customer/HomePage';
import CategoryPage from './pages/customer/CategoryPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import SearchPage from './pages/customer/SearchPage';
import CartCheckoutPage from './pages/customer/CartCheckoutPage';
import QuizPage from './pages/customer/QuizPage';
import ForYouPage from './pages/customer/ForYouPage';
import { LoginPage, RegisterPage, ForgotPasswordPage, AccountPage, WishlistPage, OrdersPage } from './pages/customer/AccountPages';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminInventory from './pages/admin/AdminInventory';
import {
  AdminSuppliers, AdminPurchases, AdminCustomers, AdminSales,
  AdminInsights, AdminRecommendations, AdminReports, AdminUsers, AdminSettings, AdminLogin
} from './pages/admin/AdminPages';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <CatalogProvider>
          <BrowserRouter>
          <Routes>
            {/* Public customer routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<RequireAuth><CartCheckoutPage /></RequireAuth>} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/for-you" element={<ForYouPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected customer routes */}
            <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
            <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/products" element={<RequireAdmin><AdminProducts /></RequireAdmin>} />
            <Route path="/admin/inventory" element={<RequireAdmin><AdminInventory /></RequireAdmin>} />
            <Route path="/admin/suppliers" element={<RequireAdmin><AdminSuppliers /></RequireAdmin>} />
            <Route path="/admin/purchases" element={<RequireAdmin><AdminPurchases /></RequireAdmin>} />
            <Route path="/admin/customers" element={<RequireAdmin><AdminCustomers /></RequireAdmin>} />
            <Route path="/admin/sales" element={<RequireAdmin><AdminSales /></RequireAdmin>} />
            <Route path="/admin/insights" element={<RequireAdmin><AdminInsights /></RequireAdmin>} />
            <Route path="/admin/recommendations" element={<RequireAdmin><AdminRecommendations /></RequireAdmin>} />
            <Route path="/admin/reports" element={<RequireAdmin><AdminReports /></RequireAdmin>} />
            <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
            <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
          </Routes>
          </BrowserRouter>
        </CatalogProvider>
      </AppProvider>
    </AuthProvider>
  );
}
