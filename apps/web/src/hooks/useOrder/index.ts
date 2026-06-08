import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useOrder(orderId: string) {
  return useDataContext().useOrder(orderId);
}
