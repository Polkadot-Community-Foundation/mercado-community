import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useRateRestaurant() {
  return useDataContext().useRateRestaurant();
}
