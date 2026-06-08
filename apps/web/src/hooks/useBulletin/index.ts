import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useBulletin() {
  return useDataContext().useBulletin();
}
