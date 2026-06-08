import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { ReactNode } from 'react';

import { DishList } from '../DishList';
import { calculateRating } from '../../lib';
import type { Restaurant, Dish } from '../../types';

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
  const index =
    id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    PLACEHOLDER_COVERS.length;
  return PLACEHOLDER_COVERS[index];
}

type RestaurantDetailProps = {
  restaurant: Restaurant;
  showCheckout: boolean;
  cartItemCount: number;
  onDishClick: (dish: Dish) => void;
  children?: ReactNode;
};

export function RestaurantDetail({
  restaurant,
  showCheckout,
  cartItemCount,
  onDishClick,
  children,
}: RestaurantDetailProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const cover = restaurant.avatarUrl || getPlaceholderCover(restaurant.id);
  const rating = calculateRating(restaurant.ratingSum, restaurant.ratingCount);

  return (
    <>
      {/* Hero banner with cover image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brand via-brand-dark to-gray-800 sm:h-64">
        {!imageError && (
          <img
            src={cover}
            alt={restaurant.name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/30 px-3 py-1.5 text-sm text-white/90 backdrop-blur-sm transition-colors hover:bg-black/50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Status badge */}
        <div className="absolute left-4 top-14">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold shadow-sm backdrop-blur-sm ${
              restaurant.isOpen
                ? 'bg-success/90 text-white'
                : 'bg-dark-secondary/80 text-light-tertiary'
            }`}
          >
            {restaurant.isOpen ? 'Open now' : 'Closed'}
          </span>
        </div>

        {/* Restaurant info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
              {restaurant.name}
            </h1>
            <p className="mt-1 text-white/90 drop-shadow-sm">
              {restaurant.description}
            </p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* Stats row */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-light-border bg-white p-4 shadow-sm">
          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/20">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <div className="font-semibold text-text-primary">
                {rating.toFixed(1)}
              </div>
              <div className="text-xs text-text-tertiary">
                {restaurant.ratingCount} reviews
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-light-border" />

          {/* Delivery time */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-faded">
              <span className="text-lg">🚀</span>
            </div>
            <div>
              <div className="font-semibold text-text-primary">20-35 min</div>
              <div className="text-xs text-text-tertiary">Pickup time</div>
            </div>
          </div>
        </div>

        {/* Menu section */}
        <div className="rounded-xl border border-light-border bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-text-primary">Menu</h2>
          <DishList dishes={restaurant.dishes} onDishClick={onDishClick} />
        </div>

        {/* Checkout button */}
        {showCheckout && (
          <div className="mt-6">
            <Link
              to="/checkout"
              className="bg-gradient-brand btn-tactile focus-ring block w-full rounded-xl px-6 py-4 text-center font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg"
            >
              View cart ({cartItemCount} items)
            </Link>
          </div>
        )}

        {children}
      </div>
    </>
  );
}
