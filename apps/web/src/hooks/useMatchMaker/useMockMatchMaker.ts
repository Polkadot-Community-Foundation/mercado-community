import { useMockStore } from '../../stores';
import type { UseMatchMakerResult } from '../../contexts/DataContext/DataContext';

export function useMockMatchMaker(id: string): UseMatchMakerResult {
  const { data } = useMockStore();
  const matchMaker = data.matchMakers.find((m) => m.id === id) ?? null;
  return { matchMaker };
}
