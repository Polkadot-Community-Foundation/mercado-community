import { useNavigate } from 'react-router';

import { useLocations } from '../hooks';
import { LocationSelector } from '../components';

export function LocationSelectorContainer() {
  const navigate = useNavigate();
  const { locations } = useLocations();

  return (
    <LocationSelector
      locations={locations}
      onSelect={(location) =>
        navigate(`/restaurants?location=${encodeURIComponent(location)}`)
      }
    />
  );
}
