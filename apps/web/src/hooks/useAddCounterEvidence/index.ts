import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useAddCounterEvidence() {
  return useDataContext().useAddCounterEvidence();
}
