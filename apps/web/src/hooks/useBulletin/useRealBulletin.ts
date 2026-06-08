import { useCallback } from 'react';
import { uploadToBulletin, calculateCID } from '@mercado/bulletin';
import type { DisputeEvidence } from '@mercado/types';

import type { UseBulletinResult } from '../../contexts/DataContext/DataContext';
import { BULLETIN_ENDPOINT } from '../../lib/bulletinConfig';

/**
 * Real implementation of Bulletin Chain upload.
 * Uploads evidence metadata and photos to Bulletin Chain.
 */
export function useRealBulletin(): UseBulletinResult {
  const uploadEvidence = useCallback(
    async (evidence: DisputeEvidence, photos?: File[]): Promise<string> => {
      if (!BULLETIN_ENDPOINT) {
        throw new Error(
          'Bulletin Chain not configured. Set VITE_BULLETIN_ENDPOINT.',
        );
      }

      // Upload photos first and collect CIDs
      const photoCIDs: string[] = [];
      if (photos && photos.length > 0) {
        for (const photo of photos) {
          const bytes = new Uint8Array(await photo.arrayBuffer());
          const result = await uploadToBulletin(bytes, {
            bulletinEndpoint: BULLETIN_ENDPOINT,
          });
          photoCIDs.push(result.cid);
        }
      }

      // Create evidence with photo CIDs
      const evidenceWithPhotos: DisputeEvidence = {
        ...evidence,
        photos: photoCIDs.length > 0 ? photoCIDs : undefined,
      };

      // Upload the metadata JSON
      const metadataBytes = new TextEncoder().encode(
        JSON.stringify(evidenceWithPhotos, null, 2),
      );
      const result = await uploadToBulletin(metadataBytes, {
        bulletinEndpoint: BULLETIN_ENDPOINT,
      });

      return result.cid;
    },
    [],
  );

  return { uploadEvidence };
}

/**
 * Calculate CID locally without uploading (for preview/validation)
 */
export function useCalculateCID() {
  return useCallback((data: Uint8Array): string => {
    return calculateCID(data);
  }, []);
}
