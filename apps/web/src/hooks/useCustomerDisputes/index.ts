import { useDataContext } from '../../contexts/DataContext/DataContext';

export function useCustomerDisputes() {
  return useDataContext().useCustomerDisputes();
}
