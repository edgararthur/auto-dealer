import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext-bypass';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { BrowsingHistoryProvider } from './contexts/BrowsingHistoryContext';
import { MaintenanceRemindersProvider } from './contexts/MaintenanceRemindersContext';
import { ToastProvider } from './contexts/ToastContext';
import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from './components/common';

// Components - Keep critical components as direct imports for faster initial load
import StoreHeader from './components/navigation/StoreHeader';
import StoreFooter from './components/navigation/StoreFooter';
import LandingHeader from './components/navigation/LandingHeader';
import LandingFooter from './components/navigation/LandingFooter';
import LoadingScreen from './components/common/LoadingScreen';
import RecentlyViewed from './components/common/RecentlyViewed';

// Layouts
import AuthLayout from './components/layouts/AuthLayout';

// PERFORMANCE OPTIMIZATION: Lazy load pages for code splitting
// Auth pages - Keep login as direct import for faster auth flow
import Login from './pages/auth/Login';
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Buyer Pages - Lazy load all buyer pages
const BuyerHome = lazy(() => import('./pages/buyer/BuyerHome'));
const ShopPage = lazy(() => import('./pages/buyer/ShopPage'));
const ProductListing = lazy(() => import('./pages/buyer/ProductListing'));
const ProductDetail = lazy(() => import('./pages/buyer/ProductDetail'));
const ProductComparison = lazy(() => import('./pages/buyer/ProductComparison'));
const ShoppingCart = lazy(() => import('./pages/buyer/ShoppingCart'));
const Checkout = lazy(() => import('./pages/buyer/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/buyer/OrderConfirmation'));
const OrderHistory = lazy(() => import('./pages/buyer/OrderHistory'));
const OrderDetail = lazy(() => import('./pages/buyer/OrderDetail'));
const OrderTracking = lazy(() => import('./pages/buyer/OrderTracking'));
const BuyerAccount = lazy(() => import('./pages/buyer/BuyerAccount'));
const Wishlist = lazy(() => import('./pages/buyer/Wishlist'));
const SubmitWarrantyClaim = lazy(() => import('./pages/buyer/SubmitWarrantyClaim'));
const TodaysDeals = lazy(() => import('./pages/buyer/TodaysDeals'));
const BestSellers = lazy(() => import('./pages/buyer/BestSellers'));
const NewArrivals = lazy(() => import('./pages/buyer/NewArrivals'));
const Brands = lazy(() => import('./pages/buyer/Brands'));
const Categories = lazy(() => import('./pages/buyer/Categories'));
const CategoryPage = lazy(() => import('./pages/buyer/CategoryPage'));
const SubcategoryPage = lazy(() => import('./pages/buyer/SubcategoryPage'));
const BrowsingHistory = lazy(() => import('./pages/buyer/BrowsingHistory'));
const SearchPage = lazy(() => import('./pages/buyer/SearchPage'));
const HelpCenter = lazy(() => import('./pages/buyer/HelpCenter'));
const ReviewsPage = lazy(() => import('./pages/buyer/ReviewsPage'));
const ReturnsPage = lazy(() => import('./pages/buyer/ReturnsPage'));
const NotificationsPage = lazy(() => import('./pages/buyer/NotificationsPage'));
const SavedSearches = lazy(() => import('./pages/buyer/SavedSearches'));
const PriceAlerts = lazy(() => import('./pages/buyer/PriceAlerts'));
const DealerProfile = lazy(() => import('./pages/buyer/DealerProfile'));
const DealersPage = lazy(() => import('./pages/buyer/DealersPage'));

// Landing Page
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));

// Garage & Maintenance - Lazy load these less frequently used features
const VirtualGarage = lazy(() => import('./components/garage/VirtualGarage'));
const AddVehicle = lazy(() => import('./pages/garage/AddVehicle'));
const EditVehicle = lazy(() => import('./pages/garage/EditVehicle'));
const MaintenanceDashboard = lazy(() => import('./pages/maintenance/MaintenanceDashboard'));
const AddMaintenanceReminder = lazy(() => import('./pages/maintenance/AddMaintenanceReminder'));

// Development tools
const PerformanceDashboard = lazy(() => import('./components/dev/PerformanceDashboard'));

