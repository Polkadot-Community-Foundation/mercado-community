import { useSearchParams } from 'react-router';

import { useRestaurants } from '../hooks';
import { RestaurantList } from '../components';

type RestaurantListContainerProps = {
  category?: string | null;
};

export function RestaurantListContainer({
  category,
}: RestaurantListContainerProps) {
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') ?? '';
  const { restaurants, isLoading } = useRestaurants(location, category);

  return <RestaurantList restaurants={restaurants} isLoading={isLoading} />;
}
