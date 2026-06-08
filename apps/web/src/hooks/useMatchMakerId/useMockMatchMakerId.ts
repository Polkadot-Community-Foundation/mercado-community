import { useMockStore } from '../../stores';
import type { UseMatchMakerIdResult } from '../../contexts/DataContext/DataContext';

export function useMockMatchMakerId(
  address?: string | null,
): UseMatchMakerIdResult {
  const { data } = useMockStore();
  const matchMakerId = address
    ? (data.matchMakerIdByOwner[address] ?? null)
    : null;
  return { matchMakerId };
}
