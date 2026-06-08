import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useMatchMakerRegistered(address?: string | null) {
  return useDataContext().useMatchMakerRegistered(address);
}
