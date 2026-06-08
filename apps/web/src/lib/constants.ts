/**
 * Shared constants for contract scanning and time calculations.
 */

/** Maximum number of orders to scan when listing */
export const ORDER_SCAN_LIMIT = 100;

/** Maximum number of disputes to scan when listing */
export const DISPUTE_SCAN_LIMIT = 50;

/** Maximum number of restaurants to scan when listing */
export const RESTAURANT_SCAN_LIMIT = 50;

/** Response window for dispute counter-evidence (24 hours in ms) */
export const DISPUTE_RESPONSE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** Fallback time offset for estimating createdAt from completedAt (1 hour in ms) */
export const CREATED_AT_FALLBACK_OFFSET_MS = 3600000;

/** Default restaurant name when lookup fails */
export const DEFAULT_RESTAURANT_NAME = 'Restaurant';

/** Zero address for checking non-existent entities */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