// Import performance monitor
import performanceMonitor from './utils/performanceMonitor';

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
      <div className="text-neutral-600 font-medium">Loading...</div>
    </div>
  </div>
);

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
  const { user, loading, error } = useAuth();
  const isAuthenticated = !!user;
  
  console.log('ProtectedRoute:', { loading, isAuthenticated, hasError: !!error, errorMsg: error });
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <LoadingScreen 
        message="Checking authentication..."
        subMessage="This may take a few moments"
        showRetry={false}
      />
    );
  }
  
  // Show error if authentication failed
  if (error) {
    return (
      <LoadingScreen 
        message="Authentication Error"
        subMessage={error}
        showRetry={true}
        onRetry={() => window.location.reload()}
      />
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    const currentPath = window.location.pathname + window.location.search;
    return <Navigate to={`/auth/login?returnTo=${encodeURIComponent(currentPath)}`} />;
  }
  
  // Render children if authenticated
  console.log("ProtectedRoute: Authentication successful, rendering content");
  return children;
};

// Main application component
const App = () => {
  // Initialize performance tracking
  React.useEffect(() => {
    // Track app initialization
    const startTime = performance.now();
    
    const cleanup = () => {
      const endTime = performance.now();
      if (performanceMonitor && typeof performanceMonitor.trackNavigation === 'function') {
        performanceMonitor.trackNavigation('app_init', 'ready', endTime - startTime);
      }
    };
    
    // Track when app is ready
    setTimeout(cleanup, 100);
    
    return () => {
      // Cleanup old metrics on unmount
      if (performanceMonitor && typeof performanceMonitor.clearOldMetrics === 'function') {
        performanceMonitor.clearOldMetrics();
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <ComparisonProvider>
                  <ThemeProvider>
                    <BrowsingHistoryProvider>
                      <MaintenanceRemindersProvider>
                        <Suspense fallback={<PageLoader />}>
                          {/* Performance Dashboard - Only in development */}
                          {process.env.NODE_ENV === 'development' && (
                            <Suspense fallback={null}>
                              <PerformanceDashboard />
                            </Suspense>
                          )}
                          
                          <Routes>
                            {/* Auth routes */}
                            <Route path="/auth/login" element={
                              <AuthLayout>
                                <Login />
                              </AuthLayout>
                            } />
                            <Route path="/auth/register" element={
                              <AuthLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <Register />
                                </Suspense>
                              </AuthLayout>
                            } />
                            <Route path="/auth/forgot-password" element={
                              <AuthLayout>
                                <Suspense fallback={<PageLoader />}>
                                  <ForgotPassword />
                                </Suspense>
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
                              path="/shop"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <ShopPage />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />

                            {/* Product listing with filters */}
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

                            {/* Shop route with modal support */}
                            <Route
                              path="/shop/:productId"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <ProductListing />
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
                            
                            {/* Categories page */}
                            <Route
                              path="/categories"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <Categories />
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
                            
                            {/* Search page */}
                            <Route
                              path="/search"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <SearchPage />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            {/* Help Center */}
                            <Route
                              path="/help"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <HelpCenter />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            {/* Reviews & Returns */}
                            <Route
                              path="/reviews"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <ReviewsPage />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            <Route
                              path="/returns"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <ReturnsPage />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            {/* Notifications */}
                            <Route
                              path="/notifications"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <NotificationsPage />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            {/* Saved Searches & Price Alerts */}
                            <Route
                              path="/saved-searches"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <SavedSearches />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            <Route
                              path="/price-alerts"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <PriceAlerts />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            {/* Dealers */}
                            <Route
                              path="/dealers"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <DealersPage />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            <Route
                              path="/dealer/:dealerId"
                              element={
                                <ProtectedRoute>
                                  <StoreLayout>
                                    <DealerProfile />
                                  </StoreLayout>
                                </ProtectedRoute>
                              }
                            />
                            
                            {/* Redirect all unmatched routes to home */}
                            <Route path="*" element={<Navigate to="/" />} />
                          </Routes>
                        </Suspense>
                        <Analytics />

                        {/* Performance Dashboard - Development Only */}
                        {import.meta.env.DEV && (
                          <Suspense fallback={null}>
                            <PerformanceDashboard />
                          </Suspense>
                        )}
                      </MaintenanceRemindersProvider>
                    </BrowsingHistoryProvider>
                  </ThemeProvider>
                </ComparisonProvider>
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 