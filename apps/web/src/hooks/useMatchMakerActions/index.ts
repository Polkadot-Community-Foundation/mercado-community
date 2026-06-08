import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useMatchMakerActions() {
  return useDataContext().useMatchMakerActions();
}
