import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useCancelOrder() {
  return useDataContext().useCancelOrder();
}
