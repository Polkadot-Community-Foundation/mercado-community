import type { MatchMakerTuple } from '../contract-tuples';

export interface DecodedMatchMaker {
  id: string;
  owner: string;
  name: string;
  feePercentage: number;
  registeredAt: number;
  active: boolean;
}

/**
 * Decode a matchmaker tuple from MercadoMatchmakers.getMatchMaker().
 * Returns null if the matchmaker doesn't exist (id is 0).
 */
export function decodeMatchMakerTuple(
  tuple: MatchMakerTuple,
): DecodedMatchMaker | null {
  const [id, owner, name, feePercentage, registeredAt, active] = tuple;

  if (id === 0n) {
    return null;
  }

  return {
    id: id.toString(),
    owner,
    name,
    feePercentage,
    registeredAt: Number(registeredAt) * 1000,
    active,
  };
}
