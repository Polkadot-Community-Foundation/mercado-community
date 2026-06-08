import { useState } from 'react';
import { useSearchParams } from 'react-router';

import { CategoryRow } from '../components';
import { RestaurantListContainer } from '../containers';

export function RestaurantsPage() {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') ?? '';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-light-secondary">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-brand to-brand-dark px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Good food, delivered fast</h1>
          <p className="mt-2 text-white/80">
            Browse restaurants in {location || 'your area'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* Category row */}
        <div className="mb-6">
          <CategoryRow
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Feature highlights */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="text-center">
            <p className="font-medium text-text-primary">Free pickup</p>
            <p className="text-sm text-text-secondary">Save on fees</p>
          </div>
          <div className="text-center">
            <p className="flex items-center justify-center gap-1 font-medium text-text-primary">
              <img
                src="/token-logo.png"
                alt=""
                className="h-5 w-5 rounded-full"
              />
              Pay with tokens
            </p>
            <p className="text-sm text-text-secondary">No middleman</p>
          </div>
          <div className="hidden text-center lg:block">
            <p className="font-medium text-text-primary">Fair disputes</p>
            <p className="text-sm text-text-secondary">Community-resolved</p>
          </div>
        </div>

        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text-primary">
            {selectedCategory
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} restaurants`
              : 'All restaurants'}
          </h2>
          <span className="text-sm text-text-secondary">{location}</span>
        </div>

        {/* Restaurant list */}
        <RestaurantListContainer category={selectedCategory} />
      </div>
    </div>
  );
}
