import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useLocations() {
  return useDataContext().useLocations();
}
