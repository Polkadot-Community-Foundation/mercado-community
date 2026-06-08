import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useRestaurants(location: string, category?: string | null) {
  return useDataContext().useRestaurants(location, category);
}
