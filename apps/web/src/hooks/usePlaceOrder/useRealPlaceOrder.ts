import { useCallback } from 'react';
import { toHex } from 'viem';
import { useAuth } from '@mercado/core-hooks';
import { Enum } from 'polkadot-api';

import { useContracts } from '../../contexts/ContractsContext';
import type { UsePlaceOrderResult } from '../../contexts/DataContext/DataContext';
import type { OrderItem } from '../../types';
import { saveOrderItems, saveOrderMetadata } from '../../lib/orderItemsStorage';
import { signAndSubmitWithTimeout } from '../../lib/contracts';
import { getNetworkConfig } from '../../config/network';
import { centsToPusdUnits } from '../../lib/format';

/**
 * Real implementation of order placement using MercadoCore contract.
 *
 * Order items are stored both on-chain (as encoded bytes in itemsData) and
 * client-side via Host API compliant storage for richer metadata access.
 *
 * Supports pUSD (ERC-20) token payments via Asset Hub.
 * Uses a two-step approval flow: (1) approve token transfer, (2) place order.
 */
export function useRealPlaceOrder(): UsePlaceOrderResult {
  const { core, typedApi, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const placeOrder = useCallback(
    async (
      restaurantId: string,
      items: OrderItem[],
      totalPrice: bigint,
      matchmakerId?: string,
    ): Promise<string> => {
      // === Preflight checks (fail fast before requesting signatures) ===
      if (!core || !typedApi || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }
      if (items.length === 0) {
        throw new Error('Order must contain at least one item');
      }
      if (totalPrice <= 0n) {
        throw new Error('Order total must be greater than zero');
      }

      // Get network config for pUSD token
      const config = getNetworkConfig();

      // Check if payment token is whitelisted before requesting approval
      const isAllowed = await core.read<boolean>('allowedAssets', [
        config.token.address,
      ]);
      if (!isAllowed) {
        throw new Error(
          `Payment token ${config.token.symbol} (${config.token.address}) is not whitelisted on the contract`,
        );
      }

      // Capture creation time before chain transaction
      const createdAt = Date.now();

      // Convert price from cents to pUSD units (respecting configured decimals)
      const priceInPusdUnits = centsToPusdUnits(totalPrice);

      // Encode order items as bytes for on-chain storage
      const itemsJson = JSON.stringify(
        items.map((item) => ({
          d: item.dishId,
          o: item.selectedOptionIds,
        })),
      );
      const itemsData = toHex(new TextEncoder().encode(itemsJson));

      // Step 1: Approve the contract to spend pUSD tokens
      // Note: If this succeeds but step 2 fails, the approval remains open.
      // This is acceptable as the approval amount is exact to this order.
      const approvalTx = typedApi.tx.Assets.approve_transfer({
        id: config.token.assetId,
        delegate: Enum('Address20', core.address),
        amount: priceInPusdUnits,
      });
      await signAndSubmitWithTimeout(approvalTx, signer);

      // Step 2: Place order with token payment
      const result = await core.write<bigint>(
        'placeOrderWithToken',
        [
          BigInt(restaurantId),
          itemsData,
          BigInt(matchmakerId ?? '0'),
          config.token.address,
          priceInPusdUnits,
        ],
        account.address,
        0n,
      );

      const tx = result.send();
      await signAndSubmitWithTimeout(tx, signer);

      const orderId = result.response.toString();

      // Persist order items and metadata client-side (best-effort)
      // The chain transaction succeeded, so we don't fail on storage errors
      try {
        await Promise.all([
          saveOrderItems(orderId, items),
          saveOrderMetadata(orderId, { createdAt, restaurantId }),
        ]);
      } catch (err) {
        console.warn('Failed to persist order items locally:', err);
      }

      return orderId;
    },
    [core, typedApi, isConnected, account, signer],
  );

  return { placeOrder };
}
