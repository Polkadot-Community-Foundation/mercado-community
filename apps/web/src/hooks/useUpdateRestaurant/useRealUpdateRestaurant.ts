import { useCallback } from 'react';
import { uploadToBulletin } from '@mercado/bulletin';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type {
  UseUpdateRestaurantResult,
  UpdateRestaurantInput,
} from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout, toEvmAddress } from '../../lib/contracts';
import { BULLETIN_ENDPOINT, cidToDisplayUrl } from '../../lib/bulletinConfig';

/**
 * Real implementation of restaurant profile update.
 *
 * 1. Reads current metadata to preserve existing values
 * 2. Uploads new avatar to Bulletin if provided
 * 3. Calls RestaurantMeta.setMetadata() to update on-chain
 */
export function useRealUpdateRestaurant(): UseUpdateRestaurantResult {
  const { core, restaurantMeta, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const updateRestaurant = useCallback(
    async (input: UpdateRestaurantInput): Promise<void> => {
      if (!core || !restaurantMeta || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }

      // Get restaurant ID (convert SS58 to EVM address)
      const evmAddress = toEvmAddress(account.address);
      const restaurantId = await core.read<bigint>('ownerToRestaurant', [
        evmAddress,
      ]);

      if (!restaurantId || restaurantId === 0n) {
        throw new Error('Restaurant not found for this account');
      }

      // Fetch existing metadata to preserve values we're not updating
      const metaResult = (await restaurantMeta.read('getMetadata', [
        restaurantId,
      ])) as [string, string, string, string, bigint];

      let currentDescription = metaResult[0];
      let currentAvatar = metaResult[1];
      const currentMenuCID = metaResult[2];
      const currentCategory = metaResult[3];

      // Update description if provided
      if (input.description !== undefined) {
        currentDescription = input.description;
      }

      // Upload new avatar if provided
      if (input.avatarFile && BULLETIN_ENDPOINT) {
        try {
          const bytes = new Uint8Array(await input.avatarFile.arrayBuffer());
          const result = await uploadToBulletin(bytes, {
            bulletinEndpoint: BULLETIN_ENDPOINT,
          });
          currentAvatar = cidToDisplayUrl(result.cid);
        } catch (uploadErr) {
          console.error('Failed to upload avatar:', uploadErr);
          throw new Error(
            'Failed to upload restaurant photo. Please try again.',
          );
        }
      }

      // Update metadata on-chain
      const writeResult = await restaurantMeta.write(
        'setMetadata',
        [currentDescription, currentAvatar, currentMenuCID, currentCategory],
        account.address,
      );
      const metaTx = writeResult.send();
      await signAndSubmitWithTimeout(metaTx, signer);
    },
    [core, restaurantMeta, isConnected, account, signer],
  );

  return { updateRestaurant };
}
