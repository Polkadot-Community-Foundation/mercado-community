import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useRestaurantDisputes() {
  return useDataContext().useRestaurantDisputes();
}
