import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useSetMenu() {
  return useDataContext().useSetMenu();
}

export { useMockSetMenu } from './useMockSetMenu';
export { useRealSetMenu } from './useRealSetMenu';
