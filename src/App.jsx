import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowsingHistoryProvider } from './contexts/BrowsingHistoryContext';
import { MaintenanceRemindersProvider } from './contexts/MaintenanceRemindersContext';
import { Analytics } from '@vercel/analytics/react';

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
import ProductComparison from './pages/buyer/ProductComparison';
import ShoppingCart from './pages/buyer/ShoppingCart';
import Checkout from './pages/buyer/Checkout';
import OrderConfirmation from './pages/buyer/OrderConfirmation';
import OrderHistory from './pages/buyer/OrderHistory';
import OrderDetail from './pages/buyer/OrderDetail';
import OrderTracking from './pages/buyer/OrderTracking';
import BuyerAccount from './pages/buyer/BuyerAccount';
import Wishlist from './pages/buyer/Wishlist';
import SubmitWarrantyClaim from './pages/buyer/SubmitWarrantyClaim';
import TodaysDeals from './pages/buyer/TodaysDeals';
import BestSellers from './pages/buyer/BestSellers';
import NewArrivals from './pages/buyer/NewArrivals';
import Brands from './pages/buyer/Brands';
import CategoryPage from './pages/buyer/CategoryPage';
import SubcategoryPage from './pages/buyer/SubcategoryPage';
import BrowsingHistory from './pages/buyer/BrowsingHistory';

// Landing Page
import LandingPage from './pages/landing/LandingPage';

// Garage & Maintenance
import VirtualGarage from './components/garage/VirtualGarage';
import AddVehicle from './pages/garage/AddVehicle';
import EditVehicle from './pages/garage/EditVehicle';
import MaintenanceDashboard from './pages/maintenance/MaintenanceDashboard';
import AddMaintenanceReminder from './pages/maintenance/AddMaintenanceReminder';

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
  const { isAuthenticated, loading, error } = useAuth();
  
  console.log('Buyer ProtectedRoute:', { loading, isAuthenticated, hasError: !!error, errorMsg: error });
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-neutral-600 font-medium">Loading authentication...</div>
        </div>
        <div className="text-xs text-gray-500 mt-2">This may take a few moments</div>
      </div>
    );
  }
  
  // Show error if authentication failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-error-600 mb-4 text-xl">Authentication Error</div>
        <div className="text-neutral-600 max-w-md text-center mb-6">{error}</div>
        <div className="flex space-x-4">
          <button 
            className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
          <button 
            className="px-4 py-2 bg-primary-600 text-white rounded"
            onClick={() => window.location.href = '/auth/login'}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("Buyer ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/auth/login" />;
  }
  
  // Render children if authenticated
  console.log("Buyer ProtectedRoute: Authentication successful, rendering content");
  return children;
};

// Main application component
const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ComparisonProvider>
            <ThemeProvider>
              <BrowsingHistoryProvider>
                <MaintenanceRemindersProvider>
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
                      
                      {/* New routes for the feature pages */}
                      <Route
                        path="/deals"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <TodaysDeals />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/best-sellers"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <BestSellers />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/new-arrivals"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <NewArrivals />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/brands"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <Brands />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Category and Subcategory Routes */}
                      <Route
                        path="/category/:categorySlug"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <CategoryPage />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/category/:categorySlug/:subcategorySlug"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <SubcategoryPage />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/comparison"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <ProductComparison />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Browsing History */}
                      <Route
                        path="/browsing-history"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <BrowsingHistory />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Garage & Vehicle Management */}
                      <Route
                        path="/garage"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <VirtualGarage />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/garage/add"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <AddVehicle />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/garage/edit/:vehicleId"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <EditVehicle />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Maintenance */}
                      <Route
                        path="/maintenance"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <MaintenanceDashboard />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      <Route
                        path="/maintenance/new"
                        element={
                          <ProtectedRoute>
                            <StoreLayout>
                              <AddMaintenanceReminder />
                            </StoreLayout>
                          </ProtectedRoute>
                        }
                      />
                      
                      {/* Redirect all unmatched routes to home */}
                      <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    <Analytics />
                  </Router>
                </MaintenanceRemindersProvider>
              </BrowsingHistoryProvider>
            </ThemeProvider>
          </ComparisonProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App; 