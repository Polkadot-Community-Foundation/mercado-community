import { useCallback } from 'react';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type {
  UseRegisterRestaurantResult,
  RegisterRestaurantInput,
} from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout } from '../../lib/contracts';

/**
 * Real implementation of restaurant registration using MercadoCore contract.
 */
export function useRealRegisterRestaurant(): UseRegisterRestaurantResult {
  const { core, restaurantMeta, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const register = useCallback(
    async (input: RegisterRestaurantInput): Promise<string> => {
      if (!core || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }

      // 1. Create restaurant in MercadoCore
      // The contract accepts metadataCID directly, but we use RestaurantMeta for extended metadata
      console.log(
        '[RegisterRestaurant] Starting registration for:',
        input.name,
      );

      // Verify contract is reachable first and check existing registration
      try {
        const version = await core.read<string>('VERSION');
        console.log('[RegisterRestaurant] Contract VERSION:', version);

        // Check if this address already has a restaurant
        // Import toEvmAddress to convert SS58 to EVM address for the query
        const { toEvmAddress } =
          await import('../../lib/contracts/evmContract');
        const evmAddr = toEvmAddress(account.address);
        console.log(
          '[RegisterRestaurant] Checking ownerToRestaurant for:',
          evmAddr,
        );
        const existingId = await core.read<bigint>('ownerToRestaurant', [
          evmAddr,
        ]);
        console.log(
          '[RegisterRestaurant] Existing restaurant ID:',
          existingId?.toString() ?? '0',
        );
      } catch (err) {
        console.error('[RegisterRestaurant] Contract check failed:', err);
        throw new Error('Contract not reachable - check contract address');
      }

      const result = await core.write<bigint>(
        'registerRestaurant',
        [input.name, input.location, ''],
        account.address,
      );
      console.log(
        '[RegisterRestaurant] Dry-run response (expected ID):',
        result.response,
      );

      const tx = result.send();
      console.log('[RegisterRestaurant] Signing and submitting transaction...');
      await signAndSubmitWithTimeout(tx, signer);
      console.log('[RegisterRestaurant] Transaction finalized!');

      const restaurantId = result.response.toString();
      console.log('[RegisterRestaurant] Restaurant ID:', restaurantId);

      // 2. Optionally set metadata if description, avatar, or category provided
      if (
        restaurantMeta &&
        (input.description || input.avatarUrl || input.category)
      ) {
        try {
          const metaResult = await restaurantMeta.write(
            'setMetadata',
            [
              input.description || '',
              input.avatarUrl || '',
              '',
              input.category || '',
            ],
            account.address,
          );
          const metaTx = metaResult.send();
          await signAndSubmitWithTimeout(metaTx, signer);
        } catch (err) {
          console.warn('Failed to set restaurant metadata:', err);
          // Don't fail the whole registration if metadata fails
        }
      }

      return restaurantId;
    },
    [core, restaurantMeta, isConnected, account, signer],
  );

  return { register };
}
