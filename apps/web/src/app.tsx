import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// HashRouter is required for IPFS/static hosting (dot.li) since there's no server
// to handle SPA routing. URLs will be like /#/register-restaurant instead of /register-restaurant.
import { HashRouter, Routes, Route, Outlet } from 'react-router';
import type { ReactNode } from 'react';
import { AuthProvider } from '@mercado/core-hooks';

import { ContractsProvider } from './contexts/ContractsContext';
import {
  WalletAwareMockProvider,
  RealDataProvider,
} from './contexts/DataContext';
import { CartProvider } from './contexts/CartContext';
import { AppShellContainer, RouteErrorBoundary } from './containers';
import { ErrorBoundary, ErrorFallback } from './components/ErrorBoundary';
import {
  LandingPage,
  RestaurantsPage,
  RestaurantPage,
  CheckoutPage,
  OrderStatusPage,
  RegisterRestaurantPage,
  RestaurantPortalPage,
  MyOrdersPage,
  DisputeDetailPage,
  MenuEditorPage,
} from './pages';

const queryClient = new QueryClient();

// Use real contracts when VITE_USE_REAL_CONTRACTS is set
const USE_REAL_CONTRACTS = import.meta.env.VITE_USE_REAL_CONTRACTS === 'true';

/**
 * Data provider wrapper that switches between mock and real modes.
 * - Mock mode: All data is mocked, no contract calls
 * - Real mode: Contract interactions (disputes, ratings) are real,
 *              restaurant/order data still mocked (not on-chain yet)
 */
function DataProviderWrapper({ children }: { children: ReactNode }) {
  if (USE_REAL_CONTRACTS) {
    return (
      <ContractsProvider>
        <RealDataProvider>{children}</RealDataProvider>
      </ContractsProvider>
    );
  }
  return <WalletAwareMockProvider>{children}</WalletAwareMockProvider>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={(error, reset) => (
          <ErrorFallback error={error} onReset={reset} level="app" />
        )}
      >
        <AuthProvider>
          <DataProviderWrapper>
            <CartProvider>
              <HashRouter>
                <Routes>
                  <Route element={<AppShellContainer />}>
                    <Route
                      element={
                        <RouteErrorBoundary>
                          <Outlet />
                        </RouteErrorBoundary>
                      }
                    >
                      <Route path="/" element={<LandingPage />} />
                      <Route
                        path="/restaurants"
                        element={<RestaurantsPage />}
                      />
                      <Route
                        path="/restaurants/:id"
                        element={<RestaurantPage />}
                      />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route
                        path="/orders/:orderId"
                        element={<OrderStatusPage />}
                      />
                      <Route
                        path="/register-restaurant"
                        element={<RegisterRestaurantPage />}
                      />
                      <Route
                        path="/restaurant-portal"
                        element={<RestaurantPortalPage />}
                      />
                      <Route
                        path="/restaurant-portal/menu"
                        element={<MenuEditorPage />}
                      />
                      <Route path="/my-orders" element={<MyOrdersPage />} />
                      <Route
                        path="/disputes/:disputeId"
                        element={<DisputeDetailPage />}
                      />
                    </Route>
                  </Route>
                </Routes>
              </HashRouter>
            </CartProvider>
          </DataProviderWrapper>
        </AuthProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
