import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { FlyToProvider } from './components/FlyToTarget';
import CommandPalette from './components/CommandPalette';
import Preloader from './components/Preloader';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import GameDetail from './pages/GameDetail';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Success from './pages/Success';
import About from './pages/About';
import Profile from './pages/Profile';
import Support from './pages/Support';
import TicketChat from './pages/TicketChat';
import OrderHistory from './pages/OrderHistory';
import Admin from './pages/Admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Preloader />
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <ToastProvider>
                <FlyToProvider>
                <CommandPalette />
                <div className="grain min-h-screen flex flex-col">
                  <ScrollToTop />
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/game/:id" element={<GameDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/success" element={<Success />} />
                      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                      <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                      <Route path="/support/:id" element={<ProtectedRoute><TicketChat /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                      <Route path="*" element={
                        <div className="min-h-[65vh] flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <h1 className="font-display text-[120px] font-black leading-none" style={{ color: 'var(--text-faint)' }}>404</h1>
                            <p className="font-display text-xl -mt-10" style={{ color: 'var(--text-muted)' }}>Страница не найдена</p>
                            <a href="/" className="btn-primary inline-flex mt-4">На главную</a>
                          </div>
                        </div>
                      } />
                    </Routes>
                  </main>
                  <Footer />
                </div>
                </FlyToProvider>
              </ToastProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
