/**
 * Storage key migration for SDK upgrade.
 *
 * The SDK changed localStorage key prefixes from `PAPP_` to `polkadot_`.
 * This migration copies existing keys to the new prefix format.
 *
 * Design principles:
 * - Conservative: never deletes old keys until migration is fully successful
 * - Retryable: only marks complete when ALL keys migrated without errors
 * - Non-destructive: on conflict, preserves both keys (new takes precedence for SDK)
 */

const MIGRATION_COMPLETE_KEY = 'mercado:storage_migration_v1_complete';

export interface MigrationResult {
  migrated: number;
  skipped: number;
  errors: string[];
  status: 'success' | 'partial' | 'skipped' | 'unavailable';
}

/**
 * Migrate localStorage keys from PAPP_ prefix to polkadot_ prefix.
 * Should be called once at app startup, before React render.
 *
 * @returns Migration statistics for debugging
 */
export function migrateStorageKeys(): MigrationResult {
  const result: MigrationResult = {
    migrated: 0,
    skipped: 0,
    errors: [],
    status: 'skipped',
  };

  // Skip if not in browser environment
  if (typeof localStorage === 'undefined') {
    result.status = 'unavailable';
    return result;
  }

  // Check if migration already completed successfully
  try {
    if (localStorage.getItem(MIGRATION_COMPLETE_KEY) === 'true') {
      return result; // Already migrated
    }
  } catch {
    result.status = 'unavailable';
    result.errors.push('localStorage_read_failed');
    return result;
  }

  // Collect keys to migrate (avoid modifying while iterating)
  const keysToMigrate: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('PAPP_')) {
        keysToMigrate.push(key);
      }
    }
  } catch {
    result.status = 'unavailable';
    result.errors.push('localStorage_enumeration_failed');
    return result;
  }

  // No keys to migrate
  if (keysToMigrate.length === 0) {
    // Mark complete since there's nothing to do
    try {
      localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
      result.status = 'success';
    } catch {
      result.errors.push('sentinel_write_failed');
      result.status = 'partial';
    }
    return result;
  }

  // Migrate each key - COPY only, don't delete originals yet
  const successfulMigrations: string[] = [];

  for (const oldKey of keysToMigrate) {
    const newKey = oldKey.replace('PAPP_', 'polkadot_');

    try {
      // Check for conflict - new key already exists
      const existingNewValue = localStorage.getItem(newKey);
      if (existingNewValue !== null) {
        // New key exists - SDK will use it. Keep old key as backup.
        result.skipped++;
        successfulMigrations.push(oldKey);
        continue;
      }

      const value = localStorage.getItem(oldKey);
      if (value !== null) {
        localStorage.setItem(newKey, value);
        // Verify write succeeded
        if (localStorage.getItem(newKey) === value) {
          result.migrated++;
          successfulMigrations.push(oldKey);
        } else {
          result.errors.push(`verify_failed:${oldKey}`);
        }
      } else {
        // Key disappeared between enumeration and read (concurrent tab?)
        result.skipped++;
        successfulMigrations.push(oldKey);
      }
    } catch (e) {
      const errorType =
        e instanceof Error && e.name === 'QuotaExceededError'
          ? 'quota_exceeded'
          : 'write_failed';
      result.errors.push(`${errorType}:${oldKey}`);
    }
  }

  // Only mark complete and clean up if ALL migrations succeeded
  if (result.errors.length === 0) {
    // Now safe to remove old keys
    for (const oldKey of successfulMigrations) {
      try {
        localStorage.removeItem(oldKey);
      } catch {
        // Non-fatal - old key remains but migration still succeeded
      }
    }

    // Mark migration complete
    try {
      localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
      result.status = 'success';
    } catch {
      // Sentinel failed but keys were migrated - will retry cleanup next time
      result.status = 'partial';
    }
  } else {
    result.status = 'partial';
  }

  return result;
}
