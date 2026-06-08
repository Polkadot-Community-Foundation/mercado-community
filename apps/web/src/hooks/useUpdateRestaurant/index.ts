import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useUpdateRestaurant() {
  return useDataContext().useUpdateRestaurant();
}

export { useMockUpdateRestaurant } from './useMockUpdateRestaurant';
export { useRealUpdateRestaurant } from './useRealUpdateRestaurant';
