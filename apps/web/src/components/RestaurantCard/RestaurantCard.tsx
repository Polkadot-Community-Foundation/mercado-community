import { useState } from 'react';
import { Link } from 'react-router';

import { calculateRating } from '../../lib';

type RestaurantCardProps = {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  isOpen: boolean;
  ratingSum: number;
  ratingCount: number;
  deliveryTime?: string;
};

// Placeholder food images for restaurants without covers (hosted on Bulletin/IPFS)
const PLACEHOLDER_COVERS = [
  'https://paseo-ipfs.polkadot.io/ipfs/bafk2bzacecqjgqgpt2aer3ls6umq4a4wfygvqv64pjllv33oyeuzucz6dze44',
  'https://paseo-ipfs.polkadot.io/ipfs/bafk2bzaced5yodrblihghtx527vsc6xivxsr7fq5o5xsuqfl7kecpwo5efwtq',
  'https://paseo-ipfs.polkadot.io/ipfs/bafk2bzaceapong7kvtuid6twi7qcfbvcppuu2au6r5obu3j6luoweiq6sku4s',
  'https://paseo-ipfs.polkadot.io/ipfs/bafk2bzacedfjndahvfazmjp2wx2f7lynj4uwsmkqrd4wwbgydzqdldqlbup2m',
  'https://paseo-ipfs.polkadot.io/ipfs/bafk2bzacecdyv44farkxdyy5j72pmgdtmpztpjtnfp4w7p55ygh5zhkicuamu',
  'https://paseo-ipfs.polkadot.io/ipfs/bafk2bzacebzoo4lohy667c55msv3t3ip2t57z5nyzaw6sghfv5mxwg3nsycmu',
];

function getPlaceholderCover(id: string): string {
  // Use restaurant id to deterministically select a placeholder
  const index =
    id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    PLACEHOLDER_COVERS.length;
  return PLACEHOLDER_COVERS[index];
}

export function RestaurantCard({
  id,
  name,
  description,
  avatarUrl,
  isOpen,
  ratingSum,
  ratingCount,
  deliveryTime = '20-35 min',
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);
  // Use avatar or placeholder
  const cover = avatarUrl || getPlaceholderCover(id);
  const rating = calculateRating(ratingSum, ratingCount);

  return (
    <Link
      to={`/restaurants/${id}`}
      className="card-interactive focus-ring group block overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand/20 via-brand/10 to-brand-dark/20">
        {!imageError && (
          <img
            src={cover}
            alt={name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {imageError && (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {/* Status badge */}
        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
              isOpen
                ? 'bg-success/90 text-white'
                : 'bg-dark-secondary/80 text-light-tertiary'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        {/* Delivery time badge */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-text-primary shadow-sm backdrop-blur-sm">
            {deliveryTime}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text-primary line-clamp-1">
            {name}
          </h3>
          {/* Rating */}
          <div className="flex shrink-0 items-center gap-1 rounded-md bg-light-secondary px-1.5 py-0.5">
            <span className="text-sm">⭐</span>
            <span className="text-xs font-semibold text-text-primary">
              {rating.toFixed(1)}
            </span>
            <span className="text-xs text-text-tertiary">({ratingCount})</span>
          </div>
        </div>
        <p className="line-clamp-1 text-sm text-text-secondary">
          {description}
        </p>
      </div>
    </Link>
  );
}
