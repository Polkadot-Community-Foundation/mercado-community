import { Outlet, Link } from 'react-router';

import { CartBadge } from '../CartBadge';
import { MyOrdersBadge } from '../MyOrdersBadge';

type AppShellProps = {
  isLanding: boolean;
  cartItemCount: number;
  isCustomer: boolean;
  isAuthenticated: boolean;
  activeOrderCount: number;
};

export function AppShell({
  cartItemCount,
  isCustomer,
  isAuthenticated,
  activeOrderCount,
}: AppShellProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-light-secondary via-white to-brand-faded">
      <div className="bg-dots pointer-events-none fixed inset-0 z-0 opacity-50" />
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-light-border bg-white/80 px-6 py-4 backdrop-blur-md">
        <span className="w-8" />
        <Link
          to="/"
          className="text-xl font-bold text-gradient-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:rounded"
        >
          Mercado
        </Link>
        {isAuthenticated && (
          <>
            <span className="flex">
              {isCustomer ? (
                <Link
                  to="/register-restaurant"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-all duration-150 hover:bg-brand-faded hover:text-text-primary"
                >
                  Join as a restaurant
                </Link>
              ) : (
                <Link
                  to="/restaurant-portal"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary transition-all duration-150 hover:bg-brand-faded hover:text-text-primary"
                >
                  Restaurant portal
                </Link>
              )}
            </span>
            <div className="ml-auto flex items-center gap-3">
              <MyOrdersBadge activeCount={activeOrderCount} />
              <CartBadge count={cartItemCount} />
            </div>
          </>
        )}
      </header>
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
