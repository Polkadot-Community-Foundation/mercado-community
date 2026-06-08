import { useState } from 'react';
import { useNavigate } from 'react-router';
import { uploadToBulletin } from '@mercado/bulletin';

import { useLocations, useRegisterRestaurant } from '../hooks';
import {
  RegisterRestaurantForm,
  type RegisterRestaurantFormData,
} from '../components/RegisterRestaurantForm';
import { BULLETIN_ENDPOINT, cidToDisplayUrl } from '../lib/bulletinConfig';

export function RegisterRestaurantContainer() {
  const navigate = useNavigate();
  const { locations } = useLocations();
  const { register } = useRegisterRestaurant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: RegisterRestaurantFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Upload avatar to Bulletin if provided
      let avatarUrl: string | undefined;
      let avatarUploadFailed = false;

      if (data.avatarFile && BULLETIN_ENDPOINT) {
        try {
          const bytes = new Uint8Array(await data.avatarFile.arrayBuffer());
          const result = await uploadToBulletin(bytes, {
            bulletinEndpoint: BULLETIN_ENDPOINT,
          });
          avatarUrl = cidToDisplayUrl(result.cid);
        } catch {
          // Avatar upload failed - continue registration without avatar
          avatarUploadFailed = true;
        }
      }

      await register({
        name: data.name,
        location: data.location,
        description: data.description,
        avatarUrl,
        category: data.category,
      });

      if (avatarUploadFailed) {
        alert(
          'Restaurant registered, but photo upload failed. You can add a photo later from the portal settings.',
        );
      }

      navigate('/restaurant-portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterRestaurantForm
      locations={locations}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
