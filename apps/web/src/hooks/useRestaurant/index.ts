import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useRestaurant(id: string) {
  return useDataContext().useRestaurant(id);
}
