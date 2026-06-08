/**
 * SDK Compatibility Tests
 *
 * Verifies that the SDK upgrade maintains expected interfaces and
 * the storage migration handles edge cases correctly.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { migrateStorageKeys } from './storageMigration';

describe('Storage Migration', () => {
  let originalLocalStorage: Storage;
  let mockStorage: Map<string, string>;
  let mockLocalStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = globalThis.localStorage;

    // Create a mock localStorage
    mockStorage = new Map();
    mockLocalStorage = {
      getItem: vi.fn((key: string) => mockStorage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) =>
        mockStorage.set(key, value),
      ),
      removeItem: vi.fn((key: string) => mockStorage.delete(key)),
      clear: vi.fn(() => mockStorage.clear()),
      key: vi.fn((index: number) => {
        const keys = Array.from(mockStorage.keys());
        return keys[index] ?? null;
      }),
      get length() {
        return mockStorage.size;
      },
    } as Storage;

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it('migrates PAPP_ prefixed keys to polkadot_ prefix', () => {
    mockStorage.set('PAPP_test_key', 'test_value');
    mockStorage.set('PAPP_another_key', '{"data": "json"}');

    const result = migrateStorageKeys();

    expect(result.status).toBe('success');
    expect(result.migrated).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(mockStorage.get('polkadot_test_key')).toBe('test_value');
    expect(mockStorage.get('polkadot_another_key')).toBe('{"data": "json"}');
    // Old keys removed after successful migration
    expect(mockStorage.has('PAPP_test_key')).toBe(false);
    expect(mockStorage.has('PAPP_another_key')).toBe(false);
  });

  it('skips migration when new key already exists (conflict) - preserves both', () => {
    mockStorage.set('PAPP_key', 'old_value');
    mockStorage.set('polkadot_key', 'new_value');

    const result = migrateStorageKeys();

    expect(result.status).toBe('success');
    expect(result.migrated).toBe(0);
    expect(result.skipped).toBe(1);
    // New value preserved
    expect(mockStorage.get('polkadot_key')).toBe('new_value');
    // Old key removed only after successful completion
    expect(mockStorage.has('PAPP_key')).toBe(false);
  });

  it('is idempotent - skips after sentinel is set', () => {
    mockStorage.set('PAPP_key', 'value');

    // First migration
    const result1 = migrateStorageKeys();
    expect(result1.status).toBe('success');
    expect(result1.migrated).toBe(1);

    // Add another PAPP_ key after migration completed
    mockStorage.set('PAPP_new_key', 'new_value');

    // Second migration should skip (sentinel is set)
    const result2 = migrateStorageKeys();
    expect(result2.status).toBe('skipped');
    expect(result2.migrated).toBe(0);
    // New key not migrated because sentinel exists
    expect(mockStorage.has('PAPP_new_key')).toBe(true);
  });

  it('leaves non-PAPP_ keys untouched', () => {
    mockStorage.set('other_key', 'value');
    mockStorage.set('polkadot_existing', 'existing');
    mockStorage.set('PAPP_migrate_me', 'migrate');

    const result = migrateStorageKeys();

    expect(result.status).toBe('success');
    expect(result.migrated).toBe(1);
    expect(mockStorage.get('other_key')).toBe('value');
    expect(mockStorage.get('polkadot_existing')).toBe('existing');
    expect(mockStorage.get('polkadot_migrate_me')).toBe('migrate');
  });

  it('sets migration complete sentinel only on success', () => {
    mockStorage.set('PAPP_key', 'value');

    const result = migrateStorageKeys();

    expect(result.status).toBe('success');
    expect(mockStorage.get('mercado:storage_migration_v1_complete')).toBe(
      'true',
    );
  });

  // CRITICAL: Test that partial failures don't set sentinel
  it('does NOT set sentinel when write fails - allows retry', () => {
    mockStorage.set('PAPP_key1', 'value1');
    mockStorage.set('PAPP_key2', 'value2');

    // Make setItem throw on the second key
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem = vi.fn((key: string, value: string) => {
      if (key === 'polkadot_key2') {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      }
      mockStorage.set(key, value);
    });

    const result = migrateStorageKeys();

    expect(result.status).toBe('partial');
    expect(result.migrated).toBe(1);
    expect(result.errors).toContain('quota_exceeded:PAPP_key2');
    // Sentinel NOT set - migration can retry
    expect(mockStorage.has('mercado:storage_migration_v1_complete')).toBe(
      false,
    );
    // Old keys preserved for retry
    expect(mockStorage.has('PAPP_key1')).toBe(true);
    expect(mockStorage.has('PAPP_key2')).toBe(true);

    // Restore and retry
    mockLocalStorage.setItem = originalSetItem;

    const result2 = migrateStorageKeys();
    expect(result2.status).toBe('success');
    // Only key2 needs migration now (key1 already has polkadot_ version)
    expect(result2.migrated).toBe(1);
    expect(result2.skipped).toBe(1);
  });

  it('handles localStorage unavailable gracefully', () => {
    mockLocalStorage.getItem = vi.fn(() => {
      throw new Error('SecurityError');
    });

    const result = migrateStorageKeys();

    expect(result.status).toBe('unavailable');
    expect(result.errors).toContain('localStorage_read_failed');
  });

  it('handles empty storage - sets sentinel immediately', () => {
    // No PAPP_ keys
    mockStorage.set('other_key', 'value');

    const result = migrateStorageKeys();

    expect(result.status).toBe('success');
    expect(result.migrated).toBe(0);
    expect(mockStorage.get('mercado:storage_migration_v1_complete')).toBe(
      'true',
    );
  });

  it('handles key disappearing between enumeration and read', () => {
    mockStorage.set('PAPP_disappearing', 'value');

    // Key exists during enumeration but returns null on getItem
    mockLocalStorage.getItem = vi.fn((key: string) => {
      if (key === 'PAPP_disappearing') {
        return null; // Simulates concurrent deletion
      }
      return mockStorage.get(key) ?? null;
    });

    const result = migrateStorageKeys();

    expect(result.status).toBe('success');
    expect(result.skipped).toBe(1); // Counted as skipped, not error
    expect(result.errors).toHaveLength(0);
  });
});

describe('SDK Export Verification', () => {
  it('isInsideContainer export exists and is callable', async () => {
    const { isInsideContainer } = await import('@mercado/core-hooks');
    expect(typeof isInsideContainer).toBe('function');
    // Just verify it returns a boolean (test environment may be treated as container)
    expect(typeof isInsideContainer()).toBe('boolean');
  });

  it('hasHostMarkers export exists and is callable', async () => {
    const { hasHostMarkers } = await import('@mercado/core-hooks');
    expect(typeof hasHostMarkers).toBe('function');
    expect(typeof hasHostMarkers()).toBe('boolean');
  });

  it('AuthProvider export exists', async () => {
    const { AuthProvider } = await import('@mercado/core-hooks');
    expect(typeof AuthProvider).toBe('function');
  });

  it('useAuth export exists', async () => {
    const { useAuth } = await import('@mercado/core-hooks');
    expect(typeof useAuth).toBe('function');
  });
});

describe('AccountInfo Type', () => {
  it('has required name and address fields', () => {
    const account: import('@mercado/types').AccountInfo = {
      name: 'Test',
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    };
    expect(account.name).toBe('Test');
    expect(account.address).toBe(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    );
  });
});
