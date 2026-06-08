import { Verdict } from '../dispute';
import type { DisputeTuple } from '../contract-tuples';

const VERDICT_MAP: Record<number, Verdict> = {
  0: Verdict.Pending,
  1: Verdict.CustomerWins,
  2: Verdict.RestaurantWins,
};

export interface DecodedDispute {
  orderId: string;
  initiator: string;
  evidenceCID: string;
  counterCID: string | undefined;
  initiatorStake: bigint;
  challengerStake: bigint;
  createdAt: number;
  verdict: Verdict;
  claimed: boolean;
  faultAccepted: boolean;
  resolvedAt: number | undefined;
}

/**
 * Decode a dispute tuple from MercadoDisputes.disputes().
 * Returns null if the dispute doesn't exist (orderId is 0).
 */
export function decodeDisputeTuple(tuple: DisputeTuple): DecodedDispute | null {
  const [
    orderId,
    initiator,
    evidenceCID,
    counterCID,
    initiatorStake,
    challengerStake,
    createdAt,
    verdict,
    claimed,
    faultAccepted,
    resolvedAt,
  ] = tuple;

  if (orderId === 0n) {
    return null;
  }

  return {
    orderId: orderId.toString(),
    initiator,
    evidenceCID,
    counterCID: counterCID || undefined,
    initiatorStake,
    challengerStake,
    createdAt: Number(createdAt) * 1000,
    verdict: VERDICT_MAP[verdict] ?? Verdict.Pending,
    claimed,
    faultAccepted,
    resolvedAt: resolvedAt > 0n ? Number(resolvedAt) * 1000 : undefined,
  };
}
