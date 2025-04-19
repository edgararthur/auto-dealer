import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import StoreHeader from './components/navigation/StoreHeader';
import StoreFooter from './components/navigation/StoreFooter';
import LandingHeader from './components/navigation/LandingHeader';
import LandingFooter from './components/navigation/LandingFooter';
import LoadingScreen from './components/common/LoadingScreen';

// Layouts
import AuthLayout from './components/layouts/AuthLayout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Buyer Pages
import BuyerHome from './pages/buyer/BuyerHome';
import ProductListing from './pages/buyer/ProductListing';
import ProductDetail from './pages/buyer/ProductDetail';
import ShoppingCart from './pages/buyer/ShoppingCart';
import Checkout from './pages/buyer/Checkout';
import OrderConfirmation from './pages/buyer/OrderConfirmation';
import OrderHistory from './pages/buyer/OrderHistory';
import OrderDetail from './pages/buyer/OrderDetail';
import OrderTracking from './pages/buyer/OrderTracking';
import BuyerAccount from './pages/buyer/BuyerAccount';
import Wishlist from './pages/buyer/Wishlist';
import SubmitWarrantyClaim from './pages/buyer/SubmitWarrantyClaim';

// Landing Page
import LandingPage from './pages/landing/LandingPage';

// Layouts
const StoreLayout = ({ children }) => (
  <>
    <StoreHeader />
    <main>
      {children}
    </main>
    <StoreFooter />
  </>
);

const LandingLayout = ({ children }) => (
  <>
    <LandingHeader />
    <main>
      {children}
    </main>
    <LandingFooter />
  </>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  // Render children if authenticated
  return children;
};

// Main application component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/login" element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          } />
          <Route path="/auth/register" element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          } />
          <Route path="/auth/forgot-password" element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          } />
          
          {/* Protected routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <BuyerHome />
                </StoreLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Add other buyer routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <ProductListing />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/products/:productId"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <ProductDetail />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <ShoppingCart />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <Checkout />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <OrderConfirmation />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <OrderHistory />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <OrderDetail />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/track/:orderId"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <OrderTracking />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/warranty-claim/:orderId/:productId"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <SubmitWarrantyClaim />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <BuyerAccount />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <StoreLayout>
                  <Wishlist />
                </StoreLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Redirect all unmatched routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 