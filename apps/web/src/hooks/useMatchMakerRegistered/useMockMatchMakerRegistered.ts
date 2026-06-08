import { useMockStore } from '../../stores';
import type { UseMatchMakerRegisteredResult } from '../../contexts/DataContext/DataContext';

export function useMockMatchMakerRegistered(
  address?: string | null,
): UseMatchMakerRegisteredResult {
  const { data } = useMockStore();
  const isRegistered = address ? !!data.matchMakerIdByOwner[address] : false;
  return { isRegistered };
}
