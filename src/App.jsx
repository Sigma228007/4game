import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { I18nProvider } from './utils/i18n.jsx';
import { FlyToProvider } from './components/FlyToTarget';
import CommandPalette from './components/CommandPalette';
import FAQWidget from './components/FAQWidget';
import Preloader from './components/Preloader';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Home — eager (landing page, нужен сразу)
import Home from './pages/Home';

// Остальные страницы — lazy (загружаются по требованию)
const Catalog          = lazy(() => import('./pages/Catalog'));
const GameDetail       = lazy(() => import('./pages/GameDetail'));
const Favorites        = lazy(() => import('./pages/Favorites'));
const Cart             = lazy(() => import('./pages/Cart'));
const Login            = lazy(() => import('./pages/Login'));
const ResetPassword    = lazy(() => import('./pages/ResetPassword'));
const Success          = lazy(() => import('./pages/Success'));
const About            = lazy(() => import('./pages/About'));
const Profile          = lazy(() => import('./pages/Profile'));
const Support          = lazy(() => import('./pages/Support'));
const TicketChat       = lazy(() => import('./pages/TicketChat'));
const OrderHistory     = lazy(() => import('./pages/OrderHistory'));
const Admin            = lazy(() => import('./pages/Admin'));
const Wishlist         = lazy(() => import('./pages/Wishlist'));
const Achievements     = lazy(() => import('./pages/Achievements'));
const Referral         = lazy(() => import('./pages/Referral'));
const TwoFactorSetup   = lazy(() => import('./pages/TwoFactorSetup'));
const NotFound         = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Preloader />
      <ThemeProvider>
        <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <ToastProvider>
                <FlyToProvider>
                <CommandPalette />
                <FAQWidget />
                <div className="grain min-h-screen flex flex-col">
                  <ScrollToTop />
                  <Header />
                  <main className="flex-1">
                    <Suspense fallback={<RouteFallback />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/game/:id" element={<GameDetail />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/success" element={<Success />} />
                        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                        <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                        <Route path="/support/:id" element={<ProtectedRoute><TicketChat /></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                        <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                        <Route path="/referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
                        <Route path="/2fa" element={<ProtectedRoute><TwoFactorSetup /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
                </FlyToProvider>
              </ToastProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
