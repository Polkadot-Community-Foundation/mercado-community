import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useMatchMaker(id: string) {
  return useDataContext().useMatchMaker(id);
}
