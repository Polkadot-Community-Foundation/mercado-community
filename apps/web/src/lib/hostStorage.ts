/**
 * Host API compliant storage adapter.
 *
 * When running inside a proper Host container (Polkadot Triangle), uses hostLocalStorage
 * from product-sdk. Otherwise, falls back to browser localStorage.
 *
 * Requires both container detection AND valid SDK environment to use host storage.
 * This prevents test iframes from incorrectly using host storage.
 *
 * All operations are async to support the Host API's message-passing interface.
 */
import type { hostLocalStorage as HostLocalStorage } from '@novasamatech/host-api-wrapper';
import { isInsideContainer } from '@mercado/core-hooks';

type HostStorage = typeof HostLocalStorage;

// Cached check for valid host environment
let _isValidHostEnv: boolean | null = null;

async function isValidHostEnvironment(): Promise<boolean> {
  if (_isValidHostEnv !== null) return _isValidHostEnv;

  if (!isInsideContainer()) {
    _isValidHostEnv = false;
    return false;
  }

  try {
    const { sandboxProvider } = await import('@novasamatech/host-api-wrapper');
    _isValidHostEnv = sandboxProvider.isCorrectEnvironment();
  } catch {
    _isValidHostEnv = false;
  }

  return _isValidHostEnv;
}

// Lazy-loaded host storage instance
let _hostStoragePromise: Promise<HostStorage> | undefined;

function getHostStorage(): Promise<HostStorage> {
  if (!_hostStoragePromise) {
    _hostStoragePromise = import('@novasamatech/host-api-wrapper').then(
      (m) => m.hostLocalStorage,
    );
  }
  return _hostStoragePromise;
}

// BigInt-aware serialization (matches existing storage.ts behavior)
function serialize(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    typeof v === 'bigint' ? { __bigint: v.toString() } : v,
  );
}

function deserialize<T>(json: string): T {
  return JSON.parse(json, (_key, v) =>
    v !== null && typeof v === 'object' && '__bigint' in v
      ? BigInt(v.__bigint)
      : v,
  ) as T;
}

/**
 * Loads data from storage (async).
 * Uses Host API storage when in valid host environment, browser localStorage otherwise.
 */
export async function loadFromStorageAsync<T>(
  key: string,
  fallback: T,
): Promise<T> {
  if (await isValidHostEnvironment()) {
    try {
      const storage = await getHostStorage();
      const json = await storage.readString(key);
      if (!json) return fallback;
      return deserialize<T>(json);
    } catch {
      return fallback;
    }
  }

  // Browser localStorage fallback
  try {
    const json = localStorage.getItem(key);
    if (json === null) return fallback;
    return deserialize<T>(json);
  } catch {
    return fallback;
  }
}

/**
 * Saves data to storage (async).
 * Uses Host API storage when in valid host environment, browser localStorage otherwise.
 * Throws on failure so callers can handle persistence errors.
 */
export async function saveToStorageAsync(
  key: string,
  value: unknown,
): Promise<void> {
  const json = serialize(value);

  if (await isValidHostEnvironment()) {
    const storage = await getHostStorage();
    await storage.writeString(key, json);
    return;
  }

  // Browser localStorage fallback - can throw if storage is full
  try {
    localStorage.setItem(key, json);
  } catch (err) {
    console.error('[Storage] localStorage.setItem failed:', err);
    throw err;
  }
}

/**
 * Clears a key from storage (async).
 */
export async function clearStorageAsync(key: string): Promise<void> {
  if (await isValidHostEnvironment()) {
    const storage = await getHostStorage();
    await storage.clear(key);
    return;
  }

  localStorage.removeItem(key);
}
