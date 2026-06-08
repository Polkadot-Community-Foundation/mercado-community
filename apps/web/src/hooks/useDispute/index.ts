import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useDispute(disputeId: string) {
  return useDataContext().useDispute(disputeId);
}
