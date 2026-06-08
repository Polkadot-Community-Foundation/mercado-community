import { useMemo } from 'react';

import { useMockStore } from '../../stores';
import type { UseLocationsResult } from '../../contexts/DataContext/DataContext';

export function useMockLocations(): UseLocationsResult {
  const { data } = useMockStore();
  return useMemo(() => ({ locations: data.locations }), [data.locations]);
}
