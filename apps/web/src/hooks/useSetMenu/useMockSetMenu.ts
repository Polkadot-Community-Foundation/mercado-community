import { useCallback } from 'react';
import type { Dish } from '@mercado/types';

import type { UseSetMenuResult } from '../../contexts/DataContext/DataContext';

/**
 * Mock implementation of menu upload.
 * Returns a fake CID after a simulated delay.
 */
export function useMockSetMenu(): UseSetMenuResult {
  const setMenu = useCallback(async (dishes: Dish[]): Promise<string> => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate a fake CID based on dishes content
    const hash = dishes
      .map((d) => d.name)
      .join('-')
      .replace(/\s/g, '');
    const fakeCID = `Qm${hash.slice(0, 44).padEnd(44, 'x')}`;

    console.log('[Mock] Menu uploaded with CID:', fakeCID, 'Dishes:', dishes);

    return fakeCID;
  }, []);

  return { setMenu };
}
