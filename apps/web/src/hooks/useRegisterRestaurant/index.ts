import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useRegisterRestaurant() {
  return useDataContext().useRegisterRestaurant();
}
