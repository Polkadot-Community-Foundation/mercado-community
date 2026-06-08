import { useCallback } from 'react';
import type { DisputeEvidence } from '@mercado/types';

import { useMockStore } from '../../stores';
import type { UseBulletinResult } from '../../contexts/DataContext/DataContext';

/**
 * Mock implementation of Bulletin Chain upload.
 * Generates a fake CID and stores evidence in local state.
 */
export function useMockBulletin(): UseBulletinResult {
  const { setData } = useMockStore();

  const uploadEvidence = useCallback(
    async (evidence: DisputeEvidence, photos?: File[]): Promise<string> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Generate a fake CID (in real implementation, this would be from Bulletin Chain)
      const cid = `bafkrei${crypto.randomUUID().replace(/-/g, '').slice(0, 32)}`;

      // If photos provided, convert to fake CIDs and add to evidence
      const evidenceWithPhotos: DisputeEvidence = {
        ...evidence,
        photos: photos?.map(
          (_, i) =>
            `bafkreiphoto${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}${i}`,
        ),
      };

      // Store evidence in mock data
      setData((prev) => ({
        ...prev,
        evidenceStore: {
          ...prev.evidenceStore,
          [cid]: evidenceWithPhotos,
        },
      }));

      return cid;
    },
    [setData],
  );

  return { uploadEvidence };
}
