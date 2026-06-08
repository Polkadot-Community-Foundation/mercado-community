import { RestaurantCard } from '../RestaurantCard';
import { LoadingSpinner } from '../LoadingSpinner';

type RestaurantListProps = {
  restaurants: {
    id: string;
    name: string;
    description: string;
    avatarUrl?: string;
    isOpen: boolean;
    ratingSum: number;
    ratingCount: number;
    deliveryTime?: string;
  }[];
  isLoading?: boolean;
};

export function RestaurantList({
  restaurants,
  isLoading = false,
}: RestaurantListProps) {
  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <LoadingSpinner />
        <p className="mt-2 text-text-secondary">Finding restaurants...</p>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="rounded-2xl border border-light-border bg-white p-12 text-center">
        <p className="text-4xl">🍽️</p>
        <p className="mt-4 font-medium text-text-primary">
          No restaurants found
        </p>
        <p className="mt-1 text-sm text-text-secondary">
          Try selecting a different category or location.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {restaurants.map((r) => (
        <RestaurantCard
          key={r.id}
          id={r.id}
          name={r.name}
          description={r.description}
          avatarUrl={r.avatarUrl}
          isOpen={r.isOpen}
          ratingSum={r.ratingSum}
          ratingCount={r.ratingCount}
          deliveryTime={r.deliveryTime}
        />
      ))}
    </div>
  );
}
