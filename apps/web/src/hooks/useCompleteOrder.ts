import { useDataContext } from '../contexts/DataContext';

export function useCompleteOrder() {
  return useDataContext().useCompleteOrder();
}
