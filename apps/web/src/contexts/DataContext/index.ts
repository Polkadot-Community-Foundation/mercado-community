/**
 * DataContext exports.
 *
 * Providers:
 * - MockDataProvider: Fully mocked, uses mock account hook
 * - WalletAwareMockProvider: Mock data with real wallet connection
 *
 * Test utilities are NOT exported here to avoid bundling vitest in prod.
 * Import directly from './mockHooks.test-utils' in test files.
 */

// Core context and types
export { DataProvider, useDataContext } from './DataContext';
export type { DataContextValue, UseAccountInfoResult } from './DataContext';

// Providers
export { MockDataProvider } from './MockDataProvider';
export { WalletAwareMockProvider } from './WalletAwareMockProvider';
export { RealDataProvider } from './RealDataProvider';

// Hook registries (for advanced use)
export { mockHooks, realHooks } from './hookRegistries';

// Mock data
export { DEFAULT_MOCK_DATA } from './mockData';
export type { MockDataTree } from './mockData';
