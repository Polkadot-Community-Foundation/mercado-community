import { useDataContext } from '../../contexts/DataContext/DataContext';

export function usePlaceOrder() {
  return useDataContext().usePlaceOrder();
}
