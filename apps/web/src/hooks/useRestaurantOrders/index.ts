import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useRestaurantOrders() {
  return useDataContext().useRestaurantOrders();
}
