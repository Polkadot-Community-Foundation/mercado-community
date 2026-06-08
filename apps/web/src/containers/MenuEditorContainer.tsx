import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Dish } from '@mercado/types';
import { uploadToBulletin } from '@mercado/bulletin';

import { useSetMenu, useRestaurant, useAccountInfo } from '../hooks';
import {
  MenuEditor,
  type MenuEditorDish,
  type DishWithPhoto,
} from '../components';
import { BULLETIN_ENDPOINT, cidToDisplayUrl } from '../lib/bulletinConfig';

/**
 * Container for editing restaurant menu.
 * Loads current menu from restaurant data, allows editing,
 * and saves to Bulletin Chain + on-chain metadata.
 */
export function MenuEditorContainer() {
  const navigate = useNavigate();
  const { setMenu } = useSetMenu();
  const { restaurantId } = useAccountInfo();
  const { restaurant, isLoading: isRestaurantLoading } = useRestaurant(
    restaurantId ?? '',
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Price flow:
  // - Storage (Bulletin JSON): wei (1e18 scale, e.g., 12.5 DOT = 12500000000000000000)
  // - After hydrateMenu(): cents (e.g., 1250 for $12.50)
  // - Editor display: dollars as string (e.g., "12.50")
  // - MenuEditor.handleSave(): converts back to wei (* 1e18) for contract
  const initialDishes: MenuEditorDish[] | undefined = restaurant?.dishes.map(
    (dish): MenuEditorDish => ({
      id: dish.id,
      name: dish.name,
      description: dish.description,
      basePrice: (Number(dish.basePrice) / 100).toFixed(2), // cents → dollars
      inStock: dish.inStock,
      options: dish.options.map((opt) => ({
        id: opt.id,
        name: opt.name,
        price: (Number(opt.price) / 100).toFixed(2), // cents → dollars
      })),
      photoUrl: dish.photoUrl,
    }),
  );

  const handleSave = async (dishes: DishWithPhoto[]) => {
    setIsLoading(true);
    setError(null);

    try {
      // Upload photos to Bulletin and replace photoFile with photoUrl
      const dishesWithUploadedPhotos: Dish[] = [];
      const failedUploads: string[] = [];

      for (const dish of dishes) {
        const { photoFile, ...dishWithoutFile } = dish;

        if (photoFile && BULLETIN_ENDPOINT) {
          try {
            const bytes = new Uint8Array(await photoFile.arrayBuffer());
            const result = await uploadToBulletin(bytes, {
              bulletinEndpoint: BULLETIN_ENDPOINT,
            });
            // Replace photoFile with display URL
            dishesWithUploadedPhotos.push({
              ...dishWithoutFile,
              photoUrl: cidToDisplayUrl(result.cid),
            });
          } catch {
            // Photo upload failed - save dish without the new photo
            failedUploads.push(dish.name || 'Unnamed dish');
            // Keep existing photoUrl if any, otherwise no photo
            dishesWithUploadedPhotos.push(dishWithoutFile);
          }
        } else {
          // No new photo to upload
          dishesWithUploadedPhotos.push(dishWithoutFile);
        }
      }

      await setMenu(dishesWithUploadedPhotos);

      if (failedUploads.length > 0) {
        // Menu saved, but some photos failed
        alert(
          `Menu saved, but photo upload failed for: ${failedUploads.join(', ')}. You can try uploading photos again later.`,
        );
      }

      navigate('/restaurant-portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save menu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!restaurantId) {
    return (
      <div className="py-8 text-center text-text-tertiary">
        Please register your restaurant first.
      </div>
    );
  }

  // Wait for restaurant data to load before rendering editor
  // This ensures initialDishes is populated correctly
  if (isRestaurantLoading) {
    return (
      <div className="py-8 text-center text-text-tertiary">Loading menu...</div>
    );
  }

  // Show error if restaurant failed to load (prevents blank menu overwrite)
  if (!restaurant) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">
          Unable to load restaurant data. Please try again.
        </p>
        <button
          type="button"
          onClick={() => navigate('/restaurant-portal')}
          className="text-brand hover:text-brand-dark transition-colors"
        >
          Back to portal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Edit Menu</h1>
        <p className="text-text-secondary">
          Add and manage dishes for your restaurant.
        </p>
      </div>

      <MenuEditor
        initialDishes={initialDishes}
        onSave={handleSave}
        isLoading={isLoading}
        error={error}
      />

      <button
        type="button"
        onClick={() => navigate('/restaurant-portal')}
        className="w-full rounded-lg border border-light-border py-3 text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors"
        disabled={isLoading}
      >
        Cancel
      </button>
    </div>
  );
}
