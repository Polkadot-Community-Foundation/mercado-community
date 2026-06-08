import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useAccountInfo() {
  return useDataContext().useAccountInfo();
}
