import { useCallback } from 'react';

import type {
  UseUpdateRestaurantResult,
  UpdateRestaurantInput,
} from '../../contexts/DataContext/DataContext';

/**
 * Mock implementation of restaurant profile update.
 * Simulates a delay and logs the update.
 */
export function useMockUpdateRestaurant(): UseUpdateRestaurantResult {
  const updateRestaurant = useCallback(
    async (input: UpdateRestaurantInput): Promise<void> => {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('[Mock] Restaurant profile updated:', {
        description: input.description,
        hasAvatarFile: !!input.avatarFile,
        avatarFileName: input.avatarFile?.name,
      });
    },
    [],
  );

  return { updateRestaurant };
}
