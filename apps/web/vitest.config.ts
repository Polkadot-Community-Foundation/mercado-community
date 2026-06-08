// eslint-disable-next-line import/no-unresolved
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  optimizeDeps: {
    include: [
      'react/jsx-dev-runtime',
      'react-dom/client',
      '@tanstack/react-query',
    ],
  },
  test: {
    passWithNoTests: true,
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
});
