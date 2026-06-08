import { Outlet, Link } from 'react-router';
import { Store, ExternalLink } from 'lucide-react';

import { useMatchMakerState } from '../app';

export function AppShell() {
  const { isConnected, isAuthLoading, address } = useMatchMakerState();
  const marketplaceUrl =
    import.meta.env.VITE_MARKETPLACE_URL || 'https://mercado.dot.li';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold"
          >
            <Store className="w-6 h-6" />
            <span>Mercado Matchmaker</span>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href={marketplaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1"
            >
              Marketplace
              <ExternalLink className="w-3 h-3" />
            </a>

            {isAuthLoading ? (
              <span className="text-sm text-text-secondary">Connecting...</span>
            ) : isConnected ? (
              <span className="text-sm text-text-secondary font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            ) : (
              <span className="text-sm text-text-secondary">Not connected</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
