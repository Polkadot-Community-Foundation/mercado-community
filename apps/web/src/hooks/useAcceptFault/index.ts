import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useAcceptFault() {
  return useDataContext().useAcceptFault();
}
