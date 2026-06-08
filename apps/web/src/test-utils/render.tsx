import { render } from 'vitest-browser-react';
import { MemoryRouter, Routes, Route } from 'react-router';

import {
  testHooks,
  resetSpies,
} from '../contexts/DataContext/mockHooks.test-utils';
import { MockDataProvider, type MockDataTree } from '../contexts/DataContext';
import { CartProvider } from '../contexts/CartContext';
import { AppShellContainer } from '../containers';

export function renderRoute(
  routes: { path: string; element: React.ReactElement }[],
  options?: {
    initialData?: Partial<MockDataTree>;
    initialEntries?: string[];
  },
) {
  resetSpies();
  return render(
    <MockDataProvider
      initialData={options?.initialData}
      enablePersistence={false}
      hookOverrides={testHooks}
    >
      <CartProvider>
        <MemoryRouter initialEntries={options?.initialEntries ?? ['/']}>
          <Routes>
            <Route element={<AppShellContainer />}>
              {routes.map((r) => (
                <Route key={r.path} path={r.path} element={r.element} />
              ))}
            </Route>
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </MockDataProvider>,
  );
}
