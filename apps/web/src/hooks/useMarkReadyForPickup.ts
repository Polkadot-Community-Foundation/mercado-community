import { useDataContext } from '../contexts/DataContext';

export function useMarkReadyForPickup() {
  return useDataContext().useMarkReadyForPickup();
}
