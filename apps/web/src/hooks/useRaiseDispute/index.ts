import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useRaiseDispute() {
  return useDataContext().useRaiseDispute();
}
