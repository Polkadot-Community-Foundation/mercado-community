import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useAdvanceOrderStatus() {
  return useDataContext().useAdvanceOrderStatus();
}
