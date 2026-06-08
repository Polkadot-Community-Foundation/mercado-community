import { useMemo } from 'react';
import type { DisputeEvidence } from '@mercado/types';

import { useMockStore } from '../../stores';
import type { UseDisputeResult } from '../../contexts/DataContext/DataContext';

export function useMockDispute(disputeId: string): UseDisputeResult {
  const { data } = useMockStore();

  return useMemo(() => {
    const dispute = data.disputes.find((d) => d.id === disputeId);

    let initiatorEvidence: DisputeEvidence | undefined;
    let counterEvidence: DisputeEvidence | undefined;

    if (dispute) {
      initiatorEvidence = data.evidenceStore[dispute.initiatorEvidenceCID];
      if (dispute.counterEvidenceCID) {
        counterEvidence = data.evidenceStore[dispute.counterEvidenceCID];
      }
    }

    return {
      dispute,
      initiatorEvidence,
      counterEvidence,
    };
  }, [data.disputes, data.evidenceStore, disputeId]);
}
