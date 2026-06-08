import { useCallback } from 'react';
import { uploadToBulletin } from '@mercado/bulletin';
import type { Dish } from '@mercado/types';
import { useAuth } from '@mercado/core-hooks';

import { useContracts } from '../../contexts/ContractsContext';
import type { UseSetMenuResult } from '../../contexts/DataContext/DataContext';
import { signAndSubmitWithTimeout, toEvmAddress } from '../../lib/contracts';
import { BULLETIN_ENDPOINT } from '../../lib/bulletinConfig';

/**
 * Real implementation of menu upload using Bulletin Chain and RestaurantMeta.
 *
 * 1. Uploads menu JSON to Bulletin Chain
 * 2. Calls RestaurantMeta.setMetadata() to store the CID on-chain
 */
export function useRealSetMenu(): UseSetMenuResult {
  const { core, restaurantMeta, isConnected } = useContracts();
  const { account, signer } = useAuth();

  const setMenu = useCallback(
    async (dishes: Dish[]): Promise<string> => {
      if (!core || !restaurantMeta || !isConnected) {
        throw new Error('Contracts not connected');
      }
      if (!account || !signer) {
        throw new Error('Not signed in');
      }
      if (!BULLETIN_ENDPOINT) {
        throw new Error(
          'Bulletin Chain not configured. Set VITE_BULLETIN_ENDPOINT.',
        );
      }

      // Serialize dishes with proper bigint handling
      const menuData = {
        version: 1,
        updatedAt: new Date().toISOString(),
        dishes: dishes.map((dish) => ({
          ...dish,
          basePrice: dish.basePrice.toString(),
          options: dish.options.map((opt) => ({
            ...opt,
            price: opt.price.toString(),
          })),
        })),
      };

      // Upload menu JSON to Bulletin Chain
      const menuBytes = new TextEncoder().encode(
        JSON.stringify(menuData, null, 2),
      );
      const result = await uploadToBulletin(menuBytes, {
        bulletinEndpoint: BULLETIN_ENDPOINT,
      });

      const menuCID = result.cid;

      // Get current metadata to preserve description, avatar, and category
      const evmAddress = toEvmAddress(account.address);
      const restaurantId = await core.read<bigint>('ownerToRestaurant', [
        evmAddress,
      ]);

      if (!restaurantId || restaurantId === 0n) {
        throw new Error('Restaurant not found for this account');
      }

      // Fetch existing metadata - contract returns empty strings for new restaurants
      // Let network errors propagate to prevent data loss on transient failures
      const metaResult = (await restaurantMeta.read('getMetadata', [
        restaurantId,
      ])) as [string, string, string, string, bigint];

      const currentDescription = metaResult[0];
      const currentAvatar = metaResult[1];
      const currentCategory = metaResult[3];

      // Update metadata with new menu CID
      const writeResult = await restaurantMeta.write(
        'setMetadata',
        [currentDescription, currentAvatar, menuCID, currentCategory],
        account.address,
      );
      const metaTx = writeResult.send();
      await signAndSubmitWithTimeout(metaTx, signer);

      return menuCID;
    },
    [core, restaurantMeta, isConnected, account, signer],
  );

  return { setMenu };
}
