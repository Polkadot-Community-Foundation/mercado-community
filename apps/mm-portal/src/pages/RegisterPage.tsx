import { useNavigate } from 'react-router';
import { useEffect } from 'react';

import { useMatchMakerState } from '../app';
import { RegisterContainer } from '../containers/RegisterContainer';

export function RegisterPage() {
  const navigate = useNavigate();
  const { isConnected, isAuthLoading, matchMaker, address } =
    useMatchMakerState();

  // Redirect to portal if already registered (wait for auth to settle first)
  useEffect(() => {
    if (
      !isAuthLoading &&
      isConnected &&
      matchMaker &&
      matchMaker.owner === address
    ) {
      navigate('/', { replace: true });
    }
  }, [isAuthLoading, isConnected, matchMaker, address, navigate]);

  return <RegisterContainer />;
}
