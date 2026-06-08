import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useMatchMakerId(address?: string | null) {
  return useDataContext().useMatchMakerId(address);
}
