import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useCustomerOrders() {
  return useDataContext().useCustomerOrders();
}
