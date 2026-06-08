#!/usr/bin/env npx tsx
/**
 * Upload placeholder images to Bulletin Chain.
 *
 * Usage:
 *   BULLETIN_ENDPOINT=wss://paseo-bulletin-rpc.polkadot.io \
 *   IPFS_GATEWAY=https://paseo-ipfs.polkadot.io/ipfs/ \
 *   npx tsx packages/bulletin/scripts/upload-placeholders.ts
 *
 * This script downloads Unsplash placeholder images and uploads them to
 * Bulletin Chain, outputting the CIDs and gateway URLs.
 */

// Node.js WebSocket polyfill - must be before polkadot-api imports
import { WebSocket } from 'ws';
(globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket =
  WebSocket;

import { batchUploadToBulletin, BatchUploadItem } from '../src/bulletin.js';
import { calculateCID } from '../src/cid.js';

// Unsplash photo IDs used across the app
const UNSPLASH_PHOTOS = [
  'photo-1504674900247-0877df9cc836', // Food platter
  'photo-1493770348161-369560ae357d', // Breakfast
  'photo-1476224203421-9ac39bcb3327', // Pasta
  'photo-1565299624946-b28f40a0ae38', // Pizza
  'photo-1540189549336-e6e99c3679fe', // Vegetables
  'photo-1567620905732-2d1ec7ab7445', // Pancakes
];

// Download image from Unsplash at specified width
async function downloadImage(
  photoId: string,
  width: number,
): Promise<Uint8Array> {
  const url = `https://images.unsplash.com/${photoId}?w=${width}&q=80&fit=crop`;
  console.log(`  Downloading ${photoId} (${width}px)...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${photoId}: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

async function main() {
  const bulletinEndpoint = process.env.BULLETIN_ENDPOINT;
  const ipfsGateway = process.env.IPFS_GATEWAY;

  if (!bulletinEndpoint || !ipfsGateway) {
    console.error('Missing required environment variables:');
    console.error('  BULLETIN_ENDPOINT - WebSocket URL for Bulletin Chain');
    console.error(
      '  IPFS_GATEWAY - IPFS gateway URL for display URLs (must end with /)',
    );
    console.error('\nExample:');
    console.error(
      '  BULLETIN_ENDPOINT=wss://paseo-bulletin-rpc.polkadot.io \\',
    );
    console.error('  IPFS_GATEWAY=https://paseo-ipfs.polkadot.io/ipfs/ \\');
    console.error('  npx tsx packages/bulletin/scripts/upload-placeholders.ts');
    process.exit(1);
  }

  console.log('=== Bulletin Chain Placeholder Image Upload ===\n');
  console.log(`Bulletin endpoint: ${bulletinEndpoint}`);
  console.log(`IPFS gateway: ${ipfsGateway}`);
  console.log();

  // Download all images first (at 800px width - good for all use cases)
  console.log('Downloading images from Unsplash...');
  const files: BatchUploadItem[] = [];
  const cidMap: Map<string, string> = new Map();

  for (const photoId of UNSPLASH_PHOTOS) {
    const imageBytes = await downloadImage(photoId, 800);
    const cid = calculateCID(imageBytes);
    cidMap.set(photoId, cid);
    files.push({ fileBytes: imageBytes, label: photoId });
  }

  console.log();

  // Upload all images
  console.log(`Uploading ${files.length} image(s) to Bulletin Chain...`);
  console.log('(This may take a minute per image)\n');

  const results = await batchUploadToBulletin(files, {
    bulletinEndpoint,
    onProgress: (completed, total, result) => {
      const status = result.success ? '✓' : '✗';
      console.log(
        `  [${completed}/${total}] ${status} ${result.label}: ${result.cid}`,
      );
      if (!result.success) {
        console.log(`      Error: ${result.error}`);
      }
    },
  });

  // Update cidMap with results
  for (const result of results) {
    if (result.success) {
      cidMap.set(result.label, result.cid);
    }
  }

  console.log();

  // Output summary
  console.log('=== Summary ===\n');
  console.log('Add these to your code:\n');

  console.log('const PLACEHOLDER_COVERS = [');
  for (const photoId of UNSPLASH_PHOTOS) {
    const cid = cidMap.get(photoId)!;
    console.log(`  '${ipfsGateway}${cid}', // ${photoId}`);
  }
  console.log('];');

  console.log('\n// For LandingPage hero:');
  const heroPhoto = UNSPLASH_PHOTOS[0];
  const heroCid = cidMap.get(heroPhoto)!;
  console.log(`const HERO_IMAGE = '${ipfsGateway}${heroCid}';`);

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
