import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app';
import { migrateStorageKeys } from './lib/storageMigration';
import './app.css';

// Run storage migration before React render (SDK key prefix change)
// Non-fatal: app renders even if migration fails
try {
  const migration = migrateStorageKeys();
  if (migration.errors.length > 0) {
    console.warn('[StorageMigration] Partial failure:', migration);
  }
} catch (e) {
  console.error('[StorageMigration] Unexpected error:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
